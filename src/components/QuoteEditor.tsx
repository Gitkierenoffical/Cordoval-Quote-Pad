import { useMemo, useState } from 'react'
import type { Quote } from '../types/quote'
import { createEmptyLineItem } from '../types/quote'
import { copyQuoteSummary } from '../utils/copySummary'
import { formatGbp } from '../utils/money'
import {
  quoteGrandTotal,
  quoteSubtotal,
  quoteVatAmount,
} from '../utils/quoteMath'
import { LineItemRow } from './LineItemRow'

interface QuoteEditorProps {
  quote: Quote
  onChange: (quote: Quote) => void
  onBack: () => void
  onSave: () => void
  saving?: boolean
}

export function QuoteEditor({
  quote,
  onChange,
  onBack,
  onSave,
  saving,
}: QuoteEditorProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const subtotal = useMemo(() => quoteSubtotal(quote), [quote])
  const vatAmount = useMemo(() => quoteVatAmount(quote, subtotal), [quote, subtotal])
  const grandTotal = useMemo(() => quoteGrandTotal(quote), [quote])

  const touch = (patch: Partial<Quote>) => {
    onChange({ ...quote, ...patch, updatedAt: Date.now() })
  }

  async function handleCopy() {
    try {
      await copyQuoteSummary(quote)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('error')
    }
  }

  return (
    <section className="quote-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onBack}
        >
          ← All quotes
        </button>
        <div className="editor-toolbar-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void handleCopy()}
          >
            {copyState === 'copied' ? 'Copied' : 'Copy summary'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSave}
            disabled={saving}
          >
            Save
          </button>
        </div>
      </div>

      {copyState === 'error' && (
        <p
          className="form-message form-message-error"
          role="alert"
        >
          Could not copy to clipboard. Try again or copy the totals manually.
        </p>
      )}

      <div className="editor-grid">
        <label className="field">
          <span>Quote title</span>
          <input
            type="text"
            value={quote.title}
            onChange={(e) => touch({ title: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Client name (optional)</span>
          <input
            type="text"
            value={quote.clientName ?? ''}
            onChange={(e) => touch({ clientName: e.target.value })}
          />
        </label>
      </div>

      <div className="line-items-section">
        <div className="section-header">
          <h3>Line items</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() =>
              touch({ lineItems: [...quote.lineItems, createEmptyLineItem()] })
            }
          >
            Add line
          </button>
        </div>

        <div className="line-items">
          {quote.lineItems.map((item, index) => (
            <LineItemRow
              key={item.id}
              item={item}
              index={index}
              canRemove={quote.lineItems.length > 1}
              onRemove={() =>
                touch({
                  lineItems: quote.lineItems.filter((row) => row.id !== item.id),
                })
              }
              onChange={(next) =>
                touch({
                  lineItems: quote.lineItems.map((row) =>
                    row.id === item.id ? next : row,
                  ),
                })
              }
            />
          ))}
        </div>
      </div>

      <aside className="totals-panel">
        <div className="totals-row">
          <span>Subtotal</span>
          <strong>{formatGbp(subtotal)}</strong>
        </div>
        <label className="field field-inline">
          <span>VAT % (optional)</span>
          <input
            type="number"
            min={0}
            max={100}
            step="0.1"
            placeholder="None"
            value={quote.vatPercent ?? ''}
            onChange={(e) => {
              const raw = e.target.value
              touch({
                vatPercent: raw === '' ? null : Number(e.target.value) || 0,
              })
            }}
          />
        </label>
        {vatAmount != null && quote.vatPercent != null && (
          <div className="totals-row">
            <span>VAT ({quote.vatPercent}%)</span>
            <strong>{formatGbp(vatAmount)}</strong>
          </div>
        )}
        <div className="totals-row totals-grand">
          <span>{vatAmount != null ? 'Grand total' : 'Total'}</span>
          <strong>{formatGbp(grandTotal)}</strong>
        </div>
      </aside>

      <label className="field">
        <span>Notes</span>
        <textarea
          rows={4}
          value={quote.notes}
          placeholder="Terms, timeline, or extra detail for the client"
          onChange={(e) => touch({ notes: e.target.value })}
        />
      </label>
    </section>
  )
}
