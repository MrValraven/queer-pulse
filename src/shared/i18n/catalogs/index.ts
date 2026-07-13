import type { Catalog, Language, Namespace } from "../types";

import { common as enCommon } from "./en/common";
import { nav as enNav } from "./en/nav";
import { footer as enFooter } from "./en/footer";
import { auth as enAuth } from "./en/auth";

import { common as ptCommon } from "./pt/common";
import { nav as ptNav } from "./pt/nav";
import { footer as ptFooter } from "./pt/footer";
import { auth as ptAuth } from "./pt/auth";

/**
 * The full catalog registry, keyed `language → namespace → catalog`.
 *
 * Scaling note: these are statically imported so every namespace ships in the
 * main bundle — fine at this size. When the catalog grows past a handful of
 * feature namespaces, switch the inner value to a lazy `() => import(...)` and
 * load per-route. The resolver only depends on the `Record<Namespace, Catalog>`
 * shape, so that change stays local to this file.
 */
export const catalogs: Record<Language, Record<Namespace, Catalog>> = {
  en: {
    common: enCommon,
    nav: enNav,
    footer: enFooter,
    auth: enAuth,
  },
  pt: {
    common: ptCommon,
    nav: ptNav,
    footer: ptFooter,
    auth: ptAuth,
  },
};
