import { escapeHtml } from './evidence.js'
import { getUiLanguage } from './i18n.js'

export const app = document.querySelector('#app')

const DISPLAY_LABELS = {
  edited_pending_review: 'Human-edited draft — review required',
  awaiting_auditor_review: 'Awaiting Auditor Review',
  auditor_reviewed: 'Auditor Reviewed',
  needs_revision: 'Needs Revision',
  major_nc: 'Major NC',
  minor_nc: 'Minor NC',
  observation: 'Observation',
  ofi: 'Opportunity for Improvement',
  supported: 'Supported',
  partially_supported: 'Partially Supported',
  unsupported: 'Unsupported'
}

const NAV_ICONS = {
  dashboard: '◫',
  new: '+',
  audits: '≡',
  reports: '▤',
  evaluation: '⌁'
}

export function formatLabel(value) {
  return DISPLAY_LABELS[value] || String(value ?? '').replaceAll('_', ' ')
}

export function formatDateTime(value) {
  const date = new Date(value)
  const locale = getUiLanguage() === 'th' ? 'th-TH' : 'en-US'
  return Number.isNaN(date.getTime()) ? String(value || '—') : date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function statusText(status) {
  return {
    ingested: 'Generation pending',
    awaiting_auditor_review: 'Awaiting auditor review',
    edited_pending_review: 'Edited · review required',
    auditor_reviewed: 'Auditor reviewed',
    needs_revision: 'Revision required'
  }[status] || formatLabel(status)
}

function sidebarMarkup(active) {
  const item = (route, label) => `
    <a href="#" id="${route === 'dashboard' ? 'dashboard-nav' : route === 'new' ? 'new-audit-nav' : `${route}-nav`}" class="nav-item ${active === route ? 'active' : ''}" data-route="${route}">
      <span class="nav-icon">${NAV_ICONS[route]}</span><span>${label}</span>
    </a>`
  return `
    <div class="logo-section">
      <div class="logo-box">IA</div>
      <div class="logo-text"><h2>Audit Workspace</h2><p>ISO/IEC 27001:2022</p></div>
    </div>
    <div class="workspace-chip"><span></span> Local review workspace</div>
    <p class="nav-label">WORKSPACE</p>
    <nav class="nav-menu">
      ${item('dashboard', 'Overview')}
      ${item('new', 'New audit')}
      ${item('audits', 'Audit library')}
      ${item('reports', 'Reports')}
    </nav>
    <p class="nav-label nav-label-spaced">INSIGHTS</p>
    <nav class="nav-menu">${item('evaluation', 'Evaluation & controls')}</nav>
    <div class="sidebar-bottom">
      <div class="system-health"><span class="health-dot"></span><div><strong>System ready</strong><small>Demo Day release · v1.0.0</small></div></div>
      <p>Human sign-off required</p>
    </div>`
}

export function upgradeSidebar(active) {
  const sidebar = document.querySelector('.sidebar')
  if (sidebar) sidebar.innerHTML = sidebarMarkup(active)
}

export function pageFrame(active, title, subtitle, content, action = '') {
  app.innerHTML = `
    <div class="app-layout">
      <aside class="sidebar"></aside>
      <main class="main-content">
        <header class="topbar professional-topbar"><div><span class="page-kicker">ISO AUDIT WORKSPACE</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p></div>${action}</header>
        ${content}
      </main>
    </div>`
  upgradeSidebar(active)
}
