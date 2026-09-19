import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createPdfEvidence, extractPdfPages } from '../src/pdf-evidence.js'

test('extracts page-attributed text from the bundled demo PDF', async () => {
  const bytes = await readFile('../data/demo/english-access-review-evidence.pdf')
  const document = await getDocument({ data: new Uint8Array(bytes) }).promise
  try {
    const pageTexts = await extractPdfPages(document)
    const evidence = createPdfEvidence('english-access-review-evidence.pdf', pageTexts, bytes.length)
    assert.equal(evidence.reference, 'PDF · 1 page(s)')
    assert.match(evidence.importedRawText, /\[Page 1\]/)
    assert.match(evidence.importedRawText, /completed two weeks after the required date/)
  } finally {
    await document.destroy()
  }
})
