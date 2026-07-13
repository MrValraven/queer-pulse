import { captureException } from "./sentry";

type Extra = Record<string, unknown>;

/**
 * The single sanctioned place for console output and the bridge to error
 * monitoring (spec 01). Everywhere else in `src` stays console-free — route
 * diagnostics through here. In production the console is silent and errors go
 * to the monitor; in dev we also echo locally for visibility.
 */
export function logError(error: unknown, extra?: Extra): void {
  captureException(error, extra);
  if (import.meta.env.DEV) console.error("[qp]", error, extra ?? "");
}

export function logWarn(message: string, extra?: Extra): void {
  if (import.meta.env.DEV) console.warn("[qp]", message, extra ?? "");
}

export function logInfo(message: string, extra?: Extra): void {
  if (import.meta.env.DEV) console.info("[qp]", message, extra ?? "");
}
