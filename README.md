# Cordoval Quote Pad

Build and keep client quotes in the browser. Line items, rates, totals, notes. Data stays on this device (IndexedDB). Backup and Load moves quotes as a local file. No accounts. No cloud store.

Part of Cordoval (cordoval.co.uk).

## Development

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Storage

- Quotes live in IndexedDB (`cordoval-quote-pad`) in the browser only.
- On first visit the app requests persistent storage via `navigator.storage.persist()`.
- **Backup** exports all quotes as a JSON file (`formatVersion`, product slug `quote-pad`).
- **Load** validates that file, asks for confirmation, then replaces quotes on this device.
