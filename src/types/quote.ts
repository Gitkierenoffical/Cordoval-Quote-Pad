export type LineItemPricing = 'unit' | 'dayRate'

export interface LineItem {
  id: string
  description: string
  pricing: LineItemPricing
  quantity: number
  unitPrice: number
  dayRate: number
  days: number
}

export interface Quote {
  id: string
  title: string
  clientName?: string
  lineItems: LineItem[]
  vatPercent: number | null
  notes: string
  createdAt: number
  updatedAt: number
}

export function createEmptyLineItem(): LineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    pricing: 'unit',
    quantity: 1,
    unitPrice: 0,
    dayRate: 0,
    days: 1,
  }
}

export function createEmptyQuote(): Quote {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: 'Untitled quote',
    clientName: '',
    lineItems: [createEmptyLineItem()],
    vatPercent: 20,
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}
