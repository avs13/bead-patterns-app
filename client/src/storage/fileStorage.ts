const DB_NAME = "BeadPatternsDB";
const DB_VERSION = 2;
const STORE_META = "files_meta";
const STORE_CONTENT = "files_content";

export interface FileMeta {
  id: string;
  name: string;
  thumbnail: string;
  createdAt: number;
  updatedAt: number;
}

export type SerializedElement =
  | { type: "Loom"; x: number; y: number; rows: number; columns: number }
  | { type: "Bead"; x: number; y: number; color: string };

interface FileContent {
  id: string;
  elements: SerializedElement[];
  beadPalette: string[];
}

let _db: IDBDatabase | null = null;

export async function saveFile(
  meta: Omit<FileMeta, "createdAt" | "updatedAt"> & { createdAt?: number },
  contentData: Omit<FileContent, "id">,
): Promise<void> {
  const db = await openDB();
  const now = Date.now();
  const existingMeta = await wrap<FileMeta | undefined>(
    db.transaction(STORE_META).objectStore(STORE_META).get(meta.id),
  );

  const fullMeta: FileMeta = {
    id: meta.id,
    name: meta.name,
    thumbnail: meta.thumbnail,
    createdAt: existingMeta?.createdAt ?? meta.createdAt ?? now,
    updatedAt: now,
  };

  const content: FileContent = { id: meta.id, ...contentData };

  await wrap(
    db
      .transaction(STORE_META, "readwrite")
      .objectStore(STORE_META)
      .put(fullMeta),
  );

  await wrap(
    db
      .transaction(STORE_CONTENT, "readwrite")
      .objectStore(STORE_CONTENT)
      .put(content),
  );
}

export async function listFiles(): Promise<FileMeta[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const store = db
      .transaction(STORE_META, "readonly")
      .objectStore(STORE_META);
    const index = store.index("createdAt");

    const request = index.openCursor(null, "prev");
    const results: FileMeta[] = [];

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        results.push(cursor.value as FileMeta);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function loadFileContent(id: string): Promise<FileContent | null> {
  const db = await openDB();
  const result = await wrap<FileContent | undefined>(
    db
      .transaction(STORE_CONTENT, "readonly")
      .objectStore(STORE_CONTENT)
      .get(id),
  );
  if (result && !result.beadPalette) {
    result.beadPalette = [];
  }
  return result ?? null;
}

export async function loadFileMeta(id: string): Promise<FileMeta | null> {
  const db = await openDB();
  const result = await wrap<FileMeta | undefined>(
    db.transaction(STORE_META, "readonly").objectStore(STORE_META).get(id),
  );
  return result ?? null;
}

export async function renameFile(id: string, newName: string): Promise<void> {
  const db = await openDB();
  const existing = await wrap<FileMeta | undefined>(
    db.transaction(STORE_META, "readonly").objectStore(STORE_META).get(id),
  );
  if (!existing) throw new Error(`Archivo ${id} no encontrado`);

  const updated: FileMeta = {
    ...existing,
    thumbnail: existing.thumbnail || "",
    name: newName,
    updatedAt: Date.now(),
  };
  await wrap(
    db
      .transaction(STORE_META, "readwrite")
      .objectStore(STORE_META)
      .put(updated),
  );
}

export async function deleteFile(id: string): Promise<void> {
  const db = await openDB();
  const txn = db.transaction([STORE_META, STORE_CONTENT], "readwrite");
  txn.objectStore(STORE_META).delete(id);
  txn.objectStore(STORE_CONTENT).delete(id);

  await new Promise<void>((resolve, reject) => {
    txn.oncomplete = () => resolve();
    txn.onerror = () => reject(txn.error);
  });
}

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_META)) {
        const metaStore = db.createObjectStore(STORE_META, { keyPath: "id" });

        metaStore.createIndex("createdAt", "createdAt");
        metaStore.createIndex("updatedAt", "updatedAt");
      }

      if (!db.objectStoreNames.contains(STORE_CONTENT)) {
        db.createObjectStore(STORE_CONTENT, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      _db = (event.target as IDBOpenDBRequest).result;
      resolve(_db);
    };

    request.onerror = () => reject(request.error);
  });
}

function wrap<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
