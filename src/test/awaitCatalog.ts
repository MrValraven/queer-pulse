import { act } from "@testing-library/react";
import { loadNamespace } from "../shared/i18n/catalogs";
import type { Namespace } from "../shared/i18n/types";

/** Waits until the English catalogs of `namespaces` are loaded and painted.
 *  `I18nProvider` fetches every non-shell namespace on demand, so right after
 *  `render` its copy is blank (an empty `aria-label`, a missing heading) and a
 *  synchronous assertion races the chunk. Call it right after `render`, once
 *  the provider has queued the fetch: it awaits the same cached load the
 *  provider does, then yields one task inside `act` so the provider's state
 *  update and the re-render it causes have both flushed. */
export async function awaitCatalog(...namespaces: Namespace[]): Promise<void> {
  await act(async () => {
    await Promise.all(
      namespaces.map((namespace) => loadNamespace("en", namespace)),
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  });
}
