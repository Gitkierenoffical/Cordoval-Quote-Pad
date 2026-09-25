import type { Quote } from '../types/quote'

interface QuoteListProps {
  quotes: Quote[]
  onOpen: (id: string) => void
  onNew: () => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ts))
}

export function QuoteList({
  quotes,
  onOpen,
  onNew,
  onDuplicate,
  onDelete,
}: QuoteListProps) {
  return (
    <section className="quote-list-section">
      <div className="section-header">
        <h2>Your quotes</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNew}
        >
          New quote
        </button>
      </div>

      {quotes.length === 0 ? (
        <div className="empty-state">
          <p>No quotes yet. Create one to start building a client quote.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onNew}
          >
            New quote
          </button>
        </div>
      ) : (
        <ul className="quote-list">
          {quotes.map((quote) => (
            <li
              key={quote.id}
              className="quote-card"
            >
              <button
                type="button"
                className="quote-card-main"
                onClick={() => onOpen(quote.id)}
              >
                <span className="quote-card-title">{quote.title || 'Untitled quote'}</span>
                {quote.clientName?.trim() && (
                  <span className="quote-card-client">{quote.clientName.trim()}</span>
                )}
                <span className="quote-card-date">Updated {formatDate(quote.updatedAt)}</span>
              </button>
              <div className="quote-card-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => onDuplicate(quote.id)}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-danger"
                  onClick={() => onDelete(quote.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
