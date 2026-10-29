import { lazy, Suspense, useEffect, useState, type ComponentType } from "react";
import { AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useConsent } from "../../app/providers/useConsent";
import { useToast } from "../../shared/components/feedback/useToast";
import { openModalCount } from "../../shared/components/ui/modalStack";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioAccess } from "./api/useStudioAccess";
import { useSaveStudioWelcome } from "./api/useStudioWelcome";
import { areStudioListeningMemoryWritesStopped } from "./player/studioListeningMemory";
import { isStudioWelcomeRequest } from "./studioFirstRunConstants";
import type { StudioFirstRunSheetProps } from "./StudioFirstRunSheet";
import {
  hasStudioWelcomeClosedThisPageLoad,
  markStudioWelcomeClosed,
  readLegacyStudioWelcome,
  useStudioTaste,
  writeStudioTaste,
  writeStudioWelcomeSeen,
  type StudioTaste,
} from "./studioFirstRunTaste";
import { useStudioShowcase } from "./useStudioShowcase";
import { useStudioWelcomeMigration } from "./useStudioWelcomeMigration";

/** A chunk that fails to load leaves Studio home as it is: the welcome is
 *  optional, so it never takes the page down with it. */
function StudioFirstRunSheetUnavailable(_props: StudioFirstRunSheetProps) {
  return null;
}

/** Fetched only when the welcome opens. Plain `lazy`: lazyNamed is typed for
 *  prop-less route pages, and the sheet takes props. */
const StudioFirstRunSheet = lazy<ComponentType<StudioFirstRunSheetProps>>(() =>
  import("./StudioFirstRunSheet")
    .then((module) => ({ default: module.StudioFirstRunSheet }))
    .catch(() => ({ default: StudioFirstRunSheetUnavailable })),
);

type FirstVisitDecision = "pending" | "open" | "skip";

/** Whether Studio home opens the welcome by itself, decided once. A live
 *  member's answer comes from the account: the decision waits for it, and a
 *  failed read skips (the welcome never opens on a guess, and Studio home
 *  never waits on it). */
function useFirstVisitDecision(): FirstVisitDecision {
  const isShowcase = useStudioShowcase();
  const { hasAccess } = useStudioAccess();
  const { status: consentStatus } = useConsent();
  const { memberId, hasSeenWelcome, welcomeReadState, isAccountBacked } =
    useStudioTaste();
  const [decision, setDecision] = useState<FirstVisitDecision>("pending");
  // Latched the first time the member, the consent answer and the account's
  // answer are all in (adjusted during render). A seen bit or picks that
  // vanish later, a wipe in another tab say, never open it.
  if (
    decision === "pending" &&
    memberId !== null &&
    consentStatus === "set" &&
    welcomeReadState !== "pending"
  ) {
    // A welcome finished on this device before it moved to the account is
    // uploaded by useStudioWelcomeMigration instead of replayed.
    const hasDeviceCopyToMigrate =
      isAccountBacked && readLegacyStudioWelcome(memberId) !== null;
    const shouldOpen =
      !isShowcase &&
      hasAccess &&
      welcomeReadState === "ready" &&
      !hasSeenWelcome &&
      !hasDeviceCopyToMigrate &&
      !hasStudioWelcomeClosedThisPageLoad(memberId) &&
      !areStudioListeningMemoryWritesStopped() &&
      openModalCount() === 0;
    setDecision(shouldOpen ? "open" : "skip");
  }
  return decision;
}

/**
 * The Studio welcome on Studio home (PRD-12). A live member's first visit
 * opens it once the consent banner has its answer, so the sheet never covers
 * the banner or another dialog. Help's "Show the welcome again" (and the old
 * /studio/welcome link) reopen it through router state, in both modes, for a
 * member with Studio access. Any way out (Start listening, Skip, the close
 * button, Escape, the scrim) keeps the picks made so far and marks the
 * welcome seen on the member's account (on this device in the demo).
 */
export function StudioFirstRun() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasAccess } = useStudioAccess();
  const { memberId, taste, isAccountBacked } = useStudioTaste();
  const { mutate: saveWelcome } = useSaveStudioWelcome();
  useStudioWelcomeMigration();
  const firstVisitDecision = useFirstVisitDecision();

  const requestKey = isStudioWelcomeRequest(location.state)
    ? location.key
    : null;
  const [handledRequestKey, setHandledRequestKey] = useState<string | null>(
    null,
  );
  const [isRequested, setIsRequested] = useState(false);
  // Bumped on close, so the module-level closed latch is read again.
  const [, setCloseCount] = useState(0);
  if (requestKey !== null && requestKey !== handledRequestKey) {
    setHandledRequestKey(requestKey);
    setIsRequested(true);
  }

  // Drop the request from history, so Back or a reload never reopens it.
  useEffect(() => {
    if (requestKey === null) return;
    void navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null },
    );
  }, [requestKey, navigate, location.pathname, location.search]);

  const isFirstVisitOpen =
    firstVisitDecision === "open" &&
    memberId !== null &&
    !hasStudioWelcomeClosedThisPageLoad(memberId);
  const isOpen =
    memberId !== null && ((isRequested && hasAccess) || isFirstVisitOpen);

  const close = (picks: StudioTaste, isFinished: boolean) => {
    if (memberId !== null) {
      // The latch holds even when the save is refused, so a failed write
      // never reopens the sheet in this page load.
      markStudioWelcomeClosed(memberId);
      if (isAccountBacked) {
        saveWelcome({
          hasSeenWelcome: true,
          genres: [...picks.genres],
          moods: [...picks.moods],
        });
      } else {
        writeStudioWelcomeSeen(memberId);
        writeStudioTaste(memberId, picks);
      }
    }
    setIsRequested(false);
    setCloseCount((count) => count + 1);
    const hasPicks = picks.genres.length > 0 || picks.moods.length > 0;
    if (isFinished && hasPicks)
      showToast(t("studio:firstRun.savedToast"), "success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Suspense key="studio-first-run" fallback={null}>
          <StudioFirstRunSheet initialTaste={taste} onClose={close} />
        </Suspense>
      )}
    </AnimatePresence>
  );
}
