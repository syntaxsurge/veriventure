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
  var indexedDB: IDBFactory;
  var IDBKeyRange: typeof IDBKeyRange;
  var IDBDatabase: typeof IDBDatabase;
  var IDBObjectStore: typeof IDBObjectStore;
  var IDBIndex: typeof IDBIndex;
  var IDBCursor: typeof IDBCursor;
  var IDBCursorWithValue: typeof IDBCursorWithValue;
  var IDBTransaction: typeof IDBTransaction;
  var IDBRequest: typeof IDBRequest;
  var IDBOpenDBRequest: typeof IDBOpenDBRequest;
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
