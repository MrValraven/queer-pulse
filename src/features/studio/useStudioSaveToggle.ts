import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface StudioSaveSubject {
  savedId: string;
  kind: "studio_release" | "studio_track";
  title: string;
  href: string;
  meta?: string;
}

/** Save a release or a track with the existing Saved feature (two new kinds,
 *  no separate Studio library). */
export function useStudioSaveToggle(subject: StudioSaveSubject | null) {
  const { isSaved, toggleSave } = useSaved();
  const { showToast } = useToast();
  const { t } = useTranslation();
  return {
    isSaved: subject ? isSaved(subject.savedId) : false,
    toggle: () => {
      if (!subject) return;
      const isNowSaved = toggleSave({
        id: subject.savedId,
        kind: subject.kind,
        title: subject.title,
        href: subject.href,
        meta: subject.meta,
      });
      showToast(
        isNowSaved
          ? t("studio:save.savedToast")
          : t("studio:save.removedToast"),
        isNowSaved ? "success" : "info",
      );
    },
  };
}
