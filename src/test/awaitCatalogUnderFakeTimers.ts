import { act } from "@testing-library/react";
import { loadNamespace } from "../shared/i18n/catalogs";
import type { Namespace } from "../shared/i18n/types";

/** How many microtask turns the provider needs to queue, load and paint. */
const MICROTASK_TURNS = 10;

/** `awaitCatalog` for suites that fake `setTimeout` before they render.
 *  `awaitCatalog` yields one real task, which a faked clock never runs. This
 *  waits on microtasks alone: the cached chunk load, the provider's queued
 *  drain and its state update all settle on the microtask queue, which Vitest
 *  leaves real by default, so the faked clock stays exactly where the test
 *  put it. */
export async function awaitCatalogUnderFakeTimers(
  ...namespaces: Namespace[]
): Promise<void> {
  await act(async () => {
    await Promise.all(
      namespaces.map((namespace) => loadNamespace("en", namespace)),
    );
    for (let turn = 0; turn < MICROTASK_TURNS; turn += 1) {
      await Promise.resolve();
    }
  });
}
