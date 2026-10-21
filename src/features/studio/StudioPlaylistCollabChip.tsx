import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { FiUsers } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { keepOnFrameLoop } from "../gatherings/checkin/checkinMotion";
import type { StudioPlaylistView } from "./api/studio.adapters";
import { studioKeys } from "./api/studioQueryKeys";
import { useStudioPlaylistEditors } from "./api/useStudioPlaylistEditors";
import { StudioPlaylistPersonAvatar } from "./StudioPlaylistPersonAvatar";
import css from "./StudioPlaylistCollabChip.module.css";

/** How many editor faces the chip shows before "+N". */
const STACK_LIMIT = 3;

/** Asks for the editors list again when the playlist's editor count and the
 *  active rows loaded disagree. Each disagreement asks once, so a server
 *  that keeps answering the same rows cannot start a loop. */
function useRefetchEditorsOnCountDrift(
  playlist: StudioPlaylistView,
  activeEditorCount: number,
  isLoaded: boolean,
) {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const askedDriftRef = useRef<string | null>(null);
  const expectedCount = playlist.editorCount;
  useEffect(() => {
    if (!isLoaded || expectedCount === null) return;
    if (expectedCount === activeEditorCount) return;
    const drift = `${playlist.id}:${expectedCount}:${activeEditorCount}`;
    if (askedDriftRef.current === drift) return;
    askedDriftRef.current = drift;
    void queryClient.invalidateQueries({
      queryKey: studioKeys.playlistEditors(demoMode, playlist.id),
    });
  }, [
    isLoaded,
    expectedCount,
    activeEditorCount,
    playlist.id,
    demoMode,
    queryClient,
  ]);
}

/** For the owner and editors of a playlist with editors: "Collaborative"
 *  with up to three active editors' faces. It opens the editors sheet.
 *  Listeners and invitees never get here: the adapter clears the count for
 *  them. Mount inside AnimatePresence so it fades in and out. */
export function StudioPlaylistCollabChip({
  playlist,
  onOpen,
}: {
  playlist: StudioPlaylistView;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { editors, loadState } = useStudioPlaylistEditors(playlist.id, {
    isEnabled: playlist.isCollaborative,
  });
  const activeEditors = editors.filter((editor) => !editor.isPending);
  useRefetchEditorsOnCountDrift(
    playlist,
    activeEditors.length,
    playlist.isCollaborative && !loadState.isLoading && !loadState.isError,
  );
  const shownEditors = activeEditors.slice(0, STACK_LIMIT);
  const editorCount = playlist.editorCount ?? activeEditors.length;
  const hiddenCount = Math.max(0, editorCount - shownEditors.length);
  const fadeMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reducedMotion ? 0 : 0.2, ease: "easeOut" },
    onUpdate: keepOnFrameLoop,
  } as const;
  return (
    <m.span className={css.chipWrap} {...fadeMotion}>
      <Button
        variant="quiet"
        size="sm"
        className={css.chip}
        aria-label={t("studio:playlist.collab.openAria", {
          count: editorCount,
        })}
        onClick={onOpen}
      >
        <FiUsers aria-hidden className={css.icon} />
        <span>{t("studio:playlist.collab.chip")}</span>
        <AnimatePresence initial={false}>
          {shownEditors.length > 0 && (
            <m.span
              key="stack"
              className={css.stack}
              aria-hidden
              {...fadeMotion}
            >
              {shownEditors.map((editor) => (
                <span key={editor.editorId} className={css.face}>
                  <StudioPlaylistPersonAvatar
                    person={editor.person}
                    size={20}
                  />
                </span>
              ))}
              <AnimatePresence initial={false}>
                {hiddenCount > 0 && (
                  <m.span key="more" className={css.more} {...fadeMotion}>
                    {t("studio:playlist.collab.moreCount", {
                      count: hiddenCount,
                    })}
                  </m.span>
                )}
              </AnimatePresence>
            </m.span>
          )}
        </AnimatePresence>
      </Button>
    </m.span>
  );
}
