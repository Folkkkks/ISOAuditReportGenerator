/** Pure evidence adapters shared by upload, saved audits and tests. */
const sources = Object.freeze({
  interview: 'Interview', checklist: 'Checklist', document_review: 'Document Review'
})

export function toAuditForm(data) {
  if (!data || typeof data.org_name !== 'string' || !data.org_name.trim() ||
      data.org_name.length > 200 || typeof data.audit_date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.audit_date) ||
      !Number.isFinite(Date.parse(data.audit_date)) ||
      new Date(data.audit_date).toISOString().slice(0, 10) !== data.audit_date ||
      !Array.isArray(data.evidence) || !data.evidence.length || data.evidence.length > 10) {
    throw new Error('Expected an organization, valid YYYY-MM-DD date and 1–10 evidence items.')
  }
  if (data.standard && data.standard !== 'ISO/IEC 27001:2022') {
    throw new Error('Only ISO/IEC 27001:2022 is supported.')
  }
  if (data.report_language && !['en', 'th'].includes(data.report_language)) {
    throw new Error('Report language must be en or th.')
  }
  const evidence = data.evidence.map((item, index) => {
    if (!item || !Object.hasOwn(sources, item.source) || typeof item.raw_text !== 'string' ||
        !item.raw_text.trim() || item.raw_text.length > 10000) {
      throw new Error(`Invalid source or raw_text in evidence ${index + 1}.`)
    }
    return { type: sources[item.source], name: `Imported evidence ${index + 1}`,
      notes: item.raw_text, importedRawText: item.raw_text, position: '', reference: '', result: '' }
  })
  return { organization: data.org_name.trim(), audit_date: data.audit_date,
    standard: 'ISO/IEC 27001:2022', report_language: data.report_language || 'en', evidence }
}

export function parseEvidenceFile(text, bytes) {
  if (bytes > 100000) throw new Error('File must be at most 100 KB.')
  return toAuditForm(JSON.parse(text))
}

export function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

export function redactContacts(value) {
  // Best effort only: names, addresses and arbitrary secrets require manual review.
  return value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL REDACTED]')
    .replace(/\b0[689]\d[ -]?\d{3}[ -]?\d{4}\b/g, '[PHONE REDACTED]')
}
