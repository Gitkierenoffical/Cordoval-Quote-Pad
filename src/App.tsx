import { useCallback, useEffect, useState } from 'react'
import { downloadBackup, loadBackupFromFile } from './backup/backup'
import { BackupControls } from './components/BackupControls'
import { BuildHouseDailyAd } from './components/BuildHouseDailyAd'
import { PersistNotice } from './components/PersistNotice'
import { QuoteEditor } from './components/QuoteEditor'
import { QuoteList } from './components/QuoteList'
import { deleteQuote, listQuotes, putQuote } from './db/quotesDb'
import { useStoragePersist } from './hooks/useStoragePersist'
import { createEmptyQuote, type Quote } from './types/quote'

type View =
  | { kind: 'list' }
  | { kind: 'edit'; quoteId: string; draft: Quote }

export default function App() {
  const persistState = useStoragePersist()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>({ kind: 'list' })
  const [backupBusy, setBackupBusy] = useState(false)
  const [backupMessage, setBackupMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const rows = await listQuotes()
    setQuotes(rows)
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        await refresh()
      } catch {
        setError('Could not open local quote storage.')
      } finally {
        setLoading(false)
      }
    })()
  }, [refresh])

  async function openNew() {
    const quote = createEmptyQuote()
    await putQuote(quote)
    await refresh()
    setView({ kind: 'edit', quoteId: quote.id, draft: quote })
  }

  async function openQuote(id: string) {
    const quote = quotes.find((q) => q.id === id)
    if (!quote) return
    setView({ kind: 'edit', quoteId: id, draft: { ...quote } })
  }

  async function saveDraft(draft: Quote) {
    const toSave = { ...draft, updatedAt: Date.now() }
    await putQuote(toSave)
    await refresh()
    setView({ kind: 'edit', quoteId: toSave.id, draft: toSave })
  }

  async function handleDuplicate(id: string) {
    const source = quotes.find((q) => q.id === id)
    if (!source) return
    const now = Date.now()
    const copy: Quote = {
      ...source,
      id: crypto.randomUUID(),
      title: `${source.title} (copy)`,
      createdAt: now,
      updatedAt: now,
      lineItems: source.lineItems.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    }
    await putQuote(copy)
    await refresh()
  }

  async function handleDelete(id: string) {
    const quote = quotes.find((q) => q.id === id)
    if (!quote) return
    const ok = window.confirm(
      `Delete "${quote.title || 'Untitled quote'}"? This cannot be undone.`,
    )
    if (!ok) return
    await deleteQuote(id)
    if (view.kind === 'edit' && view.quoteId === id) {
      setView({ kind: 'list' })
    }
    await refresh()
  }

  async function handleBackup() {
    setBackupBusy(true)
    setBackupMessage(null)
    try {
      await downloadBackup()
      setBackupMessage('Backup downloaded to your device.')
    } catch {
      setBackupMessage('Backup failed. Try again.')
    } finally {
      setBackupBusy(false)
    }
  }

  async function handleLoad(file: File) {
    setBackupBusy(true)
    setBackupMessage(null)
    try {
      await loadBackupFromFile(file)
      await refresh()
      setView({ kind: 'list' })
      setBackupMessage('Backup loaded. Your quotes on this device were replaced.')
    } catch (err) {
      setBackupMessage(err instanceof Error ? err.message : 'Load failed.')
    } finally {
      setBackupBusy(false)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <img
              src="/quote-pad-icon.svg"
              alt=""
              className="brand-icon"
              width={36}
              height={36}
            />
            <div>
              <p className="brand-title">Cordoval Quote Pad</p>
              <p className="brand-tagline">Client quotes on your device</p>
            </div>
          </div>
          <a
            href="https://cordoval.co.uk"
            target="_blank"
            rel="noreferrer"
            className="header-link"
          >
            cordoval.co.uk
          </a>
        </div>
      </header>

      <PersistNotice state={persistState} />

      <main className="app-main">
        {loading ? (
          <p className="loading">Loading quotes…</p>
        ) : error ? (
          <p
            className="form-message form-message-error"
            role="alert"
          >
            {error}
          </p>
        ) : view.kind === 'list' ? (
          <>
            <p className="intro">
              Build and keep client quotes in your browser. Data stays in IndexedDB on this
              device. No accounts and no cloud storage.
            </p>
            <QuoteList
              quotes={quotes}
              onNew={() => void openNew()}
              onOpen={(id) => void openQuote(id)}
              onDuplicate={(id) => void handleDuplicate(id)}
              onDelete={(id) => void handleDelete(id)}
            />
            <BackupControls
              onBackup={() => void handleBackup()}
              onLoad={(file) => void handleLoad(file)}
              busy={backupBusy}
              message={backupMessage}
            />
          </>
        ) : (
          <QuoteEditor
            quote={view.draft}
            onChange={(draft) => setView({ ...view, draft })}
            onBack={() => {
              void saveDraft(view.draft).then(() => setView({ kind: 'list' }))
            }}
            onSave={() => void saveDraft(view.draft)}
          />
        )}
      </main>

      <BuildHouseDailyAd />

      <footer className="app-footer">
        <p>
          A{' '}
          <a
            href="https://cordoval.co.uk"
            target="_blank"
            rel="noreferrer"
          >
            Cordoval
          </a>{' '}
          product. Quotes stay on this device.
        </p>
        <nav>
          <a
            href="https://scrub.cordoval.co.uk/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          <a
            href="https://scrub.cordoval.co.uk/terms"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Service
          </a>
        </nav>
      </footer>
    </div>
  )
}
