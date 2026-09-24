import { useCallback, useState } from "react";
import type { Language } from "../../../shared/i18n/types";
import type { EmailLocaleContent } from "./emailTemplate.types";
import {
  isSameContent,
  portugueseFromEnglish,
  type EmailTemplateDraft,
} from "./emailTemplateDraft";

type MetaPatch = Partial<
  Pick<EmailTemplateDraft, "label" | "purpose" | "isActive">
>;

/** The editor's working copy plus the last saved copy, so "unsaved" is a plain
 *  comparison. Every setter is functional, so fast edits never stack on a
 *  stale draft. */
export function useEmailTemplateDraft(initial: EmailTemplateDraft) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);

  const setMeta = useCallback(
    (patch: MetaPatch) => setDraft((current) => ({ ...current, ...patch })),
    [],
  );

  const updateLocale = useCallback(
    (
      locale: Language,
      update: (content: EmailLocaleContent) => EmailLocaleContent,
    ) =>
      setDraft((current) => {
        const content = current.locales[locale];
        if (!content) return current;
        return {
          ...current,
          locales: { ...current.locales, [locale]: update(content) },
        };
      }),
    [],
  );

  const startPortuguese = useCallback(
    () =>
      setDraft((current) => ({
        ...current,
        locales: {
          ...current.locales,
          pt: portugueseFromEnglish(current.locales.en),
        },
      })),
    [],
  );

  const removePortuguese = useCallback(
    () =>
      setDraft((current) => ({
        ...current,
        locales: { ...current.locales, pt: null },
      })),
    [],
  );

  const markSaved = useCallback((next: EmailTemplateDraft) => {
    setSaved(next);
    setDraft(next);
  }, []);

  return {
    draft,
    isDirty: !isSameContent(draft, saved),
    isLocaleDirty: (locale: Language) =>
      !isSameContent(draft.locales[locale], saved.locales[locale]),
    setMeta,
    updateLocale,
    startPortuguese,
    removePortuguese,
    markSaved,
  };
}
