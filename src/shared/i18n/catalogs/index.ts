import type { Catalog, Language, Namespace } from "../types";

// --- Shell: eager for every language -------------------------------------
//
// `common` (the default namespace for colon-less keys), `nav`, `footer`,
// `shared`, and `system` (404/error pages) are the only namespaces the app
// shell itself paints before any route has picked a page — so they stay
// statically imported for BOTH languages. This is the "minimal synchronous
// core": whichever language is active, chrome copy is always present on
// first paint, with zero chunk-load latency. Every other namespace ships as
// its own on-demand chunk via `enNamespaceLoaders` / `ptNamespaceLoaders` and
// is fetched the first time a route asks for one of its keys.

import { common as enCommon } from "./en/common";
import { nav as enNav } from "./en/nav";
import { footer as enFooter } from "./en/footer";
import { shared as enShared } from "./en/shared";
import { system as enSystem } from "./en/system";

import { common as ptCommon } from "./pt/common";
import { nav as ptNav } from "./pt/nav";
import { footer as ptFooter } from "./pt/footer";
import { shared as ptShared } from "./pt/shared";
import { system as ptSystem } from "./pt/system";

/**
 * Shared read-only stand-in for a namespace that hasn't loaded yet. Reading a
 * key off it returns `undefined`, so the resolver falls through to the EN
 * fallback (or, if EN itself is the pending one, to the key-echo path) — never
 * a thrown error. It's replaced (in provider state) by the real catalog once
 * its chunk resolves; frozen so nothing mutates it by accident in the
 * meantime.
 */
const PENDING_CATALOG: Catalog = Object.freeze({});

/**
 * Lazy loaders for every non-shell English namespace, keyed by namespace. Each
 * value is a `() => import(...)` that resolves the namespace's catalog, so
 * Vite emits one chunk per namespace and the provider can fetch them on
 * demand — mirrors `ptNamespaceLoaders` exactly.
 */
export const enNamespaceLoaders: Partial<
  Record<Namespace, () => Promise<Catalog>>
> = {
  auth: () => import("./en/auth").then((module) => module.auth),
  subprofiles: () =>
    import("./en/subprofiles").then((module) => module.subprofiles),
  gatherings: () => import("./en/gatherings").then((module) => module.gatherings),
  homepage: () => import("./en/homepage").then((module) => module.homepage),
  marketing: () => import("./en/marketing").then((module) => module.marketing),
  members: () => import("./en/members").then((module) => module.members),
  magazine: () => import("./en/magazine").then((module) => module.magazine),
  cards: () => import("./en/cards").then((module) => module.cards),
  communities: () =>
    import("./en/communities").then((module) => module.communities),
  community: () => import("./en/community").then((module) => module.community),
  resources: () => import("./en/resources").then((module) => module.resources),
  economy: () => import("./en/economy").then((module) => module.economy),
  studio: () => import("./en/studio").then((module) => module.studio),
  cinema: () => import("./en/cinema").then((module) => module.cinema),
  settings: () => import("./en/settings").then((module) => module.settings),
  simulations: () =>
    import("./en/simulations").then((module) => module.simulations),
  admin: () => import("./en/admin").then((module) => module.admin),
  safety: () => import("./en/safety").then((module) => module.safety),
  feed: () => import("./en/feed").then((module) => module.feed),
  forum: () => import("./en/forum").then((module) => module.forum),
  topics: () => import("./en/topics").then((module) => module.topics),
  governance: () => import("./en/governance").then((module) => module.governance),
  myevents: () => import("./en/myevents").then((module) => module.myevents),
  connect: () => import("./en/connect").then((module) => module.connect),
  messages: () => import("./en/messages").then((module) => module.messages),
  culture: () => import("./en/culture").then((module) => module.culture),
  notifications: () =>
    import("./en/notifications").then((module) => module.notifications),
  help: () => import("./en/help").then((module) => module.help),
};

/**
 * Lazy loaders for every non-shell Portuguese namespace — unchanged from
 * before this pass, kept as the mirror `enNamespaceLoaders` above matches.
 */
export const ptNamespaceLoaders: Partial<
  Record<Namespace, () => Promise<Catalog>>
> = {
  auth: () => import("./pt/auth").then((module) => module.auth),
  subprofiles: () =>
    import("./pt/subprofiles").then((module) => module.subprofiles),
  gatherings: () => import("./pt/gatherings").then((module) => module.gatherings),
  homepage: () => import("./pt/homepage").then((module) => module.homepage),
  marketing: () => import("./pt/marketing").then((module) => module.marketing),
  members: () => import("./pt/members").then((module) => module.members),
  magazine: () => import("./pt/magazine").then((module) => module.magazine),
  cards: () => import("./pt/cards").then((module) => module.cards),
  communities: () =>
    import("./pt/communities").then((module) => module.communities),
  community: () => import("./pt/community").then((module) => module.community),
  resources: () => import("./pt/resources").then((module) => module.resources),
  economy: () => import("./pt/economy").then((module) => module.economy),
  studio: () => import("./pt/studio").then((module) => module.studio),
  cinema: () => import("./pt/cinema").then((module) => module.cinema),
  settings: () => import("./pt/settings").then((module) => module.settings),
  simulations: () =>
    import("./pt/simulations").then((module) => module.simulations),
  admin: () => import("./pt/admin").then((module) => module.admin),
  safety: () => import("./pt/safety").then((module) => module.safety),
  feed: () => import("./pt/feed").then((module) => module.feed),
  forum: () => import("./pt/forum").then((module) => module.forum),
  topics: () => import("./pt/topics").then((module) => module.topics),
  governance: () => import("./pt/governance").then((module) => module.governance),
  myevents: () => import("./pt/myevents").then((module) => module.myevents),
  connect: () => import("./pt/connect").then((module) => module.connect),
  messages: () => import("./pt/messages").then((module) => module.messages),
  culture: () => import("./pt/culture").then((module) => module.culture),
  notifications: () =>
    import("./pt/notifications").then((module) => module.notifications),
  help: () => import("./pt/help").then((module) => module.help),
};

/** Per-language namespace-loader table, keyed the same way `catalogs` is. */
const namespaceLoadersByLanguage: Record<
  Language,
  Partial<Record<Namespace, () => Promise<Catalog>>>
> = {
  en: enNamespaceLoaders,
  pt: ptNamespaceLoaders,
};

/** True when `namespace` ships as its own on-demand chunk for `language`. */
export function isLazyNamespace(
  language: Language,
  namespace: Namespace,
): boolean {
  return namespaceLoadersByLanguage[language][namespace] !== undefined;
}

const en: Record<Namespace, Catalog> = {
  // Shell: eager.
  common: enCommon,
  nav: enNav,
  footer: enFooter,
  shared: enShared,
  system: enSystem,
  // Everything else: a pending stand-in until its chunk resolves. The
  // provider swaps the real catalog in (via state) once `enNamespaceLoaders`
  // delivers it.
  auth: PENDING_CATALOG,
  subprofiles: PENDING_CATALOG,
  gatherings: PENDING_CATALOG,
  homepage: PENDING_CATALOG,
  marketing: PENDING_CATALOG,
  members: PENDING_CATALOG,
  magazine: PENDING_CATALOG,
  cards: PENDING_CATALOG,
  communities: PENDING_CATALOG,
  community: PENDING_CATALOG,
  resources: PENDING_CATALOG,
  economy: PENDING_CATALOG,
  studio: PENDING_CATALOG,
  cinema: PENDING_CATALOG,
  settings: PENDING_CATALOG,
  simulations: PENDING_CATALOG,
  admin: PENDING_CATALOG,
  safety: PENDING_CATALOG,
  feed: PENDING_CATALOG,
  forum: PENDING_CATALOG,
  topics: PENDING_CATALOG,
  governance: PENDING_CATALOG,
  myevents: PENDING_CATALOG,
  connect: PENDING_CATALOG,
  messages: PENDING_CATALOG,
  culture: PENDING_CATALOG,
  notifications: PENDING_CATALOG,
  help: PENDING_CATALOG,
};

const pt: Record<Namespace, Catalog> = {
  // Shell: eager.
  common: ptCommon,
  nav: ptNav,
  footer: ptFooter,
  shared: ptShared,
  system: ptSystem,
  // Everything else: a pending stand-in until its chunk resolves. The provider
  // swaps the real catalog in (via state) once `ptNamespaceLoaders` delivers it.
  auth: PENDING_CATALOG,
  subprofiles: PENDING_CATALOG,
  gatherings: PENDING_CATALOG,
  homepage: PENDING_CATALOG,
  marketing: PENDING_CATALOG,
  members: PENDING_CATALOG,
  magazine: PENDING_CATALOG,
  cards: PENDING_CATALOG,
  communities: PENDING_CATALOG,
  community: PENDING_CATALOG,
  resources: PENDING_CATALOG,
  economy: PENDING_CATALOG,
  studio: PENDING_CATALOG,
  cinema: PENDING_CATALOG,
  settings: PENDING_CATALOG,
  simulations: PENDING_CATALOG,
  admin: PENDING_CATALOG,
  safety: PENDING_CATALOG,
  feed: PENDING_CATALOG,
  forum: PENDING_CATALOG,
  topics: PENDING_CATALOG,
  governance: PENDING_CATALOG,
  myevents: PENDING_CATALOG,
  connect: PENDING_CATALOG,
  messages: PENDING_CATALOG,
  culture: PENDING_CATALOG,
  notifications: PENDING_CATALOG,
  help: PENDING_CATALOG,
};

/**
 * The catalog registry, keyed `language → namespace → catalog`.
 *
 * Both languages carry their shell namespaces eagerly and a
 * {@link PENDING_CATALOG} placeholder for every other namespace until the
 * provider loads the real one via {@link loadNamespace}. The shape stays
 * `Record<Language, Record<Namespace, Catalog>>` so existing synchronous
 * consumers of the *shell* namespaces (the resolver, adapter tests reading
 * `catalogs.en.common`, etc.) are unaffected. Reading a non-shell namespace
 * off here directly (e.g. `catalogs.en.cinema`) returns the pending
 * placeholder until it's been loaded — prefer {@link loadNamespace} (or
 * `catalogFor` in `parity.test.ts`) for anything that needs the real catalog.
 */
export const catalogs: Record<Language, Record<Namespace, Catalog>> = {
  en,
  pt,
};

const namespaceLoads: Record<Language, Map<Namespace, Promise<Catalog>>> = {
  en: new Map(),
  pt: new Map(),
};

/**
 * Load a single namespace for `language` on demand, caching the
 * in-flight/settled promise so concurrent callers and re-renders share one
 * fetch. Namespaces without a lazy loader (the eager shell) resolve
 * immediately to their already-present catalog.
 */
export function loadNamespace(
  language: Language,
  namespace: Namespace,
): Promise<Catalog> {
  const cache = namespaceLoads[language];
  const cached = cache.get(namespace);
  if (cached) return cached;

  const loader = namespaceLoadersByLanguage[language][namespace];
  const load = loader ? loader() : Promise.resolve(catalogs[language][namespace]);
  cache.set(namespace, load);
  return load;
}

/**
 * `loadNamespace("pt", namespace)` under its historical name — kept because
 * out-of-scope call sites (e.g. `formatNotification.test.ts`) already import
 * it directly.
 */
export function loadPtNamespace(namespace: Namespace): Promise<Catalog> {
  return loadNamespace("pt", namespace);
}
