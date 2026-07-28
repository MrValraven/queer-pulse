import type { Catalog, Language, Namespace } from "../types";

// --- English: fully eager -----------------------------------------------
//
// EN is the resolver's universal fallback (see `I18nProvider`): every key
// resolves against the active language first, then against EN. Keeping the
// whole EN catalog statically imported means that fallback is *always*
// synchronously available, so a not-yet-loaded lazy namespace degrades to a
// real English string rather than flashing the raw key. It's also read
// synchronously by adapter/parity tests. EN therefore stays eager on purpose;
// splitting it too would need a Suspense boundary or a route→namespace preload
// map to preserve that no-raw-key guarantee.

import { common as enCommon } from "./en/common";
import { nav as enNav } from "./en/nav";
import { footer as enFooter } from "./en/footer";
import { auth as enAuth } from "./en/auth";
import { subprofiles as enSubprofiles } from "./en/subprofiles";
import { gatherings as enGatherings } from "./en/gatherings";
import { homepage as enHomepage } from "./en/homepage";
import { marketing as enMarketing } from "./en/marketing";
import { members as enMembers } from "./en/members";
import { magazine as enMagazine } from "./en/magazine";
import { communities as enCommunities } from "./en/communities";
import { community as enCommunity } from "./en/community";
import { resources as enResources } from "./en/resources";
import { economy as enEconomy } from "./en/economy";
import { studio as enStudio } from "./en/studio";
import { cinema as enCinema } from "./en/cinema";
import { settings as enSettings } from "./en/settings";
import { admin as enAdmin } from "./en/admin";
import { system as enSystem } from "./en/system";
import { safety as enSafety } from "./en/safety";
import { feed as enFeed } from "./en/feed";
import { forum as enForum } from "./en/forum";
import { topics as enTopics } from "./en/topics";
import { governance as enGovernance } from "./en/governance";
import { myevents as enMyevents } from "./en/myevents";
import { connect as enConnect } from "./en/connect";
import { messages as enMessages } from "./en/messages";
import { culture as enCulture } from "./en/culture";
import { notifications as enNotifications } from "./en/notifications";
import { social as enSocial } from "./en/social";
import { pages as enPages } from "./en/pages";
import { shared as enShared } from "./en/shared";

// --- Portuguese: shell eager, everything else lazy ----------------------
//
// Only the handful of namespaces the app shell paints (nav, footer, the
// `common` default namespace, `shared`, and the `system`/404 pages) are
// statically imported, so a Portuguese visitor gets a correct shell on first
// paint. Every other PT namespace ships as its own on-demand chunk via
// `ptNamespaceLoaders` and is fetched the first time a route asks for one of
// its keys. English visitors never download any of it.

import { common as ptCommon } from "./pt/common";
import { nav as ptNav } from "./pt/nav";
import { footer as ptFooter } from "./pt/footer";
import { shared as ptShared } from "./pt/shared";
import { system as ptSystem } from "./pt/system";

const en: Record<Namespace, Catalog> = {
  common: enCommon,
  nav: enNav,
  footer: enFooter,
  auth: enAuth,
  subprofiles: enSubprofiles,
  gatherings: enGatherings,
  homepage: enHomepage,
  marketing: enMarketing,
  members: enMembers,
  magazine: enMagazine,
  communities: enCommunities,
  community: enCommunity,
  resources: enResources,
  economy: enEconomy,
  studio: enStudio,
  cinema: enCinema,
  settings: enSettings,
  admin: enAdmin,
  system: enSystem,
  safety: enSafety,
  feed: enFeed,
  forum: enForum,
  topics: enTopics,
  governance: enGovernance,
  myevents: enMyevents,
  connect: enConnect,
  messages: enMessages,
  culture: enCulture,
  notifications: enNotifications,
  social: enSocial,
  pages: enPages,
  shared: enShared,
};

/**
 * Shared read-only stand-in for a PT namespace that hasn't loaded yet. Reading
 * a key off it returns `undefined`, so the resolver falls through to EN — a
 * real translation, never a raw key. It's replaced (in provider state) by the
 * real catalog once its chunk resolves; frozen so nothing mutates it by
 * accident in the meantime.
 */
const PENDING_CATALOG: Catalog = Object.freeze({});

/**
 * Namespaces the app shell renders. These stay eagerly bundled for both
 * languages so nav/footer/404 paint correctly before any lazy chunk arrives.
 */
export const SHELL_NAMESPACES = [
  "common",
  "nav",
  "footer",
  "shared",
  "system",
] as const satisfies readonly Namespace[];

/**
 * Lazy loaders for every non-shell PT namespace, keyed by namespace. Each value
 * is a `() => import(...)` that resolves the namespace's catalog, so Vite emits
 * one chunk per namespace and the provider can fetch them on demand. A
 * namespace is "lazy" iff it has an entry here.
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
  communities: () =>
    import("./pt/communities").then((module) => module.communities),
  community: () => import("./pt/community").then((module) => module.community),
  resources: () => import("./pt/resources").then((module) => module.resources),
  economy: () => import("./pt/economy").then((module) => module.economy),
  studio: () => import("./pt/studio").then((module) => module.studio),
  cinema: () => import("./pt/cinema").then((module) => module.cinema),
  settings: () => import("./pt/settings").then((module) => module.settings),
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
  social: () => import("./pt/social").then((module) => module.social),
  pages: () => import("./pt/pages").then((module) => module.pages),
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
  communities: PENDING_CATALOG,
  community: PENDING_CATALOG,
  resources: PENDING_CATALOG,
  economy: PENDING_CATALOG,
  studio: PENDING_CATALOG,
  cinema: PENDING_CATALOG,
  settings: PENDING_CATALOG,
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
  social: PENDING_CATALOG,
  pages: PENDING_CATALOG,
};

/**
 * The catalog registry, keyed `language → namespace → catalog`.
 *
 * `en` is complete and eager. `pt` carries its shell namespaces eagerly and a
 * {@link PENDING_CATALOG} placeholder for each lazy namespace until the
 * provider loads the real one via {@link ptNamespaceLoaders}. The shape stays
 * `Record<Language, Record<Namespace, Catalog>>` so existing synchronous
 * consumers (the resolver's EN fallback, adapter tests) are unaffected.
 */
export const catalogs: Record<Language, Record<Namespace, Catalog>> = {
  en,
  pt,
};

const ptLoads = new Map<Namespace, Promise<Catalog>>();

/**
 * Load a single PT namespace on demand, caching the in-flight/settled promise so
 * concurrent callers and re-renders share one fetch. Namespaces without a lazy
 * loader (the eager shell) resolve immediately to their already-present catalog.
 */
export function loadPtNamespace(namespace: Namespace): Promise<Catalog> {
  const cached = ptLoads.get(namespace);
  if (cached) return cached;

  const loader = ptNamespaceLoaders[namespace];
  const load = loader
    ? loader()
    : Promise.resolve(catalogs.pt[namespace]);
  ptLoads.set(namespace, load);
  return load;
}
