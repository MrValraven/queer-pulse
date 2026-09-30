import { useEffect, useState } from "react";

/** The shape every Changelog version takes (see changelogReleases.ts). */
const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/;

/** The version inside a parsed /version.json body, when it is well formed. */
function readVersion(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) return undefined;
  const version = (payload as { version?: unknown }).version;
  if (typeof version !== "string" || !VERSION_PATTERN.test(version)) {
    return undefined;
  }
  return version;
}

/**
 * The version of the build that is waiting to take over, read from
 * `/version.json` (emitted by the `qp:version-json` plugin in vite.config.ts).
 *
 * The running bundle is the OLD build, so the server is the only place that
 * knows what the new one is called. The fetch runs once each time
 * `isUpdateWaiting` turns true, with `no-store` so the answer always comes from
 * the network.
 *
 * Returns `undefined` until a valid answer arrives, and stays `undefined` on
 * any failure (offline, 404, malformed JSON): the card then shows its generic
 * headline, which is a perfectly good fallback, so there are no retries. It
 * also stays `undefined` when the server reports the version this bundle
 * already runs, which is what a same-day redeploy looks like.
 */
export function useNextBuildVersion(
  isUpdateWaiting: boolean,
): string | undefined {
  const [nextVersion, setNextVersion] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isUpdateWaiting) return;
    const abortController = new AbortController();

    fetch("/version.json", {
      cache: "no-store",
      signal: abortController.signal,
    })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((payload: unknown) => {
        const version = readVersion(payload);
        if (version && version !== __APP_VERSION__) setNextVersion(version);
      })
      .catch(() => {
        // Offline, aborted, or a body that is not JSON. The generic headline
        // covers all of them.
      });

    return () => abortController.abort();
  }, [isUpdateWaiting]);

  return nextVersion;
}
