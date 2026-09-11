import { createWorker } from 'tesseract.js'

let workerPromise = null

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('tur+eng')
  }
  return workerPromise
}

function parseAmount(text) {
  const numberPattern = /\d{1,3}(?:\.\d{3})*,\d{2}/g
  const toFloat = (raw) => Number(raw.replace(/\./g, '').replace(',', '.'))

  const keywordPatterns = [
    /GENEL\s*TOPLAM[^\d]{0,15}(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /KART\s*TUTARI[^\d]{0,15}(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /TOPLAM[^\d]{0,15}(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /TUTAR[^\d]{0,15}(\d{1,3}(?:\.\d{3})*,\d{2})/i,
    /ÖDENEN[^\d]{0,15}(\d{1,3}(?:\.\d{3})*,\d{2})/i,
  ]

  for (const pattern of keywordPatterns) {
    const match = text.match(pattern)
    if (match) {
      return toFloat(match[1])
    }
  }

  const allNumbers = [...text.matchAll(numberPattern)].map((m) => toFloat(m[0]))
  if (allNumbers.length === 0) {
    return null
  }
  return Math.max(...allNumbers)
}

function parseDate(text) {
  const match = text.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/)
  if (!match) {
    return null
  }

  let [, day, month, year] = match
  if (year.length === 2) {
    year = `20${year}`
  }
  day = day.padStart(2, '0')
  month = month.padStart(2, '0')

  if (Number(month) > 12 || Number(day) > 31) {
    return null
  }

  return `${year}-${month}-${day}`
}

export async function scanReceipt(buffer) {
  const worker = await getWorker()
  const {
    data: { text },
  } = await worker.recognize(buffer)

  return {
    rawText: text,
    amount: parseAmount(text),
    date: parseDate(text),
  }
}
