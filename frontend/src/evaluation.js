import { runJudgeBlockDemo } from './api.js'
import { escapeHtml } from './evidence.js'
import { t } from './i18n.js'
import { formatLabel, pageFrame } from './ui.js'

const FINAL_METRICS = {
  backendTests: 38,
  cases: 10,
  classificationAccuracy: '100%',
  macroF1: '100%',
  clauseAccuracy: '100%',
  groundingScore: '100%',
  unsupportedMajor: 0
}

export function renderEvaluation() {
  pageFrame(
    'evaluation',
    'Evaluation & controls',
    'Model quality, grounding, prompt versions, and release safeguards.',
    `<section class="insights-content">
      <section class="evaluation-hero"><div><span class="eyebrow">V1.0.0 · DEMO DAY</span><h2>The PRD dataset and five-agent pipeline passed final development evaluation.</h2><p>All ${FINAL_METRICS.cases} messy Acme cases, full Gold reports, schemas, and deterministic clause mappings passed validation.</p></div><div class="evaluation-score"><strong>${FINAL_METRICS.cases}/${FINAL_METRICS.cases}</strong><span>Gold-set cases correct</span><small>Development set · external Gold sign-off pending</small></div></section>
      <section class="metric-grid evaluation-metrics">
        <article class="metric-card"><div class="metric-icon green">✓</div><div><p>Backend tests</p><strong>${FINAL_METRICS.backendTests}</strong><small>All passed</small></div></article>
        <article class="metric-card"><div class="metric-icon green">✓</div><div><p>Classification F1</p><strong>${FINAL_METRICS.macroF1}</strong><small>PRD threshold ≥ 75%</small></div></article>
        <article class="metric-card"><div class="metric-icon green">✓</div><div><p>Clause accuracy</p><strong>${FINAL_METRICS.clauseAccuracy}</strong><small>${FINAL_METRICS.cases}/${FINAL_METRICS.cases} exact pairs</small></div></article>
        <article class="metric-card"><div class="metric-icon green">✓</div><div><p>Unsupported Major NC</p><strong>${FINAL_METRICS.unsupportedMajor}</strong><small>PRD release threshold passed</small></div></article>
      </section>
      <section class="surface final-metrics-panel">
        <div class="surface-header"><div><span class="eyebrow">FINAL GOLD-SET RESULT</span><h2>Development evaluation metrics</h2></div><span class="status-pill status-awaiting_auditor_review">PRD threshold passed</span></div>
        <div class="control-list"><div><span>Classification accuracy</span><strong>${FINAL_METRICS.classificationAccuracy}</strong></div><div><span>Classification macro F1</span><strong>${FINAL_METRICS.macroF1}</strong></div><div><span>Automated grounding score</span><strong>${FINAL_METRICS.groundingScore}</strong></div><div><span>Released unsupported Major NCs</span><strong>${FINAL_METRICS.unsupportedMajor}</strong></div></div>
      </section>
      <div class="controls-grid">
        <section class="surface"><div class="surface-header"><div><span class="eyebrow">VERSION CONTROL</span><h2>Prompt registry</h2></div><span class="status-pill status-awaiting_auditor_review">Tracked</span></div><div class="control-list"><div><span>Safety policy</span><strong>safety-v1</strong></div><div><span>Classification rubric</span><strong>v2</strong></div><div><span>Builder integrity</span><strong>SHA-256 hashes</strong></div><div><span>Model</span><strong>Gemini 3.5 Flash Lite</strong></div></div></section>
        <section class="surface"><div class="surface-header"><div><span class="eyebrow">GUARDRAILS</span><h2>Release controls</h2></div><span class="status-pill status-awaiting_auditor_review">Active</span></div><ul class="control-checks"><li><span>✓</span><div><strong>Evidence treated as untrusted input</strong><p>Embedded instructions are explicitly rejected by the prompt policy.</p></div></li><li><span>✓</span><div><strong>Evidence Judge gate</strong><p>Unsupported drafts remain hidden from the public report response.</p></div></li><li><span>✓</span><div><strong>Human review boundary</strong><p>Every report keeps its draft disclaimer and requires sign-off.</p></div></li><li><span>✓</span><div><strong>Auditor change history</strong><p>Edits record a reviewer, reason, timestamp, and before/after state.</p></div></li></ul></section>
      </div>
      <section class="surface judge-demo-panel">
        <div class="surface-header judge-demo-header">
          <div><span class="eyebrow">SECURITY DEMO</span><h2>Evidence Judge block test</h2><p>Run a bundled report that deliberately overclaims beyond its source evidence.</p></div>
          <button class="primary-btn" id="run-judge-block">Run Judge Block Demo</button>
        </div>
        <div id="judge-block-result" class="judge-demo-placeholder">
          <div class="note-icon">!</div>
          <div><strong>Ready to test the release gate</strong><p>The result is returned by the live Evidence Judge. It is not hard-coded in the interface.</p></div>
        </div>
      </section>
      <section class="surface model-note"><div class="note-icon">i</div><div><h3>Development benchmark</h3><p>Gold labels are complete, project-authored development annotations. Instructor sign-off is intentionally pending; do not describe them as independently certified labels.</p></div></section>
    </section>`
  )

  const button = document.querySelector('#run-judge-block')
  button.addEventListener('click', async () => {
    if (button.disabled) return
    const originalText = button.textContent
    const resultContainer = document.querySelector('#judge-block-result')
    button.disabled = true
    button.textContent = t('Running Judge…')
    resultContainer.className = 'judge-demo-placeholder judge-demo-running'
    resultContainer.innerHTML = `<div class="judge-spinner" aria-hidden="true"></div><div><strong>Checking the unsupported report…</strong><p>This live request uses the configured model and API quota.</p></div>`

    try {
      const judgment = await runJudgeBlockDemo()
      if (document.body.contains(resultContainer)) renderJudgeBlockResult(resultContainer, judgment)
    } catch (error) {
      if (document.body.contains(resultContainer)) {
        resultContainer.className = 'judge-demo-placeholder judge-demo-error'
        resultContainer.innerHTML = `<div class="note-icon">!</div><div><strong>Judge Block Demo failed</strong><p>${escapeHtml(error.message)}</p></div>`
      }
    } finally {
      if (document.body.contains(button)) {
        button.disabled = false
        button.textContent = originalText
      }
    }
  })
}

function renderJudgeBlockResult(container, judgment) {
  const judgments = Array.isArray(judgment?.judgments) ? judgment.judgments : []
  const grounded = judgment?.report_grounded === true
  const hasUnsupported = judgments.some(item => item.verdict === 'unsupported')
  const hasPartial = judgments.some(item => item.verdict === 'partially_supported')
  const overall = hasUnsupported ? 'Unsupported' : hasPartial ? 'Partially Supported' : 'Supported'
  const needsHumanReview = judgments.some(item => item.needs_human_review)

  const details = judgments.map(item => {
    const claims = Array.isArray(item.unsupported_claims) ? item.unsupported_claims : []
    return `
      <article class="judge-finding-result">
        <div class="judge-finding-heading"><strong>${escapeHtml(item.finding_id)}</strong><span class="status-pill ${item.verdict === 'supported' ? 'status-awaiting_auditor_review' : 'status-needs_revision'}">${escapeHtml(formatLabel(item.verdict))}</span></div>
        <div class="judge-check-grid">
          <div><span>Evidence Supported</span><strong>${item.evidence_supported ? 'Yes' : 'No'}</strong></div>
          <div><span>Reference Valid</span><strong>${item.reference_valid ? 'Yes' : 'No'}</strong></div>
          <div><span>Human Review Required</span><strong>${item.needs_human_review ? 'Yes' : 'No'}</strong></div>
        </div>
        <p class="judge-rationale"><strong>Judge rationale:</strong> ${escapeHtml(item.rationale || 'No rationale returned.')}</p>
        ${claims.length ? `<div class="unsupported-claims"><strong>Unsupported Claims</strong><ul>${claims.map(claim => `<li>${escapeHtml(claim)}</li>`).join('')}</ul></div>` : '<p class="no-unsupported-claims">No unsupported claims returned.</p>'}
      </article>`
  }).join('')

  container.className = `judge-demo-result ${grounded ? 'judge-demo-pass' : 'judge-demo-blocked'}`
  container.innerHTML = `
    <div class="judge-result-summary">
      <article><span>Report Grounded</span><strong>${grounded ? 'Yes' : 'No'}</strong></article>
      <article><span>Overall Result</span><strong>${escapeHtml(overall)}</strong></article>
      <article><span>Human Review Required</span><strong>${needsHumanReview ? 'Yes' : 'No'}</strong></article>
    </div>
    <div class="judge-block-message"><span>${grounded ? '✓' : '!'}</span><div><strong>${grounded ? 'Report passed the release gate' : 'Report blocked — revision required'}</strong><p>${escapeHtml(judgment?.summary || 'No Judge summary returned.')}</p></div></div>
    <div class="judge-result-details">${details || '<p>No finding judgments were returned.</p>'}</div>`
}
