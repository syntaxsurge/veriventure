import "server-only";

import {
  IDBCursor,
  IDBCursorWithValue,
  IDBDatabase,
  IDBFactory,
  IDBIndex,
  IDBKeyRange,
  IDBObjectStore,
  IDBOpenDBRequest,
  IDBRequest,
  IDBTransaction,
  IDBVersionChangeEvent,
  indexedDB as fakeIndexedDB,
} from "fake-indexeddb";

declare global {
  // eslint-disable-next-line no-var
  var indexedDB: IDBFactory;
  // eslint-disable-next-line no-var
  var IDBKeyRange: typeof IDBKeyRange;
  // eslint-disable-next-line no-var
  var IDBDatabase: typeof IDBDatabase;
  // eslint-disable-next-line no-var
  var IDBObjectStore: typeof IDBObjectStore;
  // eslint-disable-next-line no-var
  var IDBIndex: typeof IDBIndex;
  // eslint-disable-next-line no-var
  var IDBCursor: typeof IDBCursor;
  // eslint-disable-next-line no-var
  var IDBCursorWithValue: typeof IDBCursorWithValue;
  // eslint-disable-next-line no-var
  var IDBTransaction: typeof IDBTransaction;
  // eslint-disable-next-line no-var
  var IDBRequest: typeof IDBRequest;
  // eslint-disable-next-line no-var
  var IDBOpenDBRequest: typeof IDBOpenDBRequest;
  // eslint-disable-next-line no-var
  var IDBVersionChangeEvent: typeof IDBVersionChangeEvent;
}

if (typeof globalThis.indexedDB === "undefined") {
  globalThis.indexedDB = fakeIndexedDB;
  globalThis.IDBKeyRange = IDBKeyRange;
  globalThis.IDBDatabase = IDBDatabase;
  globalThis.IDBObjectStore = IDBObjectStore;
  globalThis.IDBIndex = IDBIndex;
  globalThis.IDBCursor = IDBCursor;
  globalThis.IDBCursorWithValue = IDBCursorWithValue;
  globalThis.IDBTransaction = IDBTransaction;
  globalThis.IDBRequest = IDBRequest;
  globalThis.IDBOpenDBRequest = IDBOpenDBRequest;
  globalThis.IDBVersionChangeEvent = IDBVersionChangeEvent;
}
