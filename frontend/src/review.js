import { api } from './api.js'
import { getUiLanguage, t } from './i18n.js'

function button(label, action) {
  const element = document.createElement('button')
  element.type = 'button'
  element.className = 'secondary-btn'
  element.textContent = label
  element.addEventListener('click', async () => {
    element.disabled = true
    try { await action() } catch (error) { alert(error.message) }
    finally { element.disabled = false }
  })
  return element
}

const STATUS_LABELS = {
  ingested: 'Evidence saved — generation pending',
  awaiting_auditor_review: 'AI draft — auditor review required',
  edited_pending_review: 'Human-edited draft — review required',
  auditor_reviewed: 'Auditor reviewed',
  needs_revision: 'Blocked — revision required'
}

function formatTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(getUiLanguage() === 'th' ? 'th-TH' : 'en-US')
}

function appendText(parent, tag, text, className) {
  const element = document.createElement(tag)
  if (className) element.className = className
  element.textContent = text
  parent.append(element)
  return element
}

function findings(record) {
  return record?.response?.report?.findings || []
}

function describeChanges(event) {
  const before = new Map(findings(event.before).map(item => [item.finding_id, item]))
  const after = new Map(findings(event.after).map(item => [item.finding_id, item]))
  const changes = []

  for (const [id, current] of after) {
    const previous = before.get(id)
    if (!previous) {
      changes.push(`${id}: AI draft created as ${current.classification}.`)
      continue
    }
    if (previous.classification !== current.classification) {
      changes.push(`${id}: classification changed from ${previous.classification} to ${current.classification}.`)
    }
    if (previous.finding_statement !== current.finding_statement) {
      changes.push(`${id}: finding statement changed from “${previous.finding_statement}” to “${current.finding_statement}”.`)
    }
    if (previous.suggested_corrective_action !== current.suggested_corrective_action) {
      changes.push(`${id}: suggested corrective action was updated.`)
    }
  }
  if (event.before.status !== event.after.status) {
    changes.push(`Status changed from ${event.before.status} to ${event.after.status}.`)
  }
  return changes.length ? changes : ['Record metadata was updated.']
}

export function mountHistory(container, showRecord) {
  container.append(button('Saved audits', async () => {
    const records = await api('/audits')
    const panel = document.createElement('section')
    panel.className = 'form-section saved-audits-panel'
    const title = document.createElement('h2')
    title.textContent = 'Saved audits — local single-user demo'
    panel.append(title)
    appendText(panel, 'p', 'Drafts are stored only in this local application.', 'section-help')
    const list = document.createElement('div')
    list.className = 'saved-audits-list'
    if (!records.length) appendText(list, 'p', 'No saved audits yet.', 'empty-state')
    for (const record of records) {
      const card = document.createElement('article')
      card.className = 'saved-audit-card'
      const content = document.createElement('div')
      appendText(content, 'h3', record.org_name)
      appendText(content, 'p', STATUS_LABELS[record.status] || record.status, `saved-status status-${record.status}`)
      appendText(content, 'small', `Created ${formatTime(record.created_at)}`)
      const open = button(record.status === 'ingested' ? 'Generate draft' : 'Open report', async () => {
        const saved = await api(`/audits/${record.audit_id}/report`)
        if (!saved.response) {
          if (!confirm(t('This audit has no result. Generate now? This uses API quota.'))) return
          showRecord(await api(`/audits/${record.audit_id}/generate`, 'POST'))
        } else showRecord(saved)
      })
      card.append(content, open)
      list.append(card)
    }
    panel.append(list)
    container.querySelector('[data-history]')?.remove()
    panel.dataset.history = 'true'
    container.append(panel)
  }))
}

export function mountReview(container, record, showRecord) {
  const report = record.response.report
  const notice = document.createElement('p')
  notice.className = 'review-warning'
  notice.textContent = record.status === 'auditor_reviewed'
    ? record.judge_stale
      ? 'AUDITOR REVIEW COMPLETE: human edits were reviewed. The original AI judgment was not rerun and remains historical only.'
      : 'AUDITOR REVIEW COMPLETE: this local acknowledgement is not an authenticated identity or ISO certification decision.'
    : record.judge_stale
      ? 'HUMAN-EDITED DRAFT: original AI judgment is stale and does not validate these edits. Auditor review required.'
      : 'AI-generated draft only. Reviewer names below are self-declared, not authenticated identities.'
  container.prepend(notice)

  const panel = document.createElement('section')
  panel.className = 'form-section'
  const heading = document.createElement('h2')
  heading.textContent = 'Auditor editing & history'
  panel.classList.add('no-print')
  panel.append(heading)
  panel.append(button('View change history', async () => {
    const history = await api(`/audits/${record.audit_id}/history`)
    panel.querySelector('.change-history')?.remove()
    const timeline = document.createElement('div')
    timeline.className = 'change-history'
    appendText(timeline, 'h3', 'Change history')
    if (!history.length) appendText(timeline, 'p', 'No changes recorded.', 'empty-state')
    for (const event of history.slice().reverse()) {
      const item = document.createElement('article')
      item.className = 'history-event'
      const header = document.createElement('div')
      appendText(header, 'strong', event.actor === 'system' ? 'AI draft generation' : event.actor)
      appendText(header, 'time', formatTime(event.at))
      item.append(header)
      appendText(item, 'p', event.reason, 'history-reason')
      const changes = document.createElement('ul')
      for (const change of describeChanges(event)) appendText(changes, 'li', change)
      item.append(changes)
      timeline.append(item)
    }
    panel.insertBefore(timeline, panel.querySelector('.review-editor'))
  }))

  const decision = document.createElement('section')
  decision.className = `review-decision ${record.status === 'auditor_reviewed' ? 'is-complete' : ''}`
  if (record.status === 'auditor_reviewed') {
    appendText(decision, 'h3', 'Review complete')
    appendText(decision, 'p', `Reviewed by ${record.reviewed_by || 'auditor'} on ${formatTime(record.reviewed_at)}.`)
    if (record.review_note) appendText(decision, 'p', record.review_note, 'review-note')
    appendText(decision, 'small', 'Editing a finding below will reopen this report for review.')
  } else {
    appendText(decision, 'h3', 'Complete auditor review')
    appendText(decision, 'p', 'Confirm that you reviewed the report and its evidence. This records a local acknowledgement; it is not ISO certification approval.', 'section-help')
    const reviewer = document.createElement('input')
    reviewer.placeholder = 'Reviewer name (self-declared)'
    reviewer.value = record.last_edited_by || ''
    reviewer.maxLength = 100
    reviewer.required = true
    const note = document.createElement('textarea')
    note.placeholder = 'Review note (at least 5 characters)'
    note.minLength = 5
    note.maxLength = 1000
    note.required = true
    const confirmation = document.createElement('label')
    confirmation.className = 'review-confirmation'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.required = true
    confirmation.append(checkbox, document.createTextNode(' I reviewed the report and supporting evidence.'))
    const complete = button('Mark review complete', async () => {
      if (!reviewer.reportValidity() || !note.reportValidity() || !checkbox.reportValidity()) return
      if (!confirm(t('Mark this report as auditor reviewed? This does not issue or approve an ISO certificate.'))) return
      const saved = await api(`/audits/${record.audit_id}/review`, 'POST', {
        revision: record.revision,
        actor: reviewer.value.trim(),
        reason: note.value.trim(),
        confirmed: true
      })
      showRecord(saved)
    })
    complete.classList.add('primary-btn')
    decision.append(reviewer, note, confirmation, complete)
  }
  panel.append(decision)

  for (const finding of report.findings) {
    const form = document.createElement('form')
    form.className = 'review-editor'
    const title = document.createElement('h3')
    title.textContent = `Edit ${finding.finding_id}`
    form.append(title)
    function field(label, value, options) {
      const wrapper = document.createElement('label')
      wrapper.textContent = label
      const input = document.createElement(options ? 'select' : 'textarea')
      if (options) for (const option of options) {
        const item = document.createElement('option')
        item.value = item.textContent = option
        input.append(item)
      }
      input.value = value || ''
      input.required = true
      input.maxLength = 10000
      wrapper.append(input)
      form.append(wrapper)
      return input
    }
    const classification = field('Classification', finding.classification,
      ['major_nc', 'minor_nc', 'observation', 'ofi'])
    const statement = field('Finding statement', finding.finding_statement)
    const action = field('Suggested corrective action', finding.suggested_corrective_action)
    action.required = false
    const actor = field('Reviewer name (self-declared)', '')
    actor.maxLength = 100
    const reason = field('Reason for change (at least 5 characters)', '')
    reason.minLength = 5
    reason.maxLength = 1000
    form.append(button('Save reviewed draft', async () => {
      if (!form.reportValidity()) return
      const saved = await api(`/audits/${record.audit_id}/findings/${finding.finding_id}`, 'PATCH', {
        revision: record.revision, actor: actor.value.trim(), reason: reason.value.trim(),
        classification: classification.value, finding_statement: statement.value.trim(),
        suggested_corrective_action: action.value.trim() || null
      })
      showRecord(saved)
    }))
    form.addEventListener('submit', event => event.preventDefault())
    panel.append(form)
  }
  container.append(panel)
}
