import { useEffect, useRef, type JSX, type RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAperture, FiStar } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import type { VjPackDTO } from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjPackReadiness } from "../rules/vjPackReadiness";
import { vjCenteredScrollLeft, vjHiddenEdgesOf } from "./vjPackTabsScroll";
import styles from "./VjTopRow.module.css";

export type VjGridSource = "pack" | "generators";

/** The app's ease-out token (--ease-out) and fast duration (--dur-fast). */
const VJ_CHIP_TRANSITION = { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const };
const VJ_CHIP_INSTANT = { duration: 0 };
const VJ_GENERATORS_CHIP_ID = "generators";

export interface VjPackTabsProps {
  packs: readonly VjPackDTO[];
  readinessOf: (packId: string) => VjPackReadiness;
  activePackId: string | null;
  /** The pack a switch is on its way to; its chip reads as pressed meanwhile. */
  pendingPackId: string | null;
  gridSource: VjGridSource;
  isFavoritesOnly: boolean;
  isBlocked: boolean;
  blockedReasonId?: string;
  /** Called for every pack chip tap, the active pack's included (it brings the grid back to the pack). */
  onRequestPack: (packId: string) => void;
  onShowGenerators: () => void;
  onToggleFavoritesOnly: () => void;
}

/** Line two of a pack chip: the ready count, Not loaded, or nothing while no screen is open. */
function readinessLineOf(
  readiness: VjPackReadiness,
): { key: string; values: Record<string, number> } | null {
  switch (readiness.kind) {
    case "ready":
    case "partial":
      return {
        key: "vj:top.packReady",
        values: { ready: readiness.readyCount, total: readiness.totalCount },
      };
    case "notPreloaded":
      return { key: "vj:top.packNotLoaded", values: {} };
    case "noScreens":
      return null;
  }
}

/** Writes which edges hide chips onto the scroller, for the CSS edge fade. */
function markHiddenEdges(scroller: HTMLElement): void {
  const { hasHiddenStart, hasHiddenEnd } = vjHiddenEdgesOf(scroller);
  scroller.dataset.vjFadeStart = String(hasHiddenStart);
  scroller.dataset.vjFadeEnd = String(hasHiddenEnd);
}

/**
 * Glides the shown chip to the scroller's centre (clamped at the ends),
 * leaving the page where it is, and keeps the edge fade in step with the
 * scroll position and the scroller's size.
 */
function useScrollChipIntoView(
  shownChipId: string | null,
  chipCount: number,
): {
  scrollerRef: RefObject<HTMLDivElement | null>;
} {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion } = useMotionPrefs();
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller === null) return undefined;
    const update = () => markHiddenEdges(scroller);
    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(scroller);
    return () => {
      scroller.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, []);
  // A pack added or removed changes the scroll width without resizing the scroller.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller !== null) markHiddenEdges(scroller);
  }, [chipCount]);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller === null || shownChipId === null) return;
    const chip = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-vj-chip]"),
    ).find((candidate) => candidate.dataset.vjChip === shownChipId);
    if (chip === undefined || typeof scroller.scrollTo !== "function") return;
    // Centring reads offsets from the start edge; a right-to-left row keeps its place.
    if (getComputedStyle(scroller).direction === "rtl") return;
    const nextLeft = vjCenteredScrollLeft(scroller, chip);
    if (nextLeft === null) return;
    scroller.scrollTo({
      left: nextLeft,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [shownChipId, reducedMotion]);
  return { scrollerRef };
}

interface VjPackChipProps {
  pack: VjPackDTO;
  readiness: VjPackReadiness;
  isPressed: boolean;
  isPending: boolean;
  isBlocked: boolean;
  blockedReasonId?: string;
  onRequestPack: (packId: string) => void;
}

function VjPackChip({
  pack,
  readiness,
  isPressed,
  isPending,
  isBlocked,
  blockedReasonId,
  onRequestPack,
}: VjPackChipProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const transition = reducedMotion ? VJ_CHIP_INSTANT : VJ_CHIP_TRANSITION;
  const readinessLine = readinessLineOf(readiness);
  // Offline only the switch is blocked: the shown pack's chip still brings the grid back.
  const isChipBlocked = isBlocked && !isPressed;

  return (
    <m.button
      type="button"
      className={styles.chip}
      data-vj-chip={pack.id}
      data-vj-pack-readiness={readiness.kind}
      data-pending={isPending ? "true" : undefined}
      aria-pressed={isPressed}
      aria-disabled={isChipBlocked || undefined}
      aria-describedby={isChipBlocked ? blockedReasonId : undefined}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={transition}
      onClick={() => {
        if (isChipBlocked) return;
        onRequestPack(pack.id);
      }}
    >
      <span className={styles.chipFace}>
        <span className={styles.chipName}>{pack.name}</span>
        {/* A space between the lines keeps the accessible name readable; flex drops it from the layout. */}{" "}
        <AnimatePresence initial={false} mode="popLayout">
          {readinessLine !== null ? (
            <m.span
              key={readinessLine.key}
              className={styles.chipReadiness}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              {t(readinessLine.key, readinessLine.values)}
            </m.span>
          ) : null}
        </AnimatePresence>
      </span>
    </m.button>
  );
}

/**
 * The pack tabs: the favorites chip, one chip per pack with how ready the
 * screens hold it, and the Generators chip, in a row that scrolls sideways
 * on its own and keeps the shown chip in view.
 */
export function VjPackTabs({
  packs,
  readinessOf,
  activePackId,
  pendingPackId,
  gridSource,
  isFavoritesOnly,
  isBlocked,
  blockedReasonId,
  onRequestPack,
  onShowGenerators,
  onToggleFavoritesOnly,
}: VjPackTabsProps): JSX.Element {
  const { t } = useTranslation();
  const shownPackId = pendingPackId ?? activePackId;
  const shownChipId =
    gridSource === "generators" ? VJ_GENERATORS_CHIP_ID : shownPackId;
  const { scrollerRef } = useScrollChipIntoView(shownChipId, packs.length);

  return (
    <div
      ref={scrollerRef}
      className={styles.tabs}
      role="group"
      aria-label={t("vj:top.packsAria")}
      data-vj-pack-tabs=""
    >
      <button
        type="button"
        className={`${styles.chip} ${styles.iconChip}`}
        aria-pressed={isFavoritesOnly}
        aria-label={t("vj:top.favoritesOnly")}
        onClick={onToggleFavoritesOnly}
      >
        <span className={styles.chipFace}>
          <FiStar
            aria-hidden="true"
            focusable="false"
            fill={isFavoritesOnly ? "currentColor" : "none"}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {packs.map((pack) => (
          <VjPackChip
            key={pack.id}
            pack={pack}
            readiness={readinessOf(pack.id)}
            isPressed={gridSource === "pack" && shownPackId === pack.id}
            isPending={pendingPackId === pack.id}
            isBlocked={isBlocked}
            blockedReasonId={blockedReasonId}
            onRequestPack={onRequestPack}
          />
        ))}
      </AnimatePresence>
      <button
        type="button"
        className={styles.chip}
        data-vj-chip={VJ_GENERATORS_CHIP_ID}
        aria-pressed={gridSource === "generators"}
        onClick={onShowGenerators}
      >
        <span className={styles.chipFace}>
          <FiAperture aria-hidden="true" focusable="false" fill="none" />
          <span className={styles.chipName}>{t("vj:top.generators")}</span>
        </span>
      </button>
    </div>
  );
}
