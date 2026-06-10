export type Language = 'en' | 'pt'

/** Flat key → translated string. Keys are dot-namespaced, e.g. `nav.members`. */
export type StringCatalog = Record<string, string>
