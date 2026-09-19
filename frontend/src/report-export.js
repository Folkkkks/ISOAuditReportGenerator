import { formatLabel } from './ui.js'

export function downloadMarkdownReport(report, judgment) {
  const findings = report.findings.map((finding) => {
    const evidence = finding.objective_evidence
      .map((item) => `  - ${item}`)
      .join('\n')
    const evidenceThai = (finding.objective_evidence_th || [])
      .map((item) => `  - ${item}`)
      .join('\n')
    return [
      `## ${finding.finding_id}: ${formatLabel(finding.classification)}`,
      '',
      `**Clause:** ${finding.clause_ref}`,
      `**Requirement ID:** ${finding.requirement_text_id}`,
      '',
      finding.finding_statement,
      '',
      '**Objective evidence:**',
      evidence,
      ...(evidenceThai ? ['', '**คำแปลหลักฐานภาษาไทย:**', evidenceThai] : []),
      '',
      `**Suggested corrective action:** ${finding.suggested_corrective_action || 'Not provided'}`
    ].join('\n')
  }).join('\n\n')

  const openQuestions = report.open_questions.length > 0
    ? report.open_questions.map((question) => `- ${question}`).join('\n')
    : 'None.'
  const markdown = [
    `# ISO Audit Report — ${report.org_name}`,
    '',
    `**Audit date:** ${report.audit_date}`,
    `**Standard:** ${report.standard}`,
    '',
    '## Executive Summary',
    '',
    report.executive_summary,
    '',
    findings,
    '',
    '## Evidence Judge',
    '',
    `**Report grounded:** ${judgment.report_grounded ? 'Yes' : 'No'}`,
    '',
    judgment.summary,
    '',
    '## Open Questions',
    '',
    openQuestions,
    '',
    '## Disclaimer',
    '',
    report.disclaimer,
    ''
  ].join('\n')

  const safeName = report.org_name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'audit'
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${safeName}-audit-report.md`
  link.click()
  URL.revokeObjectURL(url)
}
