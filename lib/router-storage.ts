// Simple IndexedDB-backed storage for router manuals.
// We use IndexedDB instead of localStorage because PDFs and images
// are frequently larger than the ~5MB localStorage quota.

export type RouterManual = {
  id: string
  brand: string
  model: string
  createdAt: number
  imageBlob: Blob
  imageType: string
  pdfBlob: Blob
  pdfType: string
  pdfName: string
}

const DB_NAME = "routerdocs-central"
const STORE_NAME = "manuals"
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
        store.createIndex("createdAt", "createdAt")
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getAllManuals(): Promise<RouterManual[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()
    req.onsuccess = () => {
      const items = (req.result as RouterManual[]) ?? []
      items.sort((a, b) => b.createdAt - a.createdAt)
      resolve(items)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function addManual(manual: RouterManual): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).add(manual)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function deleteManual(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite")
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
