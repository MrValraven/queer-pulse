import { useCallback, useRef } from "react";
import { FiHeadphones } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { EmptyState } from "../../shared/components/ui";
import { Collapse } from "../../shared/components/ui/Collapse";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_LISTENING_RANGES,
  type StudioListeningRange,
} from "./api/studioListening.types";
import type { StudioLoadState } from "./api/studioLoadState";
import {
  useStudioListeningRecent,
  useStudioListeningSupporting,
} from "./api/useStudioListening";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import { StudioListeningControls } from "./StudioListeningControls";
import { StudioListeningPausedBanner } from "./StudioListeningPausedBanner";
import { StudioListeningRecent } from "./StudioListeningRecent";
import { StudioListeningSummary } from "./StudioListeningSummary";
import { StudioListeningSupporting } from "./StudioListeningSupporting";
import { StudioShell } from "./StudioShell";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import s from "./StudioListeningPage.module.css";

const DEFAULT_RANGE: StudioListeningRange = "4w";
const RANGE_PARAM = "range";

function isListeningRange(value: string | null): value is StudioListeningRange {
  return (
    value !== null &&
    (STUDIO_LISTENING_RANGES as readonly string[]).includes(value)
  );
}

/** A read that answered with data: not loading and no failure state. */
function hasLoaded(loadState: StudioLoadState): boolean {
  return (
    !loadState.isLoading &&
    !loadState.isError &&
    !loadState.isNotFound &&
    !loadState.isWithdrawn &&
    loadState.isTrackWithheld !== true
  );
}

/** The range lives in the address (`?range=6m`); 4 weeks carries no param. */
function useListeningRangeParam(): {
  range: StudioListeningRange;
  onRangeChange: (range: StudioListeningRange) => void;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const rangeParam = searchParams.get(RANGE_PARAM);
  const range = isListeningRange(rangeParam) ? rangeParam : DEFAULT_RANGE;
  const onRangeChange = useCallback(
    (nextRange: StudioListeningRange) => {
      setSearchParams(
        (previous) => {
          const nextParams = new URLSearchParams(previous);
          if (nextRange === DEFAULT_RANGE) nextParams.delete(RANGE_PARAM);
          else nextParams.set(RANGE_PARAM, nextRange);
          return nextParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
  return { range, onRangeChange };
}

/** A member with no history at all and nobody supported: the welcome state. */
function useIsNewListener(): boolean {
  const recent = useStudioListeningRecent();
  const supporting = useStudioListeningSupporting();
  const hasNoHistory =
    hasLoaded(recent.loadState) && recent.items.length === 0 && !recent.hasMore;
  const hasNobodySupported =
    hasLoaded(supporting.loadState) &&
    supporting.items !== null &&
    supporting.items.length === 0;
  return hasNoHistory && hasNobodySupported;
}

/** History is paused once the preference row has loaded and says off: a play
 *  then lands nowhere, so the welcome line and the top lists say so. */
function useIsHistoryPaused(): boolean {
  const { isOn, isAwaitingRow } = useStudioListeningHistorySwitch();
  return !isOn && !isAwaitingRow;
}

/**
 * "Your listening" (CONTRACT-PART-2 section 4): the member's private page.
 * The history switch and Clear sit on top, a banner says when history is
 * paused, and below them either the welcome state for a new listener or the
 * summary, the recent history and the artists they support. Each state sits
 * in its own Collapse, so every change between them animates.
 */
export function StudioListeningPage() {
  const { t } = useTranslation();
  useStudioDocumentTitle(t("studio:listening.pageTitle"));
  const { range, onRangeChange } = useListeningRangeParam();
  const isNewListener = useIsNewListener();
  const isHistoryPaused = useIsHistoryPaused();
  const emptyBodyKey = isHistoryPaused
    ? "studio:listening.empty.pausedBody"
    : "studio:listening.empty.body";
  const controlsRef = useRef<HTMLElement>(null);

  const focusHistorySwitch = useCallback(() => {
    controlsRef.current?.querySelector<HTMLElement>('[role="switch"]')?.focus();
  }, []);

  return (
    <StudioShell>
      <div className={s.pageHeader}>
        <div className={s.eyebrow}>{t("studio:listening.eyebrow")}</div>
        <h1>
          <Translation
            i18nKey="studio:listening.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={s.dek}>{t("studio:listening.dek")}</p>
      </div>

      <div className={s.wrap}>
        <StudioListeningControls sectionRef={controlsRef} />
        <StudioListeningPausedBanner onResumed={focusHistorySwitch} />
        <Collapse isOpen={isNewListener}>
          <EmptyState
            icon={<FiHeadphones />}
            title={t("studio:listening.empty.title")}
            description={
              // Keyed on the line, so a swap fades the new words in.
              <span key={emptyBodyKey} className={s.emptyBody}>
                {t(emptyBodyKey)}
              </span>
            }
            action={{
              label: t("studio:listening.empty.cta"),
              to: routes.studio,
            }}
            headingLevel={2}
            className={s.empty}
          />
        </Collapse>
        <Collapse isOpen={!isNewListener}>
          <div className={s.sections}>
            <StudioListeningSummary
              range={range}
              onRangeChange={onRangeChange}
              isHistoryPaused={isHistoryPaused}
            />
            <StudioListeningRecent />
            <StudioListeningSupporting />
          </div>
        </Collapse>
      </div>
    </StudioShell>
  );
}
