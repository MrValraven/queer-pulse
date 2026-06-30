/** Backend origin from Vite env. Empty string when unconfigured. */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? ''

/** True when a backend origin is configured; gates live mode + the demo toggle. */
export const apiAvailable: boolean = API_BASE_URL.length > 0
