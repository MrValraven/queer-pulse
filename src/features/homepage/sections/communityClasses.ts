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

export const CAT_LABEL: Record<string, string> = {
  social: "Social",
  arts: "Arts",
  support: "Support",
  activism: "Activism",
  quiet: "Private",
};
