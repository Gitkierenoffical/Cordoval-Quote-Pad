import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Quote } from '../types/quote'
import { DB_NAME, DB_VERSION, QUOTES_STORE } from './constants'

interface QuotePadSchema extends DBSchema {
  quotes: {
    key: string
    value: Quote
    indexes: { 'by-updated': number }
  }
}

let dbPromise: Promise<IDBPDatabase<QuotePadSchema>> | null = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<QuotePadSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(QUOTES_STORE)) {
          const store = db.createObjectStore(QUOTES_STORE, { keyPath: 'id' })
          store.createIndex('by-updated', 'updatedAt')
        }
      },
    })
  }
  return dbPromise
}

export async function listQuotes(): Promise<Quote[]> {
  const db = await getDb()
  const quotes = await db.getAll(QUOTES_STORE)
  return quotes.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getQuote(id: string): Promise<Quote | undefined> {
  const db = await getDb()
  return db.get(QUOTES_STORE, id)
}

export async function putQuote(quote: Quote): Promise<void> {
  const db = await getDb()
  await db.put(QUOTES_STORE, quote)
}

export async function deleteQuote(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(QUOTES_STORE, id)
}

export async function replaceAllQuotes(quotes: Quote[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction(QUOTES_STORE, 'readwrite')
  await tx.store.clear()
  for (const quote of quotes) {
    await tx.store.put(quote)
  }
  await tx.done
}

export async function exportAllQuotes(): Promise<Quote[]> {
  const db = await getDb()
  return db.getAll(QUOTES_STORE)
}
