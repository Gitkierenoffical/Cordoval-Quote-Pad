const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export function formatGbp(amount: number): string {
  return gbp.format(amount)
}

export function parseMoneyInput(value: string): number {
  const normalised = value.replace(/,/g, '').trim()
  if (normalised === '') return 0
  const n = Number.parseFloat(normalised)
  return Number.isFinite(n) ? n : 0
}
