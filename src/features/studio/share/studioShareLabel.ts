import { shared as enShared } from "../../../shared/i18n/catalogs/en/shared";
import { shared as ptShared } from "../../../shared/i18n/catalogs/pt/shared";
import { detectLanguage, intlLocale } from "../../../shared/i18n/locale";
import { resolveEntry } from "../../../shared/i18n/translate";
import type { Catalog, Language } from "../../../shared/i18n/types";
import type { StudioShareKind } from "./studioLinkTarget";

const LABEL_PATH: Readonly<Record<StudioShareKind, string>> = {
  track: "studioShare.track",
  release: "studioShare.release",
  playlist: "studioShare.playlist",
  lyric: "studioShare.lyric",
  milestone: "studioShare.milestone",
};

const SHARED_CATALOGS: Readonly<Record<Language, Catalog>> = {
  en: enShared,
  pt: ptShared,
};

/** "Studio track", "Studio release", "Studio playlist", "Studio lyric" or
 *  "Studio milestone", as an i18n key. */
export function studioShareLabelKey(kind: StudioShareKind): string {
  return `shared:${LABEL_PATH[kind]}`;
}

/** The same label without a hook, for the inbox's live-patch path, which has
 *  no translator in scope. English is the fallback, as everywhere else. */
export function studioShareLabelText(
  kind: StudioShareKind,
  language: Language = detectLanguage(),
): string {
  const path = LABEL_PATH[kind];
  return (
    resolveEntry(SHARED_CATALOGS[language], path, intlLocale(language)) ??
    resolveEntry(enShared, path, "en") ??
    studioShareLabelKey(kind)
  );
}
