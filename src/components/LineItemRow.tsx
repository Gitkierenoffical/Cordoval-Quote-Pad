import type { LineItem } from '../types/quote'
import { formatGbp } from '../utils/money'
import { lineItemTotal } from '../utils/quoteMath'

interface LineItemRowProps {
  item: LineItem
  index: number
  onChange: (item: LineItem) => void
  onRemove: () => void
  canRemove: boolean
}

export function LineItemRow({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
}: LineItemRowProps) {
  const total = lineItemTotal(item)

  return (
    <div className="line-item">
      <div className="line-item-header">
        <span className="line-item-label">Line {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-danger"
            onClick={onRemove}
          >
            Remove
          </button>
        )}
      </div>

      <label className="field">
        <span>Description</span>
        <input
          type="text"
          value={item.description}
          placeholder="Work or item description"
          onChange={(e) => onChange({ ...item, description: e.target.value })}
        />
      </label>

      <div className="pricing-toggle">
        <span>Pricing</span>
        <div className="segmented">
          <button
            type="button"
            className={item.pricing === 'unit' ? 'active' : ''}
            onClick={() => onChange({ ...item, pricing: 'unit' })}
          >
            Qty × price
          </button>
          <button
            type="button"
            className={item.pricing === 'dayRate' ? 'active' : ''}
            onClick={() => onChange({ ...item, pricing: 'dayRate' })}
          >
            Day rate × days
          </button>
        </div>
      </div>

      {item.pricing === 'unit' ? (
        <div className="field-row">
          <label className="field">
            <span>Quantity</span>
            <input
              type="number"
              min={0}
              step="any"
              value={item.quantity}
              onChange={(e) =>
                onChange({ ...item, quantity: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="field">
            <span>Unit price (£)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.unitPrice}
              onChange={(e) =>
                onChange({ ...item, unitPrice: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>
      ) : (
        <div className="field-row">
          <label className="field">
            <span>Day rate (£)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={item.dayRate}
              onChange={(e) =>
                onChange({ ...item, dayRate: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="field">
            <span>Days</span>
            <input
              type="number"
              min={0}
              step="any"
              value={item.days}
              onChange={(e) =>
                onChange({ ...item, days: Number(e.target.value) || 0 })
              }
            />
          </label>
        </div>
      )}

      <p className="line-total">Line total: {formatGbp(total)}</p>
    </div>
  )
}
