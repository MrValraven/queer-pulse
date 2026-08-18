import type { Tint } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

/** Shared avatar tint lookup for the aside's "who runs it" owner avatar and
 * the "members here lately" roster — kept out of the data layer since it maps
 * onto CSS-module class names (see component-decomposition's data-file
 * exception). */
export const TINT: Record<Tint, string> = {
  coral: s.tCoral!,
  jade: s.tJade!,
  plum: s.tPlum!,
};
