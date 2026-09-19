import { api } from './api.js'
import { escapeHtml } from './evidence.js'
import { formatDateTime, pageFrame, statusText } from './ui.js'

export function auditRow(record) {
  const counts = record.finding_counts || {}
  return `
    <tr>
      <td><button class="table-link" data-open-audit="${escapeHtml(record.audit_id)}">${escapeHtml(record.org_name)}</button><small>${escapeHtml(record.standard || 'ISO/IEC 27001:2022')}</small></td>
      <td>${escapeHtml(record.audit_date || '—')}</td>
      <td><span class="status-pill status-${escapeHtml(record.status)}">${escapeHtml(statusText(record.status))}</span></td>
      <td><div class="finding-chips">
        ${counts.major_nc ? `<span class="finding-chip major">${counts.major_nc} Major NC</span>` : ''}
        ${counts.minor_nc ? `<span class="finding-chip minor">${counts.minor_nc} Minor NC</span>` : ''}
        ${counts.observation ? `<span class="finding-chip observation">${counts.observation} Observation</span>` : ''}
        ${counts.ofi ? `<span class="finding-chip ofi">${counts.ofi} OFI</span>` : ''}
        ${record.finding_total ? '' : '<span class="muted-value">—</span>'}
      </div></td>
      <td>${escapeHtml(formatDateTime(record.created_at))}</td>
      <td><button class="icon-action" data-open-audit="${escapeHtml(record.audit_id)}" aria-label="Open audit">→</button></td>
    </tr>`
}

export function bindAuditRows(container, onOpenAudit) {
  container.querySelectorAll('[data-open-audit]').forEach(element => {
    element.addEventListener('click', () => {
      onOpenAudit(element.dataset.openAudit).catch(error => alert(error.message))
    })
  })
}

export async function renderAuditLibrary(mode, onOpenAudit) {
  const reportsOnly = mode === 'reports'
  pageFrame(
    mode,
    reportsOnly ? 'Reports' : 'Audit library',
    reportsOnly ? 'Review generated drafts and continue auditor sign-off.' : 'Search every saved evidence pack, draft, and reviewed report.',
    `<section class="library-content"><div class="library-toolbar"><div class="search-field"><span>⌕</span><input id="audit-search" type="search" placeholder="Search organization…" /></div><div class="filter-tabs"><button class="active" data-filter="all">All</button><button data-filter="review">Needs review</button><button data-filter="reviewed">Reviewed</button><button data-filter="edited">Edited</button><button data-filter="pending">Pending</button></div></div><section class="surface library-surface"><div class="library-loading">Loading saved audits…</div></section></section>`,
    '<button class="new-audit-btn" data-route="new">+ New audit</button>'
  )
  const surface = document.querySelector('.library-surface')
  try {
    const allRecords = await api('/audits')
    const records = reportsOnly ? allRecords.filter(record => record.has_report) : allRecords
    let activeFilter = 'all'
    const render = () => {
      const query = document.querySelector('#audit-search').value.trim().toLowerCase()
      const filtered = records.filter(record => {
        const matchesSearch = record.org_name.toLowerCase().includes(query)
        const matchesFilter = activeFilter === 'all'
          || (activeFilter === 'review' && ['awaiting_auditor_review', 'edited_pending_review'].includes(record.status))
          || (activeFilter === 'reviewed' && record.status === 'auditor_reviewed')
          || (activeFilter === 'edited' && record.status === 'edited_pending_review')
          || (activeFilter === 'pending' && record.status === 'ingested')
        return matchesSearch && matchesFilter
      })
      surface.innerHTML = filtered.length
        ? `<div class="table-wrap"><table class="audit-table library-table"><thead><tr><th>Organization</th><th>Audit date</th><th>Status</th><th>Findings</th><th>Created</th><th></th></tr></thead><tbody>${filtered.map(auditRow).join('')}</tbody></table></div>`
        : '<div class="empty-dashboard"><div>⌕</div><h3>No matching audits</h3><p>Try a different search or create a new audit.</p></div>'
      bindAuditRows(surface, onOpenAudit)
    }
    document.querySelector('#audit-search').addEventListener('input', render)
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.filter
      document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button))
      render()
    }))
    render()
  } catch (error) {
    surface.innerHTML = `<div class="load-error"><strong>Could not load saved audits</strong><p>${escapeHtml(error.message)}</p></div>`
  }
}
