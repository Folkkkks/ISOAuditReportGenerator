import './style.css'
import { api, generateSavedAudit } from './api.js'
import { mountReview } from './review.js'
import { mountUpload } from './upload.js'
import { escapeHtml, toAuditForm, redactContacts } from './evidence.js'
import { startUiLocalization, t } from './i18n.js'
import {
  app,
  formatLabel,
  upgradeSidebar
} from './ui.js'
import { downloadMarkdownReport } from './report-export.js'
import { renderEvaluation } from './evaluation.js'
import { auditRow, bindAuditRows, renderAuditLibrary } from './audit-list.js'

let currentRecord = null

function showSavedRecord(record) {
  currentRecord = record
  const response = structuredClone(record.response)
  response.status = record.status
  if (record.judge_stale) {
    response.judgment = { report_grounded: false, judgments: [],
      summary: 'Not evaluated after human edits. Original judgment is historical only; see change history.' }
    response.report.disclaimer = record.status === 'auditor_reviewed'
      ? 'HUMAN-EDITED DRAFT — reviewed by an auditor; AI judgment was not rerun. Not a certification decision.'
      : 'HUMAN-EDITED DRAFT — not re-judged. Draft report for auditor review and sign-off only.'
  }
  renderReportResult(response, toAuditForm(record.input))
}

function countFindings(records, name) {
  return records.reduce((total, record) => total + (record.finding_counts?.[name] || 0), 0)
}

async function openSavedAudit(auditId) {
  const saved = await api(`/audits/${auditId}/report`)
  if (!saved.response) {
    if (!confirm(t('This evidence is saved but has no report. Generate it now? This uses AI quota.'))) return
    showSavedRecord(await api(`/audits/${auditId}/generate`, 'POST'))
    return
  }
  showSavedRecord(saved)
}

async function loadDashboard() {
  const container = document.querySelector('.dashboard-content')
  if (!container) return
  container.innerHTML = '<div class="dashboard-loading"><span></span><p>Loading audit workspace…</p></div>'
  try {
    const records = await api('/audits')
    const major = countFindings(records, 'major_nc')
    const minor = countFindings(records, 'minor_nc')
    const observations = countFindings(records, 'observation')
    const ofi = countFindings(records, 'ofi')
    const findingTotal = major + minor + observations + ofi
    const reviewCount = records.filter(record => ['awaiting_auditor_review', 'edited_pending_review'].includes(record.status)).length
    const recent = records.slice(0, 6)
    const distribution = [
      ['Major NC', major, 'major'], ['Minor NC', minor, 'minor'],
      ['Observations', observations, 'observation'], ['OFI', ofi, 'ofi']
    ]
    container.innerHTML = `
      <section class="dashboard-hero">
        <div><span class="eyebrow">AUDIT OPERATIONS</span><h2>Good evidence makes better decisions.</h2><p>Review active drafts, monitor findings, and move every report toward a documented auditor decision.</p></div>
        <button class="hero-action" data-route="new">Create new audit <span>→</span></button>
      </section>
      <section class="metric-grid">
        <article class="metric-card"><div class="metric-icon navy">▤</div><div><p>Total audits</p><strong>${records.length}</strong><small>Saved locally</small></div></article>
        <article class="metric-card"><div class="metric-icon red">!</div><div><p>Major NC</p><strong>${major}</strong><small>Across saved reports</small></div></article>
        <article class="metric-card"><div class="metric-icon amber">◇</div><div><p>Minor NC</p><strong>${minor}</strong><small>Across saved reports</small></div></article>
        <article class="metric-card"><div class="metric-icon green">✓</div><div><p>Awaiting review</p><strong>${reviewCount}</strong><small>Auditor action required</small></div></article>
      </section>
      <div class="dashboard-grid">
        <section class="surface recent-surface">
          <div class="surface-header"><div><span class="eyebrow">RECENT ACTIVITY</span><h2>Recent audits</h2></div><button class="text-action" data-route="audits">View audit library →</button></div>
          ${recent.length ? `<div class="table-wrap"><table class="audit-table"><thead><tr><th>Organization</th><th>Audit date</th><th>Status</th><th>Findings</th><th>Created</th><th></th></tr></thead><tbody>${recent.map(auditRow).join('')}</tbody></table></div>` : `<div class="empty-dashboard"><div>＋</div><h3>No audits yet</h3><p>Create an audit or import a prepared evidence pack to begin.</p><button class="primary-btn" data-route="new">Create first audit</button></div>`}
        </section>
        <aside class="dashboard-side">
          <section class="surface distribution-card">
            <div class="surface-header"><div><span class="eyebrow">PORTFOLIO</span><h2>Finding mix</h2></div><strong class="total-findings">${findingTotal}</strong></div>
            <div class="distribution-list">${distribution.map(([label, value, className]) => `<div><span><i class="legend-dot ${className}"></i>${label}</span><strong>${value}</strong><div class="bar-track"><i class="bar-fill ${className}" style="width:${findingTotal ? Math.max(5, value / findingTotal * 100) : 0}%"></i></div></div>`).join('')}</div>
          </section>
          <section class="surface evaluation-card"><span class="eyebrow">V1.0.0 FINAL EVALUATION</span><div class="score-ring"><strong>10/10</strong><span>Gold-set cases correct</span></div><div class="score-row"><span>Classification macro F1</span><strong>100%</strong></div><div class="score-row"><span>PRD threshold</span><strong>Passed</strong></div><button class="text-action" data-route="evaluation">View model controls →</button></section>
        </aside>
      </div>`
    bindAuditRows(container, openSavedAudit)
  } catch (error) {
    container.innerHTML = `<div class="load-error"><strong>Dashboard unavailable</strong><p>${escapeHtml(error.message)}</p><button class="secondary-btn" data-retry-dashboard>Try again</button></div>`
    container.querySelector('[data-retry-dashboard]').addEventListener('click', loadDashboard)
  }
}

app.addEventListener('click', event => {
  if (event.defaultPrevented) return
  const route = event.target.closest('[data-route]')?.dataset.route
  if (!route) return
  event.preventDefault()
  if (route === 'dashboard') renderDashboard()
  else if (route === 'new') renderNewAudit()
  else if (route === 'audits') {
    currentRecord = null
    renderAuditLibrary('audits', openSavedAudit)
  } else if (route === 'reports') {
    currentRecord = null
    renderAuditLibrary('reports', openSavedAudit)
  } else if (route === 'evaluation') {
    currentRecord = null
    renderEvaluation()
  }
})

function renderDashboard() {
  currentRecord = null
  app.innerHTML = `
    <div class="app-layout">

      <!-- Sidebar -->
      <aside class="sidebar">

        <div class="logo-section">
          <div class="logo-box">ISO</div>

          <div class="logo-text">
            <h2>ISO Audit</h2>
            <p>Report Generator</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="nav-menu">

          <a href="#" class="nav-item active" data-page="dashboard">
            <span class="nav-icon">▦</span>
            <span>Dashboard</span>
          </a>

          <a href="#" class="nav-item" id="new-audit-nav">
            <span class="nav-icon">＋</span>
            <span>New Audit</span>
          </a>

        </nav>

        <!-- Sidebar bottom -->
        <div class="sidebar-bottom">

          <div class="nav-item">
            <span class="nav-icon">✓</span>
            <span>Draft-only system</span>
          </div>

        </div>

      </aside>

      <!-- Main Content -->
      <main class="main-content">

        <!-- Header -->
        <header class="topbar">

          <div>
            <h1>Dashboard</h1>
            <p>ISO Audit Report Generator</p>
          </div>

          <button class="new-audit-btn" id="new-audit-btn">
            + New Audit
          </button>

        </header>

        <!-- Dashboard Content -->
        <section class="dashboard-content">

          <!-- Welcome Card -->
          <div class="welcome-card">

            <div class="welcome-text">

              <span class="welcome-label">
                AI-ASSISTED ISO AUDITING
              </span>

              <h2>
                Generate clearer audit reports,
                faster.
              </h2>

              <p>
                Submit audit evidence and let the system
                assist with finding classification,
                evidence validation, and draft report
                generation.
              </p>

              <button class="start-audit-btn" id="start-audit-btn">
                Start New Audit →
              </button>

            </div>

            <div class="welcome-visual">

              <div class="iso-circle">
                ISO
              </div>

            </div>

          </div>

          <!-- Workflow -->
          <div class="section-title">

            <div>
              <h2>Audit Workflow</h2>

              <p>
                Follow the process from evidence to draft report
              </p>
            </div>

          </div>

          <div class="workflow-grid">

            <!-- Step 01 -->
            <div class="workflow-card">

              <div class="workflow-number">01</div>

              <div class="workflow-icon">↥</div>

              <h3>Evidence</h3>

              <p>
                Submit interview, checklist,
                and document review evidence.
              </p>

            </div>

            <!-- Step 02 -->
            <div class="workflow-card">

              <div class="workflow-number">02</div>

              <div class="workflow-icon">✦</div>

              <h3>AI Analysis</h3>

              <p>
                Analyze evidence and classify
                potential audit findings.
              </p>

            </div>

            <!-- Step 03 -->
            <div class="workflow-card">

              <div class="workflow-number">03</div>

              <div class="workflow-icon">!</div>

              <h3>Findings</h3>

              <p>
                Review Major NC, Minor NC,
                Observation, and OFI classifications.
              </p>

            </div>

            <!-- Step 04 -->
            <div class="workflow-card">

              <div class="workflow-number">04</div>

              <div class="workflow-icon">✓</div>

              <h3>Validation</h3>

              <p>
                Check whether the evidence
                sufficiently supports the findings.
              </p>

            </div>

            <!-- Step 05 -->
            <div class="workflow-card">

              <div class="workflow-number">05</div>

              <div class="workflow-icon">▧</div>

              <h3>Report</h3>

              <p>
                Review the generated draft report
                before auditor sign-off.
              </p>

            </div>

          </div>

          <!-- System Scope -->
          <div class="section-title">

            <div>
              <h2>System Scope</h2>

              <p>
                What this application is designed to do
              </p>
            </div>

          </div>

          <div class="workflow-grid">

            <div class="workflow-card">

              <div class="workflow-icon">◈</div>

              <h3>Evidence-Based</h3>

              <p>
                Findings are generated from submitted
                audit evidence and retrieved ISO knowledge.
              </p>

            </div>

            <div class="workflow-card">

              <div class="workflow-icon">✓</div>

              <h3>Evidence Judge</h3>

              <p>
                Generated findings are checked for
                sufficient supporting evidence.
              </p>

            </div>

            <div class="workflow-card">

              <div class="workflow-icon">▧</div>

              <h3>Draft Report</h3>

              <p>
                The system generates a draft audit report
                for auditor review.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  `

  // Upgrade the shared shell, then hydrate live portfolio data.
  upgradeSidebar('dashboard')
  loadDashboard()
  document
    .querySelector('#new-audit-btn')
    .addEventListener('click', () => renderNewAudit())

  // Start New Audit button
  document
    .querySelector('#start-audit-btn')
    ?.addEventListener('click', () => renderNewAudit())

  // Sidebar New Audit
  document
    .querySelector('#new-audit-nav')
    .addEventListener('click', (event) => {
      event.preventDefault()
      renderNewAudit()
    })
}

function renderNewAudit(initialAuditData = null) {
  currentRecord = null
  app.innerHTML = `
    <div class="app-layout">

      <!-- Sidebar -->
      <aside class="sidebar">

        <div class="logo-section">
          <div class="logo-box">ISO</div>

          <div class="logo-text">
            <h2>ISO Audit</h2>
            <p>Report Generator</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="nav-menu">

          <a href="#" class="nav-item" id="dashboard-nav">
            <span class="nav-icon">▦</span>
            <span>Dashboard</span>
          </a>

          <a href="#" class="nav-item active">
            <span class="nav-icon">＋</span>
            <span>New Audit</span>
          </a>

          <a href="#" class="nav-item">
            <span class="nav-icon">▤</span>
            <span>Audits</span>
          </a>

          <a href="#" class="nav-item">
            <span class="nav-icon">↥</span>
            <span>Evidence</span>
          </a>

          <a href="#" class="nav-item">
            <span class="nav-icon">✦</span>
            <span>AI Analysis</span>
          </a>

          <a href="#" class="nav-item">
            <span class="nav-icon">!</span>
            <span>Findings</span>
          </a>

          <a href="#" class="nav-item">
            <span class="nav-icon">✓</span>
            <span>Validation</span>
          </a>

          <a href="#" class="nav-item">
            <span class="nav-icon">▧</span>
            <span>Reports</span>
          </a>

        </nav>

        <div class="sidebar-bottom">

          <a href="#" class="nav-item">
            <span class="nav-icon">⚙</span>
            <span>Settings</span>
          </a>

        </div>

      </aside>

      <!-- Main Content -->
      <main class="main-content">

        <!-- Header -->
        <header class="topbar">

          <div>
            <h1>New Audit</h1>
            <p>Create a new ISO audit and submit evidence</p>
          </div>

        </header>

        <!-- New Audit Content -->
        <section class="audit-content">

          <!-- Audit Information -->
          <div class="form-section">

            <div class="form-section-header">

              <div>
                <h2>Audit Information</h2>
                <p>
                  Enter the basic information for this audit.
                </p>
              </div>

            </div>

            <div class="form-grid">

              <!-- Organization -->
              <div class="form-group form-full">

                <label for="organization">
                  Organization Name
                </label>

                <input
                  id="organization"
                  type="text"
                  placeholder="Enter organization name"
                />

              </div>

              <!-- Audit Date -->
              <div class="form-group">

                <label for="audit-date">
                  Audit Date
                </label>

                <input
                  id="audit-date"
                  type="date"
                />

              </div>

              <!-- Standard -->
              <div class="form-group">

                <label for="standard">
                  Standard
                </label>

                <select id="standard">

                  <option value="ISO/IEC 27001:2022">
                    ISO/IEC 27001:2022
                  </option>

                </select>

              </div>

              <!-- Report Language -->
              <div class="form-group form-full">

                <label for="report-language">
                  Report Language
                </label>

                <select id="report-language">
                  <option value="en">English</option>
                  <option value="th">ไทย (Thai)</option>
                </select>

                <small class="field-help">
                  Source evidence remains in its original language. Generated analysis and report narrative use the selected language.
                </small>

              </div>

            </div>

          </div>

          <!-- Evidence -->
          <div class="form-section">

            <div class="form-section-header">

              <div>
                <h2>Audit Evidence</h2>
                <p>
                  Add evidence collected during the audit.
                </p>
              </div>

            </div>

            <div class="evidence-type-grid">

              <!-- Interview -->
              <button class="evidence-type-card" data-type="Interview">

                <span class="evidence-type-icon">
                  ↑
                </span>

                <span class="evidence-type-title">
                  Interview
                </span>

                <span class="evidence-type-description">
                  Evidence collected through interviews
                  with personnel.
                </span>

                <span class="evidence-add">
                  + Add Evidence
                </span>

              </button>

              <!-- Checklist -->
              <button class="evidence-type-card" data-type="Checklist">

                <span class="evidence-type-icon">
                  ☷
                </span>

                <span class="evidence-type-title">
                  Checklist
                </span>

                <span class="evidence-type-description">
                  Results and observations from audit
                  checklists.
                </span>

                <span class="evidence-add">
                  + Add Evidence
                </span>

              </button>

              <!-- Document Review -->
              <button class="evidence-type-card" data-type="Document Review">

                <span class="evidence-type-icon">
                  ▧
                </span>

                <span class="evidence-type-title">
                  Document Review
                </span>

                <span class="evidence-type-description">
                  Evidence obtained from reviewing
                  documents and records.
                </span>

                <span class="evidence-add">
                  + Add Evidence
                </span>

              </button>

            </div>

            <!-- Evidence List -->
<div id="evidence-list" class="evidence-list">

  <div class="evidence-empty-state">

    <span class="empty-icon">↥</span>

    <h3>No evidence added yet</h3>

    <p>
      Choose an evidence type above to add
      audit evidence.
    </p>

  </div>

</div>

          </div>

          <!-- Footer Actions -->
          <div class="audit-actions">

            <button class="secondary-btn" id="cancel-audit">
              Cancel
            </button>

            <button class="primary-btn" id="continue-audit">
              Continue →
            </button>

          </div>

        </section>

      </main>

    </div>
  `

  upgradeSidebar('new')
  // Dashboard navigation
    // ===============================
  // NEW AUDIT EVENTS
  // ===============================

  // Dashboard navigation
  document
    .querySelector('#dashboard-nav')
    .addEventListener('click', (event) => {
      event.preventDefault()
      renderDashboard()
    })

  // Cancel button
  document
    .querySelector('#cancel-audit')
    .addEventListener('click', renderDashboard)

  document
  .querySelector('#continue-audit')
  .addEventListener('click', () => {

    // Get Audit Information
    const organization = document
      .querySelector('#organization')
      .value
      .trim()

    const auditDate = document
      .querySelector('#audit-date')
      .value

    const standard = document
      .querySelector('#standard')
      .value

    const reportLanguage = document
      .querySelector('#report-language')
      .value

    // Validate required fields
    if (!organization) {
      alert(t('Please enter Organization Name.'))
      return
    }

    if (!auditDate) {
      alert(t('Please select Audit Date.'))
      return
    }

    if (!standard) {
      alert(t('Please select Standard.'))
      return
    }

    if (evidenceData.length === 0) {
      alert(t('Please add at least one evidence item.'))
      return
    }

    // Collect all audit data
    const auditData = {
      organization: organization,
      audit_date: auditDate,
      standard: standard,
      report_language: reportLanguage,
      evidence: evidenceData
    }

    // Show collected data
    app.innerHTML = `
      <div class="app-layout">

        <aside class="sidebar">
          <div class="logo-section">
            <div class="logo-box">ISO</div>
            <div class="logo-text">
              <h2>ISO Audit</h2>
              <p>Report Generator</p>
            </div>
          </div>

          <nav class="nav-menu">
            <a href="#" class="nav-item" id="dashboard-nav">
              <span class="nav-icon">▦</span>
              <span>Dashboard</span>
            </a>

            <a href="#" class="nav-item active">
              <span class="nav-icon">▤</span>
              <span>Audits</span>
            </a>

            <a href="#" class="nav-item">
              <span class="nav-icon">↥</span>
              <span>Evidence</span>
            </a>

            <a href="#" class="nav-item">
              <span class="nav-icon">✦</span>
              <span>AI Analysis</span>
            </a>

            <a href="#" class="nav-item">
              <span class="nav-icon">!</span>
              <span>Findings</span>
            </a>

            <a href="#" class="nav-item">
              <span class="nav-icon">✓</span>
              <span>Validation</span>
            </a>

            <a href="#" class="nav-item">
              <span class="nav-icon">▧</span>
              <span>Reports</span>
            </a>
          </nav>

          <div class="sidebar-bottom">
            <a href="#" class="nav-item">
              <span class="nav-icon">⚙</span>
              <span>Settings</span>
            </a>
          </div>
        </aside>

        <main class="main-content">

          <header class="topbar">
            <div>
              <h1>Review Audit</h1>
              <p>Review the audit information before continuing.</p>
            </div>
          </header>

          <section class="audit-content">

            <div class="form-section">

              <div class="form-section-header">
                <h2>Audit Information</h2>
                <p>Review the basic information for this audit.</p>
              </div>

              <div class="review-grid">

                <div class="review-item">
                  <span>Organization Name</span>
                  <strong>${escapeHtml(auditData.organization)}</strong>
                </div>

                <div class="review-item">
                  <span>Audit Date</span>
                  <strong>${escapeHtml(auditData.audit_date)}</strong>
                </div>

                <div class="review-item">
                  <span>Standard</span>
                  <strong>${escapeHtml(auditData.standard)}</strong>
                </div>

                <div class="review-item">
                  <span>Report Language</span>
                  <strong>${auditData.report_language === 'th' ? 'ไทย (Thai)' : 'English'}</strong>
                </div>

              </div>

            </div>

            <div class="form-section">

              <div class="form-section-header">
                <h2>Audit Evidence</h2>
                <p>${auditData.evidence.length} evidence item(s) added.</p>
              </div>

              <div class="review-evidence-list">

                ${
                  auditData.evidence.length === 0
                    ? `
                      <div class="evidence-empty-state">
                        <span class="empty-icon">↥</span>
                        <h3>No evidence added</h3>
                        <p>No audit evidence has been added.</p>
                      </div>
                    `
                    : auditData.evidence.map((evidence, index) => `
                      <div class="review-evidence-item">

                        <div class="review-evidence-number">
                          ${index + 1}
                        </div>

                        <div class="review-evidence-content">

                          <div class="review-evidence-header">
                            <span class="evidence-type-label">
                              ${escapeHtml(evidence.type)}
                            </span>

                            <strong>
                              ${escapeHtml(evidence.name)}
                            </strong>
                          </div>

                          ${
                            evidence.position
                              ? `<p><strong>Position:</strong> ${escapeHtml(evidence.position)}</p>`
                              : ''
                          }

                          ${
                            evidence.result
                              ? `<p><strong>Result:</strong> ${escapeHtml(evidence.result)}</p>`
                              : ''
                          }

                          ${
                            evidence.reference
                              ? `<p><strong>Reference:</strong> ${escapeHtml(evidence.reference)}</p>`
                              : ''
                          }

                          ${
                            evidence.notes
                              ? `<p><strong>Notes:</strong> ${escapeHtml(evidence.notes)}</p>`
                              : ''
                          }

                        </div>

                      </div>
                    `).join('')
                }

              </div>

            </div>

            <div class="audit-actions">

              <button
                class="secondary-btn"
                id="back-to-edit"
              >
                ← Back
              </button>

              <button
                class="primary-btn"
                id="submit-audit"
              >
                Submit Audit →
              </button>

            </div>

          </section>

        </main>

      </div>
    `

    upgradeSidebar('new')
    // Back button
    document
      .querySelector('#back-to-edit')
      .addEventListener('click', () => renderNewAudit(auditData))

    // Submit button
document
  .querySelector('#submit-audit')
  .addEventListener('click', async () => {

    const submitButton = document.querySelector('#submit-audit')
    if (submitButton.disabled) return
    const originalButtonText = submitButton.textContent
    submitButton.disabled = true
    submitButton.textContent = 'Generating report...'

    try {

      // Convert frontend evidence format
      // to Backend ReportComposeRequest format
      const backendData = {
        org_name: auditData.organization,
        audit_date: auditData.audit_date,
        standard: auditData.standard,
        report_language: auditData.report_language || 'en',

        evidence: auditData.evidence.map((item) => {

          let rawText = ''

          if (item.type === 'Interview') {
            rawText =
              `Auditee: ${item.name}. ` +
              `Position: ${item.position || 'Not specified'}. ` +
              `Notes: ${item.notes || 'None'}.`
          }

          else if (item.type === 'Checklist') {
            rawText =
              `Checklist Item: ${item.name}. ` +
              `Result: ${item.result || 'Not specified'}. ` +
              `Notes: ${item.notes || 'None'}.`
          }

          else if (item.type === 'Document Review') {
            rawText =
              `Document Name: ${item.name}. ` +
              `Reference: ${item.reference || 'Not specified'}. ` +
              `Notes: ${item.notes || 'None'}.`
          }

          return {
            source: {
              Interview: 'interview',
              Checklist: 'checklist',
              'Document Review': 'document_review'
            }[item.type],
            raw_text: item.importedRawText ?? rawText
          }
        }),

        top_k: 3
      }

      if (!confirm(t('Send this evidence to the AI provider and save it locally? Use synthetic data. Remove names, personal data and secrets first.'))) return
      if (confirm(t('Mask email addresses and common Thai mobile numbers before storage and AI processing? Names and other personal data still need manual removal.'))) {
        backendData.org_name = redactContacts(backendData.org_name)
        backendData.evidence = backendData.evidence.map(item => ({ ...item, raw_text: redactContacts(item.raw_text) }))
      }
      currentRecord = await generateSavedAudit(backendData)
      renderReportResult(currentRecord.response, auditData)

    } catch (error) {

      alert(
        `Failed to submit audit.\n\n${error.message}`
      )

    } finally {
      if (document.body.contains(submitButton)) {
        submitButton.disabled = false
        submitButton.textContent = originalButtonText
      }
    }

  })

    // Dashboard button
    document
      .querySelector('#dashboard-nav')
      .addEventListener('click', (event) => {
        event.preventDefault()
        renderDashboard()
      })
  })

  // Store evidence added by user
  const evidenceData = initialAuditData?.evidence
    ? initialAuditData.evidence.map((item) => ({ ...item }))
    : []

  mountUpload(document.querySelector('.audit-content'), renderNewAudit, (evidence) => {
    if (evidenceData.length >= 10) {
      alert(t('A maximum of 10 evidence items is allowed.'))
      return
    }
    evidenceData.push(evidence)
    renderEvidenceList()
  })

  if (initialAuditData) {
    document.querySelector('#organization').value = initialAuditData.organization || ''
    document.querySelector('#audit-date').value = initialAuditData.audit_date || ''
    document.querySelector('#standard').value = initialAuditData.standard || 'ISO/IEC 27001:2022'
    document.querySelector('#report-language').value = initialAuditData.report_language || 'en'
    renderEvidenceList()
  }

  // Evidence buttons
  document
    .querySelectorAll('.evidence-type-card')
    .forEach((button) => {

      button.addEventListener('click', () => {

        const evidenceType = button.dataset.type

        showEvidenceForm(evidenceType)

      })

    })

  // ===============================
  // SHOW EVIDENCE FORM
  // ===============================

  function showEvidenceForm(type) {

    let formContent = ''

    // Interview form
    if (type === 'Interview') {

      formContent = `
        <div class="form-group">
          <label>Auditee Name</label>
          <input
            id="evidence-name"
            type="text"
            placeholder="Enter auditee name"
          />
        </div>

        <div class="form-group">
          <label>Position</label>
          <input
            id="evidence-position"
            type="text"
            placeholder="Enter position"
          />
        </div>

        <div class="form-group">
          <label>Interview Notes</label>
          <textarea
            id="evidence-notes"
            rows="5"
            placeholder="Enter interview notes"
          ></textarea>
        </div>
      `

    }

    // Checklist form
    if (type === 'Checklist') {

      formContent = `
        <div class="form-group">
          <label>Checklist Item</label>
          <input
            id="evidence-name"
            type="text"
            placeholder="Enter checklist item"
          />
        </div>

        <div class="form-group">
          <label>Result</label>
          <select id="evidence-result">
            <option value="">Select result</option>
            <option value="Compliant">Compliant</option>
            <option value="Non-Compliant">Non-Compliant</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>

        <div class="form-group">
          <label>Notes</label>
          <textarea
            id="evidence-notes"
            rows="5"
            placeholder="Enter checklist notes"
          ></textarea>
        </div>
      `

    }

    // Document Review form
    if (type === 'Document Review') {

      formContent = `
        <div class="form-group">
          <label>Document Name</label>
          <input
            id="evidence-name"
            type="text"
            placeholder="Enter document name"
          />
        </div>

        <div class="form-group">
          <label>Document Reference</label>
          <input
            id="evidence-reference"
            type="text"
            placeholder="Enter document reference"
          />
        </div>

        <div class="form-group">
          <label>Review Notes</label>
          <textarea
            id="evidence-notes"
            rows="5"
            placeholder="Enter review notes"
          ></textarea>
        </div>
      `

    }

    // Create modal
    const modal = document.createElement('div')

    modal.className = 'evidence-modal-overlay'

    modal.innerHTML = `
      <div class="evidence-modal">

        <div class="evidence-modal-header">

          <div>
            <h2>Add ${type} Evidence</h2>
            <p>Enter the evidence information below.</p>
          </div>

          <button
            class="modal-close"
            id="close-evidence-modal"
          >
            ×
          </button>

        </div>

        <div class="evidence-modal-body">

          ${formContent}

        </div>

        <div class="evidence-modal-actions">

          <button
            class="secondary-btn"
            id="cancel-evidence"
          >
            Cancel
          </button>

          <button
            class="primary-btn"
            id="save-evidence"
          >
            Add Evidence
          </button>

        </div>

      </div>
    `

    document.body.appendChild(modal)

    // Close modal
    document
      .querySelector('#close-evidence-modal')
      .addEventListener('click', () => {
        modal.remove()
      })

    document
      .querySelector('#cancel-evidence')
      .addEventListener('click', () => {
        modal.remove()
      })

    // Save evidence
    document
      .querySelector('#save-evidence')
      .addEventListener('click', () => {

        const name =
          document.querySelector('#evidence-name')?.value.trim() || ''

        const notes =
          document.querySelector('#evidence-notes')?.value.trim() || ''

        const position =
          document.querySelector('#evidence-position')?.value.trim() || ''

        const result =
          document.querySelector('#evidence-result')?.value || ''

        const reference =
          document.querySelector('#evidence-reference')?.value.trim() || ''

        // Basic validation
        if (!name) {
          alert(t('Please enter the required information.'))
          return
        }

        const evidence = {
          type: type,
          name: name,
          position: position,
          result: result,
          reference: reference,
          notes: notes
        }

        evidenceData.push(evidence)

        modal.remove()

        renderEvidenceList()

      })

  }

  // ===============================
  // RENDER EVIDENCE LIST
  // ===============================

  function renderEvidenceList() {

    const evidenceList =
      document.querySelector('#evidence-list')

    if (evidenceData.length === 0) {

      evidenceList.innerHTML = `
        <div class="evidence-empty-state">

          <span class="empty-icon">↥</span>

          <h3>No evidence added yet</h3>

          <p>
            Choose an evidence type above to add
            audit evidence.
          </p>

        </div>
      `

      return

    }

    evidenceList.innerHTML = evidenceData
      .map((evidence, index) => {

        let details = ''

        if (evidence.type === 'Interview') {

          details = `
            <p>
              <strong>Auditee:</strong>
              ${escapeHtml(evidence.name)}
            </p>

            <p>
              <strong>Position:</strong>
              ${escapeHtml(evidence.position || '-')}
            </p>

            <p>
              <strong>Notes:</strong>
              ${escapeHtml(evidence.notes || '-')}
            </p>
          `

        }

        if (evidence.type === 'Checklist') {

          details = `
            <p>
              <strong>Checklist Item:</strong>
              ${escapeHtml(evidence.name)}
            </p>

            <p>
              <strong>Result:</strong>
              ${escapeHtml(evidence.result || '-')}
            </p>

            <p>
              <strong>Notes:</strong>
              ${escapeHtml(evidence.notes || '-')}
            </p>
          `

        }

        if (evidence.type === 'Document Review') {

          details = `
            <p>
              <strong>Document:</strong>
              ${escapeHtml(evidence.name)}
            </p>

            <p>
              <strong>Reference:</strong>
              ${escapeHtml(evidence.reference || '-')}
            </p>

            <p>
              <strong>Notes:</strong>
              ${escapeHtml(evidence.notes || '-')}
            </p>
          `

        }

        return `
          <div class="evidence-item">

            <div class="evidence-item-icon">
              ${evidence.type === 'Interview'
                ? '↑'
                : evidence.type === 'Checklist'
                  ? '☷'
                  : '▧'}
            </div>

            <div class="evidence-item-content">

              <div class="evidence-item-header">

                <div>
                  <span class="evidence-type-label">
                    ${escapeHtml(evidence.type)}
                  </span>

                  <h3>${escapeHtml(evidence.name)}</h3>
                </div>

                <button
                  class="remove-evidence-btn"
                  data-index="${index}"
                >
                  Remove
                </button>

              </div>

              <div class="evidence-details">
                ${details}
              </div>

            </div>

          </div>
        `

      })
      .join('')

    // Remove evidence
    document
      .querySelectorAll('.remove-evidence-btn')
      .forEach((button) => {

        button.addEventListener('click', () => {

          const index =
            Number(button.dataset.index)

          evidenceData.splice(index, 1)

          renderEvidenceList()

        })

      })

  }
}

// ===============================
// REPORT RESULT
// ===============================
function renderNeedsRevision(result, auditData) {
  const judgment = result.judgment

  app.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="logo-section">
          <div class="logo-box">ISO</div>
          <div class="logo-text">
            <h2>ISO Audit</h2>
            <p>Report Generator</p>
          </div>
        </div>
        <nav class="nav-menu">
          <a href="#" class="nav-item" id="dashboard-nav">
            <span class="nav-icon">▦</span>
            <span>Dashboard</span>
          </a>
          <div class="nav-item active">
            <span class="nav-icon">!</span>
            <span>Validation</span>
          </div>
        </nav>
        <div class="sidebar-bottom">
          <div class="nav-item">
            <span class="nav-icon">✓</span>
            <span>Draft-only system</span>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div>
            <h1>Report Needs Revision</h1>
            <p>The Evidence Judge blocked this draft from release.</p>
          </div>
          <div class="status-badge status-warning">${escapeHtml(formatLabel(result.status))}</div>
        </header>

        <section class="audit-content">
          <div class="form-section revision-notice">
            <div class="form-section-header">
              <div>
                <h2>Draft withheld for safety</h2>
                <p>No report is displayed because one or more findings are not sufficiently grounded.</p>
              </div>
            </div>
            <div class="report-text">
              <strong>Judge Summary</strong>
              <p>${escapeHtml(judgment.summary)}</p>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-header">
              <div>
                <h2>Finding Validation</h2>
                <p>Review these issues and improve the submitted evidence before trying again.</p>
              </div>
            </div>
            <div class="findings-list">
              ${judgment.judgments.map((item) => `
                <div class="finding-card">
                  <div class="finding-header">
                    <h3>${escapeHtml(item.finding_id)}</h3>
                    <span class="finding-classification">${escapeHtml(item.verdict)}</span>
                  </div>
                  <div class="finding-details">
                    <p><strong>Evidence supported:</strong> ${item.evidence_supported ? 'Yes' : 'No'}</p>
                    <p><strong>Reference valid:</strong> ${item.reference_valid ? 'Yes' : 'No'}</p>
                    <p><strong>Reason:</strong> ${escapeHtml(item.rationale)}</p>
                    ${item.unsupported_claims.length > 0
                      ? `<div><strong>Unsupported claims:</strong><ul>${item.unsupported_claims
                          .map((claim) => `<li>${escapeHtml(claim)}</li>`)
                          .join('')}</ul></div>`
                      : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="audit-actions">
            <button class="secondary-btn" id="back-dashboard">← Dashboard</button>
            <button class="primary-btn" id="start-over">Revise Evidence</button>
          </div>
        </section>
      </main>
    </div>
  `

  upgradeSidebar('reports')
  document.querySelector('#dashboard-nav').addEventListener('click', (event) => {
    event.preventDefault()
    renderDashboard()
  })
  document.querySelector('#back-dashboard').addEventListener('click', renderDashboard)
  document.querySelector('#start-over').addEventListener('click', () => renderNewAudit(auditData))
}

function renderReportResult(result, auditData) {
  const report = result.report
  const judgment = result.judgment

  if (!report) {
    renderNeedsRevision(result, auditData)
    return
  }

  app.innerHTML = `
    <div class="app-layout">

      <!-- Sidebar -->
      <aside class="sidebar">

        <div class="logo-section">
          <div class="logo-box">ISO</div>

          <div class="logo-text">
            <h2>ISO Audit</h2>
            <p>Report Generator</p>
          </div>
        </div>

        <nav class="nav-menu">

          <a href="#" class="nav-item" id="dashboard-nav">
            <span class="nav-icon">▦</span>
            <span>Dashboard</span>
          </a>

          <a href="#" class="nav-item active">
            <span class="nav-icon">▧</span>
            <span>Report</span>
          </a>

        </nav>

        <div class="sidebar-bottom">
          <div class="nav-item">
            <span class="nav-icon">✓</span>
            <span>Draft-only system</span>
          </div>
        </div>

      </aside>

      <!-- Main Content -->
      <main class="main-content">

        <!-- Header -->
        <header class="topbar">

          <div>
            <h1>Audit Report</h1>
            <p>Generated report for auditor review</p>
          </div>

          <div class="report-header-actions">
            <button class="report-action-btn" id="download-report">↓ Markdown</button>
            <button class="report-action-btn" id="print-report">Print / PDF</button>
            <div class="status-badge status-success">
              ${escapeHtml(formatLabel(result.status))}
            </div>
          </div>

        </header>

        <!-- Report Content -->
        <section class="audit-content report-content">

          <!-- Audit Information -->
          <div class="form-section">

            <div class="form-section-header">
              <div>
                <h2>Audit Information</h2>
                <p>Information from the generated audit report.</p>
              </div>
            </div>

            <div class="review-grid audit-info-grid">

              <div class="review-item">
                <span>Organization</span>
                <strong>${escapeHtml(report.org_name)}</strong>
              </div>

              <div class="review-item">
                <span>Audit Date</span>
                <strong>${escapeHtml(report.audit_date)}</strong>
              </div>

              <div class="review-item">
                <span>Standard</span>
                <strong>${escapeHtml(report.standard)}</strong>
              </div>

              <div class="review-item">
                <span>Report Language</span>
                <strong>${currentRecord?.input?.report_language === 'th' ? 'ไทย (Thai)' : 'English'}</strong>
              </div>

            </div>

          </div>

          <!-- Auditor Review Status -->
          <div class="form-section">

            <div class="form-section-header">
              <div>
                <h2>Auditor Review</h2>
                <p>This report requires human review before sign-off.</p>
              </div>
            </div>

            <div class="review-item auditor-status-card">
              <span>Status</span>
              <strong>
                ${currentRecord?.status === 'auditor_reviewed'
                  ? `Reviewed by ${escapeHtml(currentRecord.reviewed_by || 'auditor')}`
                  : result.requires_auditor_review ? 'Auditor review required' : 'Review complete'}
              </strong>
            </div>

          </div>

          <!-- Executive Summary -->
          <div class="form-section">

            <div class="form-section-header">
              <div>
                <h2>Executive Summary</h2>
                <p>Summary generated from the audit evidence.</p>
              </div>
            </div>

            <div class="report-text">
              ${escapeHtml(report.executive_summary)}
            </div>

          </div>

          <!-- Findings -->
          ${(result.observations || []).length ? `
          <div class="form-section">
            <div class="form-section-header">
              <div>
                <h2>Normalized Observations</h2>
                <p>Structured observations produced from the submitted evidence before classification.</p>
              </div>
            </div>
            <div class="findings-list">
              ${result.observations.map((observation) => `
                <div class="review-item">
                  <span>${escapeHtml(observation.obs_id)} · ${escapeHtml(formatLabel(observation.source))}</span>
                  <strong>${escapeHtml(observation.normalized_statement)}</strong>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Findings -->
          <div class="form-section">

            <div class="form-section-header">
              <div>
                <h2>Findings</h2>
                <p>${report.findings.length} finding(s) generated.</p>
              </div>
            </div>

            <div class="findings-list">

              ${
                report.findings.length === 0
                  ? `
                    <div class="evidence-empty-state">
                      <h3>No findings</h3>
                      <p>No findings were generated for this audit.</p>
                    </div>
                  `
                  : report.findings.map((finding) => `
                    <div class="finding-card">

                      <div class="finding-header">

                        <div>
                          <span class="evidence-type-label">
                            ${escapeHtml(finding.finding_id)}
                          </span>

                          <h3>
                            ${escapeHtml(finding.finding_statement)}
                          </h3>
                        </div>

                        <span class="finding-classification classification-${escapeHtml(finding.classification)}">
                          ${escapeHtml(formatLabel(finding.classification))}
                        </span>

                      </div>

                      <div class="finding-details">

                        <p>
                          <strong>Clause:</strong>
                          ${escapeHtml(finding.clause_ref)}
                        </p>

                        <p>
                          <strong>Requirement:</strong>
                          ${escapeHtml(finding.requirement_text_id)}
                        </p>

                        <div class="objective-evidence-block">
                          <strong>Objective Evidence:</strong>
                          <span class="evidence-language-label">Original evidence</span>

                          <ul data-i18n-ignore>
                            ${
                              finding.objective_evidence
                                .map((evidence) => `
                                  <li>${escapeHtml(evidence)}</li>
                                `)
                                .join('')
                            }
                          </ul>

                          ${(finding.objective_evidence_th || []).length ? `
                            <div class="evidence-translation">
                              <span class="evidence-language-label">Thai translation</span>
                              <ul lang="th" data-i18n-ignore>
                                ${finding.objective_evidence_th
                                  .map((evidence) => `<li>${escapeHtml(evidence)}</li>`)
                                  .join('')}
                              </ul>
                            </div>
                          ` : ''}

                        </div>

                        <p class="corrective-action-block">
                          <strong>Suggested Corrective Action:</strong>
                          ${escapeHtml(finding.suggested_corrective_action || '-')}
                        </p>

                      </div>

                    </div>
                  `).join('')
              }

            </div>

          </div>

          <!-- Evidence Judge -->
          <div class="form-section">

            <div class="form-section-header">
              <div>
                <h2>Evidence Judge</h2>
                <p>Validation of report grounding and evidence support.</p>
              </div>
            </div>

            <div class="review-grid judge-grid">

              <div class="review-item">
                <span>Report Grounded</span>
                <strong>
                  ${currentRecord?.judge_stale ? 'Not rechecked after edits' : judgment.report_grounded ? 'Yes' : 'No'}
                </strong>
              </div>

              <div class="review-item">
                <span>Overall Result</span>
                <strong>
                  ${judgment.judgments.length > 0
                    ? escapeHtml(formatLabel(judgment.judgments[0].verdict))
                    : 'No judgment'}
                </strong>
              </div>

            </div>

            <div class="report-text">
              <strong>Judge Summary</strong>
              <p>${escapeHtml(judgment.summary)}</p>
            </div>

          </div>

          <!-- Open Questions -->
          <div class="form-section">

            <div class="form-section-header">
              <div>
                <h2>Open Questions</h2>
                <p>Items that should be checked by the auditor.</p>
              </div>
            </div>

            ${
              report.open_questions.length === 0
                ? `
                  <p>No open questions.</p>
                `
                : `
                  <ul>
                    ${
                      report.open_questions
                        .map((question) => `
                          <li>${escapeHtml(question)}</li>
                        `)
                        .join('')
                    }
                  </ul>
                `
            }

          </div>

          <!-- Disclaimer -->
          <div class="form-section disclaimer-section">

            <div class="form-section-header">
              <div>
                <h2>Disclaimer</h2>
              </div>
            </div>

            <div class="report-text">
              ${escapeHtml(report.disclaimer)}
            </div>

          </div>

          <div class="audit-actions">

            <button
              class="secondary-btn"
              id="back-dashboard"
            >
              ← Dashboard
            </button>

          </div>

        </section>

      </main>

    </div>
  `

  upgradeSidebar('reports')
  // Dashboard button
  document
    .querySelector('#dashboard-nav')
    .addEventListener('click', (event) => {
      event.preventDefault()
      renderDashboard()
    })

  // Back to dashboard
  document
    .querySelector('#back-dashboard')
    .addEventListener('click', renderDashboard)

  document
    .querySelector('#download-report')
    .addEventListener('click', () => downloadMarkdownReport(report, judgment))

  document
    .querySelector('#print-report')
    .addEventListener('click', () => window.print())
  if (currentRecord) mountReview(document.querySelector('.report-content'), currentRecord, showSavedRecord)
}

// Start application
startUiLocalization()
renderDashboard()
