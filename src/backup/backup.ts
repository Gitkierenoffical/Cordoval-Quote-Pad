import {
  BACKUP_FORMAT_VERSION,
  PRODUCT_SLUG,
} from '../db/constants'
import { exportAllQuotes, replaceAllQuotes } from '../db/quotesDb'
import type { Quote } from '../types/quote'

export interface QuotePadBackupFile {
  formatVersion: number
  product: string
  exportedAt: string
  quotes: Quote[]
}

export function isValidBackup(
  data: unknown,
): { ok: true; backup: QuotePadBackupFile } | { ok: false; message: string } {
  if (!data || typeof data !== 'object') {
    return { ok: false, message: 'The file is not a valid Quote Pad backup.' }
  }
  const record = data as Record<string, unknown>
  if (record.formatVersion !== BACKUP_FORMAT_VERSION) {
    return {
      ok: false,
      message: `Unsupported backup version (expected ${BACKUP_FORMAT_VERSION}).`,
    }
  }
  if (record.product !== PRODUCT_SLUG) {
    return {
      ok: false,
      message: 'This backup is not for Cordoval Quote Pad.',
    }
  }
  if (!Array.isArray(record.quotes)) {
    return { ok: false, message: 'The backup file is missing quote data.' }
  }
  return {
    ok: true,
    backup: {
      formatVersion: BACKUP_FORMAT_VERSION,
      product: PRODUCT_SLUG,
      exportedAt:
        typeof record.exportedAt === 'string'
          ? record.exportedAt
          : new Date().toISOString(),
      quotes: record.quotes as Quote[],
    },
  }
}

export async function downloadBackup(): Promise<void> {
  const quotes = await exportAllQuotes()
  const payload: QuotePadBackupFile = {
    formatVersion: BACKUP_FORMAT_VERSION,
    product: PRODUCT_SLUG,
    exportedAt: new Date().toISOString(),
    quotes,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const date = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `quote-pad-backup-${date}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function loadBackupFromFile(file: File): Promise<void> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Could not read the file as JSON.')
  }
  const check = isValidBackup(parsed)
  if (!check.ok) {
    throw new Error(check.message)
  }
  const count = check.backup.quotes.length
  const confirmed = window.confirm(
    `Load this backup? This will replace all ${count} quote(s) currently on this device. This cannot be undone.`,
  )
  if (!confirmed) {
    return
  }
  await replaceAllQuotes(check.backup.quotes)
}
