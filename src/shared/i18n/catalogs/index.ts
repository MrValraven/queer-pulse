import type { Catalog, Language, Namespace } from "../types";

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
import { support as enSupport } from "./en/support";
import { connect as enConnect } from "./en/connect";
import { messages as enMessages } from "./en/messages";
import { culture as enCulture } from "./en/culture";
import { notifications as enNotifications } from "./en/notifications";
import { social as enSocial } from "./en/social";
import { pages as enPages } from "./en/pages";
import { shared as enShared } from "./en/shared";

import { common as ptCommon } from "./pt/common";
import { nav as ptNav } from "./pt/nav";
import { footer as ptFooter } from "./pt/footer";
import { auth as ptAuth } from "./pt/auth";
import { subprofiles as ptSubprofiles } from "./pt/subprofiles";
import { gatherings as ptGatherings } from "./pt/gatherings";
import { homepage as ptHomepage } from "./pt/homepage";
import { marketing as ptMarketing } from "./pt/marketing";
import { members as ptMembers } from "./pt/members";
import { magazine as ptMagazine } from "./pt/magazine";
import { communities as ptCommunities } from "./pt/communities";
import { community as ptCommunity } from "./pt/community";
import { resources as ptResources } from "./pt/resources";
import { economy as ptEconomy } from "./pt/economy";
import { studio as ptStudio } from "./pt/studio";
import { cinema as ptCinema } from "./pt/cinema";
import { settings as ptSettings } from "./pt/settings";
import { admin as ptAdmin } from "./pt/admin";
import { system as ptSystem } from "./pt/system";
import { safety as ptSafety } from "./pt/safety";
import { feed as ptFeed } from "./pt/feed";
import { forum as ptForum } from "./pt/forum";
import { topics as ptTopics } from "./pt/topics";
import { governance as ptGovernance } from "./pt/governance";
import { myevents as ptMyevents } from "./pt/myevents";
import { support as ptSupport } from "./pt/support";
import { connect as ptConnect } from "./pt/connect";
import { messages as ptMessages } from "./pt/messages";
import { culture as ptCulture } from "./pt/culture";
import { notifications as ptNotifications } from "./pt/notifications";
import { social as ptSocial } from "./pt/social";
import { pages as ptPages } from "./pt/pages";
import { shared as ptShared } from "./pt/shared";

/**
 * The full catalog registry, keyed `language → namespace → catalog`.
 *
 * Scaling note: these are statically imported so every namespace ships in the
 * main bundle. If the bundle grows heavy, switch the inner value to a lazy
 * `() => import(...)` and load per-route — the resolver only depends on the
 * `Record<Namespace, Catalog>` shape, so that change stays local to this file.
 */
export const catalogs: Record<Language, Record<Namespace, Catalog>> = {
  en: {
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
    support: enSupport,
    connect: enConnect,
    messages: enMessages,
    culture: enCulture,
    notifications: enNotifications,
    social: enSocial,
    pages: enPages,
    shared: enShared,
  },
  pt: {
    common: ptCommon,
    nav: ptNav,
    footer: ptFooter,
    auth: ptAuth,
    subprofiles: ptSubprofiles,
    gatherings: ptGatherings,
    homepage: ptHomepage,
    marketing: ptMarketing,
    members: ptMembers,
    magazine: ptMagazine,
    communities: ptCommunities,
    community: ptCommunity,
    resources: ptResources,
    economy: ptEconomy,
    studio: ptStudio,
    cinema: ptCinema,
    settings: ptSettings,
    admin: ptAdmin,
    system: ptSystem,
    safety: ptSafety,
    feed: ptFeed,
    forum: ptForum,
    topics: ptTopics,
    governance: ptGovernance,
    myevents: ptMyevents,
    support: ptSupport,
    connect: ptConnect,
    messages: ptMessages,
    culture: ptCulture,
    notifications: ptNotifications,
    social: ptSocial,
    pages: ptPages,
    shared: ptShared,
  },
};
