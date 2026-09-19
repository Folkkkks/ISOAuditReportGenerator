import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf.mjs'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createPdfEvidence, extractPdfPages, PDF_MAX_BYTES } from './pdf-evidence.js'

GlobalWorkerOptions.workerSrc = workerUrl

export async function extractPdfEvidence(file) {
  if (!file || (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf')) {
    throw new Error('Choose a PDF file.')
  }
  if (file.size > PDF_MAX_BYTES) throw new Error('PDF must be at most 5 MB.')

  const task = getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
  const document = await task.promise
  try {
    const pageTexts = await extractPdfPages(document)
    return createPdfEvidence(file.name, pageTexts, file.size)
  } finally {
    await document.destroy()
  }
}
