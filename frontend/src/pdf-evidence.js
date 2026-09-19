export const PDF_MAX_BYTES = 5_000_000
export const PDF_MAX_PAGES = 25
export const PDF_MAX_TEXT = 9_500

export async function extractPdfPages(document) {
  const pageTexts = []
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const content = await page.getTextContent()
    pageTexts.push(content.items.map(item => `${item.str}${item.hasEOL ? '\n' : ' '}`).join('').trim())
  }
  return pageTexts
}

export function createPdfEvidence(fileName, pageTexts, bytes) {
  if (bytes > PDF_MAX_BYTES) throw new Error('PDF must be at most 5 MB.')
  if (!Array.isArray(pageTexts) || !pageTexts.length) throw new Error('The PDF has no pages.')
  if (pageTexts.length > PDF_MAX_PAGES) throw new Error(`PDF must be at most ${PDF_MAX_PAGES} pages.`)

  const sections = pageTexts
    .map((text, index) => ({ page: index + 1, text: String(text || '').trim() }))
    .filter(item => item.text)
    .map(item => `[Page ${item.page}]\n${item.text}`)

  if (!sections.length) {
    throw new Error('No selectable text was found. Scanned/image PDFs need OCR and are not supported yet.')
  }

  const rawText = `PDF document: ${fileName}\n${sections.join('\n\n')}`
  if (rawText.length > PDF_MAX_TEXT) {
    throw new Error('Extracted PDF text is too long. Use a shorter PDF or split it into smaller files.')
  }

  return {
    type: 'Document Review',
    name: fileName,
    position: '',
    result: '',
    reference: `PDF · ${pageTexts.length} page(s)`,
    notes: rawText,
    importedRawText: rawText
  }
}
