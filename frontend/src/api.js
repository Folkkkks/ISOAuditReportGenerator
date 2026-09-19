const base = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/$/, '')

export async function api(path, method = 'GET', data) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(data === undefined ? {} : { body: JSON.stringify(data) })
  })
  if (!response.ok) {
    let message = `Request failed (HTTP ${response.status}).`
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') message = body.detail
    } catch { /* Non-JSON errors never reveal provider details. */ }
    throw new Error(message)
  }
  return response.json()
}

export async function generateSavedAudit(input) {
  const draft = await api('/audits', 'POST', input)
  return api(`/audits/${draft.audit_id}/generate`, 'POST')
}

export async function runJudgeBlockDemo() {
  return api('/demo/judge-block', 'POST')
}
