import { readSheetObjects, writeSheetObjects, ensureSpreadsheetSheets } from './googleSheets';

const CACHE_TTL_MS = 30_000; // 30 seconds
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearCache(): void {
  cache.clear();
}

export async function readSheet<T>(sheetName: string): Promise<T[]> {
  const cacheKey = `read:${sheetName}`;
  const cached = getCached<T[]>(cacheKey);
  if (cached) return cached;

  const data = await readSheetObjects<T>(sheetName);
  setCache(cacheKey, data);
  return data;
}

export async function batchReadSheets<T extends Record<string, unknown>>(
  sheetNames: string[]
): Promise<{ [key: string]: unknown[] }> {
  const result: { [key: string]: unknown[] } = {};
  const toRead: string[] = [];

  for (const name of sheetNames) {
    const cacheKey = `read:${name}`;
    const cached = getCached<unknown[]>(cacheKey);
    if (cached) {
      result[name] = cached;
    } else {
      toRead.push(name);
    }
  }

  // Read uncached sheets in parallel to minimize API calls
  const reads = await Promise.all(toRead.map((name) => readSheetObjects<unknown>(name)));

  toRead.forEach((name, index) => {
    const data = reads[index];
    result[name] = data;
    setCache(`read:${name}`, data);
  });

  return result;
}

export async function appendToSheet<T>(sheetName: string, data: T[], headers: string[]): Promise<void> {
  // Read existing, append new, write back
  const existing = await readSheetObjects<Record<string, unknown>>(sheetName);
  const header = headers;

  // Convert new data to row arrays and append
  const newData = data.map((item) => {
    const record: Record<string, unknown> = {};
    headers.forEach((h) => {
      const value = (item as Record<string, unknown>)[h];
      record[h] = value === undefined || value === null ? '' : value;
    });
    return record;
  });

  const allData = [...existing, ...newData];
  await writeSheetObjects(sheetName, allData, header);

  // Invalidate cache for this sheet
  cache.delete(`read:${sheetName}`);
}

export async function updateSheetRow<T extends { id: string }>(
  sheetName: string,
  items: T[],
  headers: string[]
): Promise<void> {
  await writeSheetObjects(sheetName, items, headers);
  cache.delete(`read:${sheetName}`);
}

export async function writeSheet<T>(
  sheetName: string,
  items: T[],
  headers: string[]
): Promise<void> {
  await writeSheetObjects(sheetName, items, headers);
  cache.delete(`read:${sheetName}`);
}

export async function clearSheet(sheetName: string): Promise<void> {
  await writeSheetObjects(sheetName, [], ['placeholder']);
  cache.delete(`read:${sheetName}`);
}

export async function initializeIfNeeded(): Promise<void> {
  await ensureSpreadsheetSheets();
}
