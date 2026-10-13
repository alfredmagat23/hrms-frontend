import { createSeedData, STORE_VERSION } from "@/lib/mock/seed";
import type { DemoDataStore, MockSession } from "@/lib/domain/types";

const DATA_KEY = `tls-hrms-demo-data-v${STORE_VERSION}`;
const SESSION_KEY = `tls-hrms-demo-session-v${STORE_VERSION}`;

let memoryStore: DemoDataStore | null = null;
const listeners = new Set<() => void>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadStore(): DemoDataStore {
  if (memoryStore) return memoryStore;

  if (canUseStorage()) {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoDataStore;
        if (parsed.version === STORE_VERSION) {
          memoryStore = parsed;
          return memoryStore;
        }
      }
    } catch {
      // fall through to reseed
    }
  }

  memoryStore = createSeedData();
  persistStore();
  return memoryStore;
}

export function getStore(): DemoDataStore {
  return loadStore();
}

export function persistStore(): void {
  if (!memoryStore) return;
  if (canUseStorage()) {
    localStorage.setItem(DATA_KEY, JSON.stringify(memoryStore));
  }
  notify();
}

export function mutateStore(
  mutator: (store: DemoDataStore) => void,
): DemoDataStore {
  const store = loadStore();
  mutator(store);
  persistStore();
  return store;
}

export function resetStore(): DemoDataStore {
  memoryStore = createSeedData();
  persistStore();
  clearSession();
  return memoryStore;
}

export function loadSession(): MockSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockSession;
  } catch {
    return null;
  }
}

export function saveSession(session: MockSession | null): void {
  if (!canUseStorage()) return;
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  notify();
}

export function clearSession(): void {
  saveSession(null);
}

export function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}
