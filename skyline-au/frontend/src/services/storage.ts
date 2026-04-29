import { openDB, type IDBPDatabase } from 'idb';
import type { Location } from '../types';

const DB_NAME = 'weathermap-v1';
const DB_VERSION = 1;

let dbp: Promise<IDBPDatabase> | null = null;
function db() {
  if (!dbp) {
    dbp = openDB(DB_NAME, DB_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
        if (!d.objectStoreNames.contains('saved')) d.createObjectStore('saved', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('cache')) d.createObjectStore('cache');
      }
    });
  }
  return dbp;
}

export const storage = {
  async getLastLocation(): Promise<Location | null> {
    return ((await (await db()).get('kv', 'lastLocation')) as Location | undefined) ?? null;
  },
  async setLastLocation(loc: Location) {
    await (await db()).put('kv', loc, 'lastLocation');
  },
  async getSaved(): Promise<Location[]> {
    return ((await (await db()).getAll('saved')) as Location[]) ?? [];
  },
  async addSaved(loc: Location) {
    await (await db()).put('saved', loc);
  },
  async removeSaved(id: string) {
    await (await db()).delete('saved', id);
  },
  async getCached<T>(key: string): Promise<T | null> {
    return ((await (await db()).get('cache', key)) as T | undefined) ?? null;
  },
  async setCached<T>(key: string, value: T) {
    await (await db()).put('cache', value, key);
  },
  async getTheme(): Promise<'light' | 'dark' | null> {
    return ((await (await db()).get('kv', 'theme')) as 'light' | 'dark' | undefined) ?? null;
  },
  async setTheme(t: 'light' | 'dark') {
    await (await db()).put('kv', t, 'theme');
  }
};
