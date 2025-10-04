// app/database/index.ts
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'hakathon2025.db';

type ItemRow = {
  id: number;
  name: string;
  created_at?: string;
};

/**
 * Return a promise for the opened database.
 * Uses the modern async expo-sqlite API: openDatabaseAsync().
 */
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    // openDatabaseAsync returns a Promise<SQLiteDatabase>
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

/**
 * Initialize DB schema (run once on app start).
 */
export async function initDB(): Promise<void> {
  const db = await getDB();
  // execAsync is intended for multiple statements (no parameter binding)
  await db.execAsync(
    `PRAGMA journal_mode = WAL;
     CREATE TABLE IF NOT EXISTS items (
       id INTEGER PRIMARY KEY NOT NULL,
       name TEXT NOT NULL,
       created_at DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%f', 'now'))
     );`
  );
}

/**
 * Insert a new item. Returns the inserted row id (or -1 on unknown).
 */
export async function addItem(name: string): Promise<number> {
  if (!name) throw new Error('name is required');
  const db = await getDB();
  // runAsync supports variadic args or an array for parameter binding
  const result = await db.runAsync(
    'INSERT INTO items (name) VALUES (?);',
    name
  );
  // result.lastInsertRowId and result.changes are provided by runAsync
  return (result && (result as any).lastInsertRowId) ?? -1;
}

/**
 * Get all items as an array of ItemRow.
 */
export async function getAllItems(): Promise<ItemRow[]> {
  const db = await getDB();
  // getAllAsync returns an array of rows
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT id, name, created_at FROM items ORDER BY id DESC;'
  );
  return rows ?? [];
}

/**
 * Delete an item by id.
 */
export async function deleteItem(id: number): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync('DELETE FROM items WHERE id = ?;', id);
  return (result && (result as any).changes) ?? 0;
}

/**
 * Optional: utility to run a SELECT that returns a single row
 */
export async function getFirst<T = any>(sql: string, ...params: any[]): Promise<T | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<T>(sql, ...params);
  return row ?? null;
}

export default {
  initDB,
  addItem,
  getAllItems,
  deleteItem,
  getFirst,
};


