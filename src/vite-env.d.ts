/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  readonly VITE_KLIPY_KEY?: string;
}

/**
 * This build's version (e.g. "v1.43.0"), the newest Changelog release, set by
 * `define` in vite.config.ts. The same value is published at /version.json.
 */
declare const __APP_VERSION__: string;
