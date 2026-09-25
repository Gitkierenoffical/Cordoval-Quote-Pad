import type { PersistState } from '../hooks/useStoragePersist'

interface PersistNoticeProps {
  state: PersistState
}

export function PersistNotice({ state }: PersistNoticeProps) {
  if (state === 'checking' || state === 'granted' || state === 'unsupported') {
    return null
  }

  return (
    <div
      className="persist-notice"
      role="status"
    >
      <strong>Storage may be cleared by your browser.</strong>
      <span>
        Quote Pad could not lock storage on this device. Your quotes may be removed if the
        browser clears site data. Use Backup regularly and keep a copy safe.
      </span>
    </div>
  )
}
