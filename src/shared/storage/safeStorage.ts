/**
 * `window.localStorage` access that never throws. Reading or writing
 * localStorage raises a `SecurityError` in browsers configured to block site
 * data (and in some private-mode / sandboxed contexts). When such an access
 * runs ABOVE the app's error boundary — e.g. `ThemeProvider` reading the saved
 * theme during boot, which lives in `RootProviders`, outside `<ErrorBoundary>`
 * — an unguarded throw white-screens the entire app before anything can catch
 * it. Every access here is wrapped so a blocked/full store degrades to
 * "no persisted value" instead of a crash.
 *
 * This is the same inline try/catch `DemoModeProvider` already uses for its own
 * boot read, extracted so every boot-path reader/writer shares one guarded seam.
 */
export const safeStorage = {
  /** The stored string for `key`, or `null` when absent or storage is blocked. */
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  /** Persist `value` under `key`; silently a no-op when storage is blocked/full. */
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage blocked / quota exceeded — degrade to in-memory only */
    }
  },
  /** Remove `key`; silently a no-op when storage is blocked. */
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* storage blocked — nothing to clear */
    }
  },
};
