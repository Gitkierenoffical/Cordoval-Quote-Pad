interface BackupControlsProps {
  onBackup: () => void
  onLoad: (file: File) => void
  busy?: boolean
  message?: string | null
}

export function BackupControls({
  onBackup,
  onLoad,
  busy,
  message,
}: BackupControlsProps) {
  return (
    <div className="backup-controls">
      <div className="backup-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBackup}
          disabled={busy}
        >
          Backup
        </button>
        <label className="btn btn-secondary file-label">
          Load
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) onLoad(file)
            }}
          />
        </label>
      </div>
      <p className="backup-hint">
        Backup saves all quotes to a file on your device. Load replaces quotes on this device
        after you confirm. Files are never uploaded.
      </p>
      {message && (
        <p
          className="form-message"
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  )
}
