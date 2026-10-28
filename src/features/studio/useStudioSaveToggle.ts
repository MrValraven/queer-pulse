import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";

export interface StudioSaveSubject {
  savedId: string;
  kind: "studio_release" | "studio_track" | "studio_playlist";
  title: string;
  href: string;
  meta?: string;
}

/** Keeps a release, a track or a playlist in the existing Saved feature
 *  (its Studio kinds). A hero's heart likes a release, a show or a playlist
 *  through it, so a like is a save: the Library and the rail read it back. */
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
          ? t("studio:like.collectionAddedToast")
          : t("studio:like.collectionRemovedToast"),
        isNowSaved ? "success" : "info",
      );
    },
  };
}
