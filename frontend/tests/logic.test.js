// Unit tests, not browser/DOM tests. See START_HERE_TH.md for browser checks.
import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { api, generateSavedAudit, runJudgeBlockDemo } from '../src/api.js'
import { escapeHtml, parseEvidenceFile, toAuditForm, redactContacts } from '../src/evidence.js'
import { createPdfEvidence } from '../src/pdf-evidence.js'
import { setUiLanguage, t } from '../src/i18n.js'

const fetchOriginal = globalThis.fetch
afterEach(() => {
  globalThis.fetch = fetchOriginal
  setUiLanguage('en')
})
const input = {org_name: 'Acme', audit_date: '2026-09-16', evidence: [
  {source: 'interview', raw_text: 'No access review records.'}]}

test('escape HTML from user or model output', () => {
  assert.equal(escapeHtml('<img src="x" onerror=\'alert(1)\'>&'),
    '&lt;img src=&quot;x&quot; onerror=&#039;alert(1)&#039;&gt;&amp;')
  assert.equal(escapeHtml(null), '')
})

test('import retains exact source evidence and adapts to form', () => {
  const form = parseEvidenceFile(JSON.stringify(input), 100)
  assert.equal(form.organization, 'Acme')
  assert.equal(form.evidence[0].type, 'Interview')
  assert.equal(form.evidence[0].importedRawText, input.evidence[0].raw_text)
})

test('import rejects oversized or malformed data and invalid dates', () => {
  assert.throws(() => parseEvidenceFile('{}', 100001))
  assert.throws(() => parseEvidenceFile('bad-json', 10))
  for (const change of [{org_name: ''}, {evidence: []}, {evidence: input.evidence.concat(Array(10).fill(input.evidence[0]))},
    {audit_date: '2026-02-30'}, {standard: 'ISO 9001'}, {evidence: [{source:'__proto__', raw_text:'x'}]},
    {evidence: [{source:'interview',raw_text:'x'.repeat(10001)}]}]) {
    assert.throws(() => toAuditForm({...input, ...change}))
  }
})

test('optional redaction masks email and common mobile number, not all PII', () => {
  assert.equal(redactContacts('John: john@example.com 081-234-5678'),
    'John: [EMAIL REDACTED] [PHONE REDACTED]')
  assert.equal(redactContacts('Clause A.5.18'), 'Clause A.5.18')
})

test('API handles safe backend detail and hides non-JSON bodies', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({detail:'Try later'}), {status:503})
  await assert.rejects(api('/audits'), /Try later/)
  globalThis.fetch = async () => new Response('private-provider-detail', {status:500})
  await assert.rejects(api('/audits'), /HTTP 500/)
})

test('saved workflow creates input before requesting generation', async () => {
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push([url, options])
    return Response.json({audit_id:'abc', status:'awaiting_auditor_review'})
  }
  await generateSavedAudit(input)
  assert.equal(calls[0][0], '/api/audits')
  assert.deepEqual(JSON.parse(calls[0][1].body), input)
  assert.equal(calls[1][0], '/api/audits/abc/generate')
})

test('Judge block demo calls the dedicated security endpoint', async () => {
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push([url, options])
    return Response.json({ report_grounded: false, judgments: [], summary: 'Blocked' })
  }
  const result = await runJudgeBlockDemo()
  assert.equal(calls[0][0], '/api/demo/judge-block')
  assert.equal(calls[0][1].method, 'POST')
  assert.equal(result.report_grounded, false)
})

test('PDF text becomes one page-attributed document-review evidence item', () => {
  const evidence = createPdfEvidence('access-review.pdf', [
    'Quarterly access reviews are required.',
    'The latest review was two weeks late.'
  ], 2048)
  assert.equal(evidence.type, 'Document Review')
  assert.match(evidence.importedRawText, /\[Page 1\]/)
  assert.match(evidence.importedRawText, /\[Page 2\]/)
  assert.equal(evidence.reference, 'PDF · 2 page(s)')
})

test('PDF evidence rejects scanned, oversized, overlong and too-many-page inputs', () => {
  assert.throws(() => createPdfEvidence('scan.pdf', ['', '  '], 100), /No selectable text/)
  assert.throws(() => createPdfEvidence('large.pdf', ['text'], 5_000_001), /5 MB/)
  assert.throws(() => createPdfEvidence('long.pdf', ['x'.repeat(9_500)], 100), /too long/)
  assert.throws(() => createPdfEvidence('pages.pdf', Array(26).fill('text'), 100), /25 pages/)
})

test('evidence pack preserves Thai report-language selection', () => {
  const form = toAuditForm({ ...input, report_language: 'th' })
  assert.equal(form.report_language, 'th')
  assert.throws(() => toAuditForm({ ...input, report_language: 'jp' }), /Report language/)
})

test('interface language translates labels independently from report language', () => {
  setUiLanguage('th')
  assert.equal(t('Dashboard'), 'แดชบอร์ด')
  assert.equal(t('Objective Evidence:'), 'หลักฐานเชิงประจักษ์:')
  assert.equal(t('Major NC'), 'Major NC')
  assert.equal(t('Minor NC'), 'Minor NC')
  assert.equal(t('Northstar Digital Services'), 'Northstar Digital Services')
  setUiLanguage('en')
  assert.equal(t('Dashboard'), 'Dashboard')
})
