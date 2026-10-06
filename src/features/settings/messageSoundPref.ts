import { useSyncExternalStore } from "react";

/**
 * The "Message sound" notification preference: whether a live incoming message
 * plays a soft chime. Device-local, so it is a tiny module-level store
 * persisted to localStorage (the same shape as `skipLinkPref`). The socket
 * handler outside React reads it through `isMessageSoundEnabled`, while the
 * settings toggle subscribes through `useMessageSoundPref`.
 */

const STORAGE_KEY = "qp:notifications:message-sound";
const DEFAULT_MESSAGE_SOUND = true;

let current: boolean = read();
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw != null) {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === "boolean") return parsed;
    }
  } catch {
    // ignore: private mode or a corrupt value falls through to the default
  }
  return DEFAULT_MESSAGE_SOUND;
}

function emit() {
  for (const listener of listeners) listener();
}

/** Set the preference, persist it, and wake every subscriber. */
export function setMessageSoundPref(next: boolean) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore: keep working in-memory
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => current;
/** SSR/prerender has no localStorage, so report the default. */
const getServerSnapshot = () => DEFAULT_MESSAGE_SOUND;

/** Whether the member wants a chime for incoming messages. */
export function useMessageSoundPref(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Non-hook read for the realtime handler, which runs outside render. */
export function isMessageSoundEnabled(): boolean {
  return current;
}

/** Test-only reset so suites don't leak the store between cases. */
export function resetMessageSoundPrefForTests(value = DEFAULT_MESSAGE_SOUND) {
  current = value;
  emit();
}
