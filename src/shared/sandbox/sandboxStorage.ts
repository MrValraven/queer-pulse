/**
 * In-memory Storage used by a sandbox instance so its writes never touch the
 * real app's storage. Same-origin iframes share window.localStorage /
 * sessionStorage with the parent tab, so without this a stateful simulation
 * (sign in/out, onboarding flags, dismissals) would leak out of the frame.
 */
function createMemoryStorage(seed: Record<string, string>): Storage {
  const store = new Map<string, string>(Object.entries(seed));
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

function snapshot(storage: Storage): Record<string, string> {
  const seed: Record<string, string> = {};
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key !== null) seed[key] = storage.getItem(key) ?? "";
    }
  } catch {
    // Storage blocked (private mode): start from an empty seed.
  }
  return seed;
}

/**
 * Replace window.localStorage and window.sessionStorage with in-memory shims
 * seeded from the current values. Call once at boot, only when isSandbox().
 * Best-effort: if an engine refuses to redefine the accessor, the sandbox
 * still forces demo mode (the network guarantee is unaffected); only the
 * storage isolation degrades.
 */
export function installSandboxStorage(): void {
  const targets = ["localStorage", "sessionStorage"] as const;
  for (const name of targets) {
    try {
      const seed = snapshot(window[name]);
      Object.defineProperty(window, name, {
        value: createMemoryStorage(seed),
        configurable: true,
      });
    } catch {
      // Some engines disallow redefining these accessors; skip gracefully.
    }
  }
  installSandboxCookies();
}

/**
 * Shadow document.cookie with an in-memory jar so a sandbox instance's cookie
 * writes never reach the real origin. Minimal by design: it stores key=value
 * and honours a past Max-Age/Expires as a delete; it does not enforce
 * path/domain/expiry semantics (not needed for isolation). Seeded from the
 * current cookies so reads stay consistent at boot.
 */
function installSandboxCookies(): void {
  try {
    const jar = new Map<string, string>();
    const current = typeof document.cookie === "string" ? document.cookie : "";
    for (const pair of current ? current.split("; ") : []) {
      const equalsAt = pair.indexOf("=");
      if (equalsAt > 0)
        jar.set(pair.slice(0, equalsAt), pair.slice(equalsAt + 1));
    }
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        return Array.from(jar.entries())
          .map(([name, value]) => `${name}=${value}`)
          .join("; ");
      },
      set(input: string) {
        const raw = String(input);
        const firstPair = raw.split(";")[0] ?? "";
        const equalsAt = firstPair.indexOf("=");
        if (equalsAt < 0) return;
        const name = firstPair.slice(0, equalsAt).trim();
        if (!name) return;
        const value = firstPair.slice(equalsAt + 1).trim();
        const attributes = raw.slice(firstPair.length).toLowerCase();
        const expired =
          /(^|;)\s*max-age=\s*0(\D|$)/.test(attributes) ||
          /(^|;)\s*max-age=\s*-/.test(attributes) ||
          /(^|;)\s*expires=[^;]*1970/.test(attributes);
        if (expired) jar.delete(name);
        else jar.set(name, value);
      },
    });
  } catch {
    // Engine disallows redefining document.cookie: skip, storage shims still apply.
  }
}
