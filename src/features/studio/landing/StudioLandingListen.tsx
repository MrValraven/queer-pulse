import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiInfo } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioLandingPreviewView } from "../api/studioLanding.adapters";
import { useStudioLanding } from "../api/useStudioLanding";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
  studioStaggerDelay,
} from "../studioMotion";
import {
  STUDIO_LANDING_LISTEN_ID,
  STUDIO_LANDING_LISTEN_REASON_KEY,
} from "./studioLanding.data";
import { StudioLandingListenRow } from "./StudioLandingListenRow";
import {
  useStudioLandingPlayer,
  type StudioLandingPlayerState,
} from "./useStudioLandingPlayer";
import styles from "./StudioLandingListen.module.css";

const NO_MOTION = { duration: 0 } as const;

/** What the always-mounted status region says for the last pick. */
function useAnnouncement(
  previews: readonly StudioLandingPreviewView[],
  state: StudioLandingPlayerState,
  lastPickedId: string | null,
): string {
  const { t } = useTranslation();
  const active = previews.find((preview) => preview.id === state.activeId);
  if (active && state.status === "playing") {
    return t("studio:landing.listen.playing", {
      track: active.trackTitle,
      artist: active.artist.name,
    });
  }
  if (active && state.status === "paused") {
    return t("studio:landing.listen.paused", { track: active.trackTitle });
  }
  const failure = lastPickedId ? state.failures[lastPickedId] : undefined;
  return failure ? t(STUDIO_LANDING_LISTEN_REASON_KEY[failure]) : "";
}

function ListenItem({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.li
      className={styles.item}
      initial={
        reducedMotion
          ? { opacity: 0 }
          : { opacity: 0, height: 0, overflow: "hidden" }
      }
      animate={{
        opacity: 1,
        height: "auto",
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        opacity: 0,
        ...(reducedMotion ? {} : { height: 0, overflow: "hidden" }),
        transition: reducedMotion ? NO_MOTION : STUDIO_DISCLOSURE_EXIT,
      }}
      transition={
        reducedMotion
          ? NO_MOTION
          : { ...STUDIO_DISCLOSURE, delay: studioStaggerDelay(index) }
      }
      inert={!isPresent}
    >
      {children}
    </m.li>
  );
}

/**
 * "Hear it first": the tracks our team picked and the artists approved for
 * this page, on the landing's own player. The section stays folded away
 * until the landing read brings at least one preview. Playback keeps going
 * when the visitor scrolls past and stops when they leave the page. The
 * heading takes focus from the hero's "Hear it first" link, so it carries
 * `tabIndex={-1}`.
 */
export function StudioLandingListen({
  id = STUDIO_LANDING_LISTEN_ID,
}: { id?: string } = {}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { landing } = useStudioLanding();
  const { state, toggle, retry, stopIfAbsent } = useStudioLandingPlayer();
  const [lastPickedId, setLastPickedId] = useState<string | null>(null);
  const landingPreviews = landing?.previews;
  const previews = landingPreviews ?? [];
  useEffect(() => {
    stopIfAbsent((landingPreviews ?? []).map((preview) => preview.id));
  }, [landingPreviews, stopIfAbsent]);
  const announcement = useAnnouncement(previews, state, lastPickedId);
  const headingId = `${id}-heading`;

  return (
    <>
      <Collapse isOpen={previews.length > 0}>
        <section id={id} className={styles.section} aria-labelledby={headingId}>
          <p className={styles.eyebrow}>{t("studio:landing.listen.eyebrow")}</p>
          <h2 id={headingId} className={styles.title} tabIndex={-1}>
            <Translation
              i18nKey="studio:landing.listen.title"
              components={{ em: <em /> }}
            />
          </h2>
          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- list-style none drops the list role in Safari */}
          <ul
            className={styles.list}
            role="list"
            aria-label={t("studio:landing.listen.listLabel")}
          >
            <AnimatePresence initial={false}>
              {previews.map((preview, index) => (
                <ListenItem key={preview.id} index={index}>
                  <StudioLandingListenRow
                    preview={preview}
                    state={state}
                    onToggle={() => {
                      setLastPickedId(preview.id);
                      toggle(preview);
                    }}
                    onRetry={() => {
                      setLastPickedId(preview.id);
                      retry(preview);
                    }}
                  />
                </ListenItem>
              ))}
            </AnimatePresence>
          </ul>
          <p className={styles.note}>{t("studio:landing.listen.note")}</p>
          <Collapse isOpen={demoMode}>
            <p className={styles.sampleNote}>
              <FiInfo aria-hidden="true" />
              {t("studio:landing.demoSampleNote")}
            </p>
          </Collapse>
        </section>
      </Collapse>
      <p role="status" className="visuallyHidden">
        {announcement}
      </p>
    </>
  );
}
