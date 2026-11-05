import { useId, type CSSProperties, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO, VjScreenStatus } from "../../../shared/contracts/vj";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  vjClipReadinessOf,
  type VjClipReadiness,
} from "../live/vjScreensSummary";
import styles from "./VjRemote.module.css";

interface VjRemoteClipGridProps {
  clips: readonly VjClipDTO[];
  liveClipId: string | null;
  packId: string | null;
  screens: readonly VjScreenStatus[];
  isBlocked: boolean;
  onGoClip: (clipId: string) => void;
}

/** The shared Collapse curve and length, for the tile's fold and fades. */
const TILE_EASE = [0.22, 0.68, 0.16, 1] as const;
const TILE_MOTION_SECONDS = 0.28;

/** A tile is dimmed until every covering screen holds its clip. */
function isNotLoaded(readiness: VjClipReadiness): boolean {
  return (
    readiness.state === "queued" ||
    readiness.state === "loading" ||
    readiness.state === "failed"
  );
}

function VjClipReadinessLine({
  readiness,
  id,
}: {
  readiness: VjClipReadiness;
  id: string;
}): JSX.Element | null {
  const { t } = useTranslation();
  if (readiness.state === "failed") {
    return (
      <span id={id} className={styles.tileReadiness}>
        <span className={styles.tileFailed}>{t("vj:remote.clipFailed")}</span>
        {readiness.failure !== null ? (
          <span className={styles.tileFailure}>
            {t(`vj:preload.failure.${readiness.failure}`)}
          </span>
        ) : null}
      </span>
    );
  }
  if (readiness.state === "loading") {
    return (
      <span id={id} className={styles.tileReadiness}>
        {t("vj:remote.clipLoading", {
          percent: Math.round(readiness.progress * 100),
        })}
      </span>
    );
  }
  if (readiness.state === "queued") {
    return (
      <span id={id} className={styles.tileReadiness}>
        {t("vj:remote.clipQueued")}
      </span>
    );
  }
  return null;
}

interface VjRemoteClipTileProps {
  clip: VjClipDTO;
  isLive: boolean;
  readiness: VjClipReadiness;
  isBlocked: boolean;
  onGoClip: (clipId: string) => void;
}

function VjRemoteClipTile({
  clip,
  isLive,
  readiness,
  isBlocked,
  onGoClip,
}: VjRemoteClipTileProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const readinessId = useId();
  const isDimmed = isNotLoaded(readiness);
  const hasReadinessLine = isDimmed;
  const hasProgress =
    readiness.state === "queued" || readiness.state === "loading";
  const progressStyle = {
    transform: `scaleX(${readiness.progress})`,
  } satisfies CSSProperties;
  const duration = reducedMotion ? 0 : TILE_MOTION_SECONDS;
  const fade = { duration, ease: TILE_EASE };

  return (
    <button
      type="button"
      className={styles.tile}
      aria-label={t("vj:remote.clipAria", { title: clip.title })}
      aria-describedby={hasReadinessLine ? readinessId : undefined}
      aria-current={isLive ? "true" : undefined}
      aria-disabled={isBlocked}
      data-live={isLive ? "true" : undefined}
      data-readiness={readiness.state}
      data-dimmed={isDimmed ? "true" : undefined}
      onClick={() => {
        if (!isBlocked) onGoClip(clip.id);
      }}
    >
      <span className={styles.tileMedia}>
        <img
          className={styles.tileThumbnail}
          src={clip.thumbnailUrl}
          alt=""
          width={clip.width}
          height={clip.height}
          loading="lazy"
          decoding="async"
        />
        <AnimatePresence initial={false}>
          {isLive ? (
            <m.span
              key="live"
              className={styles.liveTag}
              data-vj-live-tag=""
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={fade}
            >
              {t("vj:remote.clipLive")}
            </m.span>
          ) : null}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {hasProgress ? (
            <m.span
              key="progress"
              className={styles.tileProgress}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              <span
                className={styles.tileProgressFill}
                style={progressStyle}
                data-vj-progress={readiness.progress}
              />
            </m.span>
          ) : null}
        </AnimatePresence>
      </span>
      <span className={styles.tileTitle}>{clip.title}</span>
      <AnimatePresence initial={false}>
        {hasReadinessLine ? (
          // The Collapse fold on a span: a div may not sit inside a button.
          <m.span
            key="readiness"
            className={styles.tileReadinessFold}
            data-vj-readiness-line=""
            initial={{ height: 0, opacity: 0, overflow: "hidden" }}
            animate={{ height: "auto", opacity: 1, overflow: "visible" }}
            exit={{
              height: 0,
              opacity: 0,
              overflow: "hidden",
              transition: { ...fade, overflow: { duration: 0 } },
            }}
            transition={{
              ...fade,
              overflow: { duration: 0, delay: duration },
            }}
          >
            <VjClipReadinessLine readiness={readiness} id={readinessId} />
          </m.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}

/**
 * The active pack's clips: two columns on a phone, three from 600px. A tap
 * sends the clip live with the transition the stage holds; the live tile is
 * outlined in coral, and a tile the screens have not loaded is dimmed with
 * its progress or the reason it failed. It stays browsable while offline.
 */
export function VjRemoteClipGrid({
  clips,
  liveClipId,
  packId,
  screens,
  isBlocked,
  onGoClip,
}: VjRemoteClipGridProps): JSX.Element {
  return (
    <ul className={styles.grid} data-vj-remote-grid="">
      <AnimatePresence initial={false}>
        {clips.map((clip) => (
          <CollapseListItem key={clip.id}>
            <VjRemoteClipTile
              clip={clip}
              isLive={clip.id === liveClipId}
              readiness={
                packId === null
                  ? { state: "unknown", progress: 0, failure: null }
                  : vjClipReadinessOf(screens, packId, clip.id)
              }
              isBlocked={isBlocked}
              onGoClip={onGoClip}
            />
          </CollapseListItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
