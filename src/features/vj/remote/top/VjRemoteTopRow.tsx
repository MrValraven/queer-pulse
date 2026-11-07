import type { JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiArrowLeft, FiSearch, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { routes } from "../../../../app/routeMap";
import type {
  VjPackDTO,
  VjScreenStatus,
} from "../../../../shared/contracts/vj";
import { Button } from "../../../../shared/components/ui/Button";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  summariseVjScreens,
  vjScreensSummaryKey,
  type VjScreensSummary,
} from "../../live/vjScreensSummary";
import type { VjPackReadiness } from "../rules/vjPackReadiness";
import { VjPackTabs, type VjGridSource } from "./VjPackTabs";
import styles from "./VjTopRow.module.css";

export type { VjGridSource } from "./VjPackTabs";

/** The app's ease-out token (--ease-out) and fast duration (--dur-fast). */
const VJ_SEARCH_TRANSITION = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};
const VJ_SEARCH_INSTANT = { duration: 0 };

export interface VjRemoteTopRowProps {
  packs: readonly VjPackDTO[];
  readinessOf: (packId: string) => VjPackReadiness;
  activePackId: string | null;
  /** `useVjPackSwitch().pendingPackId`: keeps the asked pack's chip pressed until the stage moves. */
  pendingPackId?: string | null;
  gridSource: VjGridSource;
  isFavoritesOnly: boolean;
  isSearchAvailable: boolean;
  isSearchOpen: boolean;
  screens: readonly VjScreenStatus[];
  /** False while the remote is cut off, so the screens summary cannot be trusted. */
  isScreensKnown: boolean;
  isBlocked: boolean;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  blockedReasonId?: string;
  onRequestPack: (packId: string) => void;
  onShowGenerators: () => void;
  onToggleFavoritesOnly: () => void;
  onToggleSearch: () => void;
  onOpenScreens: () => void;
}

type VjScreensDot = "none" | "live" | "partial" | "offline" | "unknown";

function screensDotOf(
  summary: VjScreensSummary,
  isScreensKnown: boolean,
): VjScreensDot {
  if (!isScreensKnown) return "unknown";
  if (summary.kind === "live" && summary.liveCount < summary.totalCount) {
    return "partial";
  }
  return summary.kind;
}

/** The screens dot button: its colour and its name both carry the screens summary. */
function VjScreensButton({
  screens,
  isScreensKnown,
  onOpenScreens,
}: {
  screens: readonly VjScreenStatus[];
  isScreensKnown: boolean;
  onOpenScreens: () => void;
}): JSX.Element {
  const { t } = useTranslation();
  const summary = summariseVjScreens(screens);
  const { key, values } = isScreensKnown
    ? vjScreensSummaryKey(summary)
    : { key: "vj:remote.screens.unknown", values: {} };
  const dot = screensDotOf(summary, isScreensKnown);

  return (
    <Button
      variant="stage-ghost"
      className={styles.iconButton}
      data-vj-screens={dot}
      aria-label={t("vj:top.screensAria", { summary: t(key, values) })}
      onClick={onOpenScreens}
    >
      <span className={styles.screensDot} aria-hidden="true" />
    </Button>
  );
}

/**
 * The remote's top row, one 44px band: the back link, the pack tabs, the
 * search toggle (only while the pack is big enough to search) and the
 * screens dot that opens the Screens sheet.
 */
export function VjRemoteTopRow({
  packs,
  readinessOf,
  activePackId,
  pendingPackId = null,
  gridSource,
  isFavoritesOnly,
  isSearchAvailable,
  isSearchOpen,
  screens,
  isScreensKnown,
  isBlocked,
  blockedReasonId,
  onRequestPack,
  onShowGenerators,
  onToggleFavoritesOnly,
  onToggleSearch,
  onOpenScreens,
}: VjRemoteTopRowProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const transition = reducedMotion ? VJ_SEARCH_INSTANT : VJ_SEARCH_TRANSITION;

  return (
    <div className={styles.row} data-vj-top-row="">
      <Button
        variant="stage-ghost"
        to={routes.adminVj}
        className={styles.iconButton}
        aria-label={t("vj:remote.backToLibrary")}
      >
        <FiArrowLeft aria-hidden="true" focusable="false" fill="none" />
      </Button>
      <VjPackTabs
        packs={packs}
        readinessOf={readinessOf}
        activePackId={activePackId}
        pendingPackId={pendingPackId}
        gridSource={gridSource}
        isFavoritesOnly={isFavoritesOnly}
        isBlocked={isBlocked}
        blockedReasonId={blockedReasonId}
        onRequestPack={onRequestPack}
        onShowGenerators={onShowGenerators}
        onToggleFavoritesOnly={onToggleFavoritesOnly}
      />
      <AnimatePresence initial={false}>
        {isSearchAvailable ? (
          <m.div
            key="search"
            className={styles.searchSlot}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={transition}
          >
            <Button
              variant="stage-ghost"
              className={styles.iconButton}
              aria-label={t(
                isSearchOpen ? "vj:top.closeSearch" : "vj:top.search",
              )}
              aria-expanded={isSearchOpen}
              data-vj-search-toggle=""
              onClick={onToggleSearch}
            >
              <AnimatePresence initial={false} mode="wait">
                <m.span
                  key={isSearchOpen ? "close" : "search"}
                  className={styles.searchIcon}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={transition}
                >
                  {isSearchOpen ? (
                    <FiX aria-hidden="true" focusable="false" fill="none" />
                  ) : (
                    <FiSearch
                      aria-hidden="true"
                      focusable="false"
                      fill="none"
                    />
                  )}
                </m.span>
              </AnimatePresence>
            </Button>
          </m.div>
        ) : null}
      </AnimatePresence>
      <VjScreensButton
        screens={screens}
        isScreensKnown={isScreensKnown}
        onOpenScreens={onOpenScreens}
      />
    </div>
  );
}
