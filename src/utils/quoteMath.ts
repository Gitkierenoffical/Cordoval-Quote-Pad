import type { LineItem, Quote } from '../types/quote'

export function lineItemTotal(item: LineItem): number {
  if (item.pricing === 'dayRate') {
    return item.days * item.dayRate
  }
  return item.quantity * item.unitPrice
}

export function quoteSubtotal(quote: Quote): number {
  return quote.lineItems.reduce((sum, item) => sum + lineItemTotal(item), 0)
}

export function quoteVatAmount(quote: Quote, subtotal: number): number | null {
  if (quote.vatPercent == null || quote.vatPercent <= 0) {
    return null
  }
  return subtotal * (quote.vatPercent / 100)
}

export function quoteGrandTotal(quote: Quote): number {
  const subtotal = quoteSubtotal(quote)
  const vat = quoteVatAmount(quote, subtotal)
  return subtotal + (vat ?? 0)
}
