import type { Quote } from '../types/quote'
import { formatGbp } from './money'
import {
  lineItemTotal,
  quoteGrandTotal,
  quoteSubtotal,
  quoteVatAmount,
} from './quoteMath'

function lineLabel(quote: Quote): string {
  return quote.lineItems
    .map((item, index) => {
      const total = lineItemTotal(item)
      const desc = item.description.trim() || `Line ${index + 1}`
      if (item.pricing === 'dayRate') {
        return `• ${desc}: ${item.days} day(s) × ${formatGbp(item.dayRate)} = ${formatGbp(total)}`
      }
      return `• ${desc}: ${item.quantity} × ${formatGbp(item.unitPrice)} = ${formatGbp(total)}`
    })
    .join('\n')
}

export function buildQuoteSummary(quote: Quote): string {
  const subtotal = quoteSubtotal(quote)
  const vat = quoteVatAmount(quote, subtotal)
  const grand = quoteGrandTotal(quote)
  const lines: string[] = [quote.title.trim() || 'Quote']
  if (quote.clientName?.trim()) {
    lines.push(`Client: ${quote.clientName.trim()}`)
  }
  lines.push('', 'Line items', lineLabel(quote), '', `Subtotal: ${formatGbp(subtotal)}`)
  if (vat != null && quote.vatPercent != null) {
    lines.push(`VAT (${quote.vatPercent}%): ${formatGbp(vat)}`)
    lines.push(`Total: ${formatGbp(grand)}`)
  }
  if (quote.notes.trim()) {
    lines.push('', 'Notes', quote.notes.trim())
  }
  return lines.join('\n')
}

export async function copyQuoteSummary(quote: Quote): Promise<void> {
  const text = buildQuoteSummary(quote)
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
