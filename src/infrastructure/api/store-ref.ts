import type { Store } from '@reduxjs/toolkit';

let _store: Store | null = null;

export function setStoreRef(store: Store): void {
  _store = store;
}

export function getStoreRef(): Store | null {
  return _store;
}
