// Single source for the "tint / category → CSS-module class" mappings shared
// across the Communities section components. These stay in a plain module
// (not a *.data.ts) because they depend on the CSS-module import, and living
// here keeps the component files free of the react-refresh mixed-export rule.
import type { CommunityFace, FullCommunity } from "./Communities.data";
import styles from "./Communities.module.css";

type FullCategory = FullCommunity["category"];

export const FACE_TINT: Record<CommunityFace["tint"], string | undefined> = {
  coral: styles.faceCoral,
  jade: styles.faceJade,
  plum: styles.facePlum,
  violet: styles.faceViolet,
};

export const CAT_CLASS: Record<FullCategory, string | undefined> = {
  social: styles.cat_social,
  arts: styles.cat_arts,
  support: styles.cat_support,
  activism: styles.cat_activism,
};

export const WD_CLASS: Record<FullCategory, string | undefined> = {
  social: styles.wd_social,
  arts: styles.wd_arts,
  support: styles.wd_support,
  activism: styles.wd_activism,
};

export const DOT: Record<string, string | undefined> = {
  social: styles.dotSocial,
  arts: styles.dotArts,
  support: styles.dotSupport,
  activism: styles.dotActivism,
  quiet: styles.dotQuiet,
};

// i18n Pattern A — a fixed set of platform-defined category labels (chrome);
// consumers resolve with `t()`.
export const CAT_LABEL_KEY: Record<string, string> = {
  social: "homepage:communities.category.social",
  arts: "homepage:communities.category.arts",
  support: "homepage:communities.category.support",
  activism: "homepage:communities.category.activism",
  quiet: "homepage:communities.access.private",
};
