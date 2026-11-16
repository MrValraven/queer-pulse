import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { ApiError } from "../../../shared/api/client";
import {
  causeErrorKey,
  SHARED_CAUSE_KEY,
  type CauseErrorCopy,
} from "../../../shared/api/causeErrorKey";
import { prefersReducedMotionNow } from "../../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingDraft } from "./listBusiness.data";
import type { StoredDraft } from "./useListingDraft";
import type { ContinueDraftItem } from "./ContinueDraftsScreen";
import { clampDraftStep } from "./draftProgress";
import {
  BACKEND_UNTITLED_DRAFT_NAME,
  getListingDraft,
  type ListingDraftSummary,
} from "./api/listingDrafts.api";
import {
  useDeleteListingDraft,
  useListingDrafts,
} from "./api/useListingDrafts";

/** The create landing's three moments: waiting on the drafts list, the
 *  Continue screen, and the wizard (fresh or seeded). */
export type FlowMode = "deciding" | "choosing" | "wizard";

/** What a Continue hands the wizard: the draft, its step, and (live) the row
 *  id so autosave keeps upserting that same row. */
export interface WizardSeed {
  draft: ListingDraft;
  step: number;
  id?: string;
}

/** The `?continue=` value that opens the single demo draft. */
export const DEMO_CONTINUE_ID = "demo";

/** Shown when Continue finds its draft already gone (sent or deleted on
 *  another device); its card is dropped along with it. */
const DRAFT_GONE_KEY = "marketing:listBusiness.drafts.gone";

/** Brings the wizard's step line into view, clear of the fixed nav (the
 *  target carries a `scroll-margin-top`), and moves focus there so keyboard
 *  and screen-reader users land in the wizard too. The step line is hidden
 *  above 680px, so focus then goes to the wizard top it sits in. Falls back to
 *  the page top when no wizard is on screen. Deferred one frame so the
 *  wizard's first layout has settled before it is measured. */
function scrollToWizardTop() {
  requestAnimationFrame(() => {
    const behavior = prefersReducedMotionNow() ? "auto" : "smooth";
    const wizardTop = document.querySelector<HTMLElement>("[data-wizard-top]");
    if (!wizardTop) {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const stepLine = wizardTop.querySelector<HTMLElement>(
      "[data-wizard-step-line]",
    );
    const focusTarget =
      stepLine && stepLine.getClientRects().length > 0 ? stepLine : wizardTop;
    focusTarget.focus({ preventScroll: true });
    wizardTop.scrollIntoView({ block: "start", behavior });
  });
}

/** Every mode switch the member makes lands them on the wizard's step line.
 *  Arriving on the page is not a switch, and neither is the first decision
 *  out of "deciding": that one stays where the browser put the page, so
 *  back/forward scroll restoration is kept. */
export function useScrollToWizardOnModeSwitch(mode: FlowMode) {
  const shownMode = useRef(mode);
  useEffect(() => {
    if (shownMode.current === mode) return;
    const previousMode = shownMode.current;
    shownMode.current = mode;
    if (previousMode === "deciding") return;
    scrollToWizardTop();
  }, [mode]);
}

/** Tells the page the Continue screen came up, so it drops the hero lead and
 *  keeps Continue above the fold on a phone. The page latches it for the
 *  mount. Demo already knows before the first paint (the page seeds it);
 *  live learns once the drafts list settles, and the lead then folds away as
 *  the screen arrives. */
export function useReportContinueScreen(
  mode: FlowMode,
  onContinueScreenShown?: () => void,
) {
  useLayoutEffect(() => {
    if (mode === "choosing") onContinueScreenShown?.();
  }, [mode, onContinueScreenShown]);
}

/** The demo localStorage draft as a card. A hand-edited snapshot with a
 *  missing name or time still renders: blank reads "Untitled listing" and an
 *  unreadable time reads "a while ago". */
export function demoDraftItem(snapshot: StoredDraft): ContinueDraftItem {
  const savedAt = Number(snapshot.savedAt);
  const name: unknown = snapshot.draft?.name;
  return {
    id: DEMO_CONTINUE_ID,
    name: typeof name === "string" ? name : "",
    step: snapshot.step,
    savedAtIso: Number.isFinite(savedAt) ? new Date(savedAt).toISOString() : "",
  };
}

/** Live summaries as cards, newest first, minus the ones just deleted. The
 *  backend's English stand-in name reads as blank, so the card shows the
 *  catalog's "Untitled listing" in the member's language. */
function liveDraftItems(
  summaries: ListingDraftSummary[] | undefined,
  removedIds: string[],
): ContinueDraftItem[] {
  return (summaries ?? [])
    .filter((summary) => !removedIds.includes(summary.id))
    .map((summary) => ({
      id: summary.id,
      name:
        summary.name === BACKEND_UNTITLED_DRAFT_NAME
          ? ""
          : (summary.name ?? ""),
      step: summary.step,
      savedAtIso: summary.updatedAt,
    }))
    .sort(
      (first, second) =>
        (Date.parse(second.savedAtIso) || 0) -
        (Date.parse(first.savedAtIso) || 0),
    );
}

/**
 * Live state for the create landing: whether to show the Continue screen or
 * the wizard, and the Continue and delete actions.
 *
 * The decision is latched once per mount. It waits for the session check and
 * the drafts list to settle, then picks "choosing" when at least one draft
 * exists and "wizard" otherwise (a signed-out visitor's query is disabled, so
 * that is at once). After that, list changes never send the member back to
 * the Continue screen: the wizard's first autosave creates a draft and
 * refreshes this list, and the member must stay where they are typing.
 */
export function useLiveContinueDrafts() {
  const { t } = useTranslation();
  const { checking } = useAuth();
  const draftsQuery = useListingDrafts();
  const removeDraft = useDeleteListingDraft();
  const [mode, setMode] = useState<FlowMode>("deciding");
  const [loadErrorCause, setLoadErrorCause] = useState<CauseErrorCopy | null>(
    null,
  );
  const [seed, setSeed] = useState<WizardSeed | null>(null);
  const [resumingId, setResumingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [errorLine, setErrorLine] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  // A Continue error that removed the last card, carried above the wizard.
  const [carriedLine, setCarriedLine] = useState<string | null>(null);
  const items = liveDraftItems(draftsQuery.data, removedIds);

  // Latch the decision during render, once the list has settled. A query
  // paused for being offline has settled too: it cannot fetch until the
  // connection is back, so the member gets the wizard and the offline cause.
  if (mode === "deciding" && !checking && !draftsQuery.isFetching) {
    const hasDrafts = items.length > 0;
    setMode(hasDrafts ? "choosing" : "wizard");
    if (!hasDrafts && draftsQuery.error)
      setLoadErrorCause(causeErrorKey(draftsQuery.error));
    else if (!hasDrafts && draftsQuery.isPaused)
      setLoadErrorCause({ key: SHARED_CAUSE_KEY.noConnection });
  }

  const causeLine = (error: unknown) => {
    const cause = causeErrorKey(error);
    return t(cause.key, cause.values);
  };
  const startAction = (id: string) => {
    setErrorLine(null);
    setStatusLine(null);
    return items.filter((item) => item.id !== id).length;
  };

  const continueDraft = async (id: string) => {
    startAction(id);
    setResumingId(id);
    try {
      const record = await getListingDraft(id);
      setSeed({
        draft: record.payload.draft,
        step: clampDraftStep(record.payload.step),
        id,
      });
      setMode("wizard");
    } catch (error) {
      setResumingId(null);
      // Already gone (sent or deleted on another device): drop the card the
      // way a delete does, and say why it went.
      if (error instanceof ApiError && error.status === 404) {
        setRemovedIds((ids) => [...ids, id]);
        setErrorLine(t(DRAFT_GONE_KEY));
        return;
      }
      setErrorLine(
        `${t("marketing:listBusiness.drafts.openError")} ${causeLine(error)}`,
      );
    }
  };

  const deleteDraft = async (id: string) => {
    const remainingCount = startAction(id);
    setDeletingId(id);
    try {
      await removeDraft.mutateAsync(id);
      setRemovedIds((ids) => [...ids, id]);
      if (remainingCount > 0)
        setStatusLine(t("marketing:listBusiness.drafts.deleted"));
    } catch (error) {
      // Already gone (submitted or deleted on another device): drop the card.
      if (error instanceof ApiError && error.status === 404)
        setRemovedIds((ids) => [...ids, id]);
      else
        setErrorLine(
          `${t("marketing:listBusiness.drafts.deleteError")} ${causeLine(error)}`,
        );
    } finally {
      setDeletingId(null);
    }
  };

  const loadErrorLine = loadErrorCause
    ? `${t("marketing:listBusiness.drafts.loadError")} ${t(
        loadErrorCause.key,
        loadErrorCause.values,
      )}`
    : null;

  return {
    mode,
    items,
    seed,
    resumingId,
    deletingId,
    errorLine,
    statusLine,
    wizardLine: loadErrorLine ?? carriedLine,
    continueDraft: (id: string) => void continueDraft(id),
    deleteDraft: (id: string) => void deleteDraft(id),
    startAnother: () => setMode("wizard"),
    // The last card has folded away (deleted here, or gone from the list):
    // open a fresh wizard, carrying any line that explains why.
    finishWhenAllGone: () => {
      setCarriedLine(errorLine);
      setMode("wizard");
    },
  };
}
