import { parseEvidenceFile } from './evidence.js'
import { extractPdfEvidence } from './pdf.js'
import { t } from './i18n.js'

export function mountUpload(container, openAudit, addEvidence) {
  const section = document.createElement('section')
  section.className = 'form-section import-panel'
  const icon = document.createElement('div')
  icon.className = 'import-icon'
  icon.textContent = '⇧'
  const copy = document.createElement('div')
  copy.className = 'import-copy'
  const title = document.createElement('h2')
  title.textContent = 'Import evidence pack'
  const description = document.createElement('p')
  description.textContent = 'Import a prepared JSON pack or extract selectable text from a PDF. Review all extracted text before sending it to AI.'
  copy.append(title, description)
  const actions = document.createElement('div')
  actions.className = 'import-actions'

  const jsonLabel = document.createElement('label')
  jsonLabel.className = 'file-picker'
  const jsonAction = document.createElement('span')
  jsonAction.textContent = 'Choose JSON pack'
  const jsonFilename = document.createElement('small')
  jsonFilename.textContent = 'Maximum 100 KB'
  const jsonInput = document.createElement('input')
  jsonInput.type = 'file'
  jsonInput.accept = '.json,application/json'
  jsonInput.addEventListener('change', async () => {
    const file = jsonInput.files[0]
    if (!file) return
    jsonFilename.textContent = file.name
    try {
      openAudit(parseEvidenceFile(await file.text(), file.size))
    } catch (error) { alert(`${t('Import failed')}: ${error.message}`) }
  })
  jsonLabel.append(jsonAction, jsonFilename, jsonInput)

  const pdfLabel = document.createElement('label')
  pdfLabel.className = 'file-picker'
  const pdfAction = document.createElement('span')
  pdfAction.textContent = 'Choose text PDF'
  const pdfFilename = document.createElement('small')
  pdfFilename.textContent = 'Maximum 5 MB · 25 pages · no OCR'
  const pdfInput = document.createElement('input')
  pdfInput.type = 'file'
  pdfInput.accept = '.pdf,application/pdf'
  pdfInput.addEventListener('change', async () => {
    const file = pdfInput.files[0]
    if (!file) return
    pdfFilename.textContent = `Extracting ${file.name}…`
    try {
      const evidence = await extractPdfEvidence(file)
      addEvidence(evidence)
      pdfFilename.textContent = `${file.name} · text extracted`
    } catch (error) {
      pdfFilename.textContent = 'Maximum 5 MB · 25 pages · no OCR'
      alert(`${t('PDF import failed')}: ${error.message}`)
    } finally {
      pdfInput.value = ''
    }
  })
  pdfLabel.append(pdfAction, pdfFilename, pdfInput)
  actions.append(jsonLabel, pdfLabel)
  section.append(icon, copy, actions)
  container.prepend(section)
}
