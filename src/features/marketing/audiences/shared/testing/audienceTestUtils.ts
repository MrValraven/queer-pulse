import { loadNamespace } from "../../../../../shared/i18n/catalogs";
import type {
  Catalog,
  Language,
  Namespace,
  TFunction,
} from "../../../../../shared/i18n/types";

/**
 * Test helpers for the audience pages. Imported by tests only.
 */

/** The elements that sit outside every `inert` subtree. jsdom does not apply
 *  `inert`, so the tests filter by hand (the one-h1 rule, for one). */
export function outsideInert<T extends Element>(elements: readonly T[]): T[] {
  return elements.filter((element) => element.closest("[inert]") === null);
}

/** Every id used by more than one element under `container`. */
export function duplicateIds(container: ParentNode): string[] {
  const counts = new Map<string, number>();
  for (const element of container.querySelectorAll("[id]")) {
    counts.set(element.id, (counts.get(element.id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);
}

/**
 * A `t` over the real catalogs for `namespaces`: resolves `"ns:key"`, fills
 * `{token}` placeholders, and returns the key itself when it is missing, so
 * an assertion on copy fails loudly on a missing key.
 */
export async function loadTestT(
  language: Language,
  namespaces: readonly Namespace[],
): Promise<TFunction> {
  const loaded = new Map<string, Catalog>();
  for (const namespace of namespaces) {
    loaded.set(namespace, await loadNamespace(language, namespace));
  }
  return (key, options) => {
    const separatorIndex = key.indexOf(":");
    const namespace = separatorIndex >= 0 ? key.slice(0, separatorIndex) : "";
    const path = separatorIndex >= 0 ? key.slice(separatorIndex + 1) : key;
    const template = loaded.get(namespace)?.[path];
    if (template === undefined) return key;
    return Object.entries(options ?? {}).reduce(
      (text, [token, tokenValue]) =>
        tokenValue === undefined
          ? text
          : text.split(`{${token}}`).join(String(tokenValue)),
      template,
    );
  };
}
