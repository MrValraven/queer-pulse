import {
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react";
import { FiLock, FiUser, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { VouchPerson } from "./trustGraph/trustGraphModel";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { VouchGraphAffected } from "./VouchGraphAffected";
import { VouchGraphConnectionTabs } from "./VouchGraphConnectionTabs";
import { InspectorActions } from "./VouchGraphInspectorActions";
import { VouchGraphInspectorFlags } from "./VouchGraphInspectorFlags";
import { VouchGraphInspectorHeader } from "./VouchGraphInspectorHeader";
import { VouchGraphJoinPath } from "./VouchGraphJoinPath";
import { VouchGraphStoryCard } from "./VouchGraphStoryCard";
import { VouchGraphTrackRecord } from "./VouchGraphTrackRecord";
import styles from "./vouchGraphInspector.module.css";

/** Matches the breakpoint where the CSS turns the inspector into a sheet. */
const PHONE_SHEET_QUERY = "(max-width: 920px)";

export interface VouchGraphInspectorProps {
  selectedId: string | null;
  focusId: string;
  /** Edge id of the connection the replay is currently on; its row lights up. */
  activeEdgeId: string | null;
  isExpanded: boolean;
  hoveredId: string | null;
  shouldHideWithdrawn: boolean;
  /** True while a verify request for the selected member is in flight. */
  isVerifying: boolean;
  /** What the inspector shows when nothing is selected (the Safety triage
   *  list). Without it, the "Pick anyone" card shows. */
  emptyState?: ReactNode;
  /** Rendered above the header (the compare card). */
  topSlot?: ReactNode;
  /** True while `topSlot` has something to show (a compare pair), so the
   *  phone sheet opens for it with nothing selected. */
  hasTopContent?: boolean;
  /** True in the invites tree and the list view: on the phone the sheet
   *  stays closed there until the admin picks someone in that view. */
  isSheetSuppressed?: boolean;
  onGo: (id: string) => void;
  onRecenter: (id: string) => void;
  onHoverChange: (id: string | null) => void;
  onExpand: (id: string) => void;
  onShowRing: (ringId: string) => void;
  onVerify: (id: string) => void;
  onOpenModeration: (id: string) => void;
  onCite: (id: string) => void;
  /** Deselects the member, which dismisses the phone bottom sheet. */
  onCloseSheet: () => void;
}

/** E3: the grab handle that moves the phone sheet between peek and expanded.
 *  Hidden on desktop, where the inspector is a fixed rail. A member sheet
 *  names what the toggle does; the list sheet keeps one constant name and
 *  lets `aria-expanded` carry the state. */
function SheetGrab({
  isSheetExpanded,
  listLabel,
  onToggle,
}: {
  isSheetExpanded: boolean;
  listLabel?: string;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const memberLabel = isSheetExpanded
    ? t("admin:vouchGraph.inspector.sheet.collapseAria")
    : t("admin:vouchGraph.inspector.sheet.expandAria");
  return (
    <button
      type="button"
      className={styles.insGrab}
      onClick={onToggle}
      aria-expanded={isSheetExpanded}
      aria-label={listLabel ?? memberLabel}
    />
  );
}

/** Keeps the phone sheet closed while `isSheetSuppressed` holds. The
 *  selection carried into the view stays; picking anyone else there lifts
 *  the suppression for the rest of that visit. Entering such a view with a
 *  sheet on screen slides it down first (`isSuppressClosing`) when
 *  `canPlayExit` says the exit can play. */
function useSheetSuppression(
  isSheetSuppressed: boolean,
  selectedId: string | null,
  canPlayExit: boolean,
) {
  const [shownIsSheetSuppressed, setShownIsSheetSuppressed] =
    useState(isSheetSuppressed);
  const [isSuppressing, setIsSuppressing] = useState(isSheetSuppressed);
  const [suppressedSelectionId, setSuppressedSelectionId] =
    useState(selectedId);
  const [isSuppressClosing, setIsSuppressClosing] = useState(false);
  if (shownIsSheetSuppressed !== isSheetSuppressed) {
    setShownIsSheetSuppressed(isSheetSuppressed);
    setIsSuppressing(isSheetSuppressed);
    setSuppressedSelectionId(selectedId);
    setIsSuppressClosing(isSheetSuppressed && canPlayExit);
  } else if (isSuppressing && selectedId !== suppressedSelectionId) {
    setIsSuppressing(false);
    setIsSuppressClosing(false);
  }
  return {
    isSuppressed: isSuppressing,
    isSuppressClosing,
    finishSuppressClosing: () => setIsSuppressClosing(false),
  };
}

function EmptyCard() {
  const { t } = useTranslation();
  return (
    <div className={styles.insEmpty}>
      <span className={styles.insEmptyIc}>
        <FiUser aria-hidden />
      </span>
      <h4>{t("admin:vouchGraph.inspector.emptyTitle")}</h4>
      <p>{t("admin:vouchGraph.inspector.emptyBody")}</p>
    </div>
  );
}

/** Everything the inspector says about one selected member. */
function MemberDetail({
  person,
  props,
}: {
  person: VouchPerson;
  props: VouchGraphInspectorProps;
}) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const hasNoEdges = graph.incidentEdges(person.id).length === 0;
  return (
    <>
      <VouchGraphInspectorHeader
        person={person}
        isFocus={person.id === props.focusId}
      />
      <div className={styles.sealed}>
        <FiLock aria-hidden /> {t("admin:vouchGraph.inspector.sealed")}
      </div>
      <VouchGraphInspectorFlags
        person={person}
        onGo={props.onGo}
        onShowRing={props.onShowRing}
      />
      {hasNoEdges ? (
        <VouchGraphJoinPath person={person} onRecenter={props.onRecenter} />
      ) : (
        <>
          <VouchGraphTrackRecord person={person} />
          <VouchGraphStoryCard personId={person.id} />
          <VouchGraphConnectionTabs
            personId={person.id}
            activeEdgeId={props.activeEdgeId}
            hoveredId={props.hoveredId}
            shouldHideWithdrawn={props.shouldHideWithdrawn}
            onHoverChange={props.onHoverChange}
            onGo={props.onGo}
          />
          {!person.private && (
            <VouchGraphAffected person={person} onGo={props.onGo} />
          )}
        </>
      )}
      <InspectorActions
        person={person}
        onVerify={props.onVerify}
        isVerifying={props.isVerifying}
        onCite={props.onCite}
        isExpanded={props.isExpanded}
        isExpandable={!hasNoEdges}
        onExpand={props.onExpand}
        onOpenModeration={props.onOpenModeration}
      />
    </>
  );
}

export function VouchGraphInspector(props: VouchGraphInspectorProps) {
  const {
    selectedId,
    emptyState,
    topSlot,
    hasTopContent = false,
    isSheetSuppressed = false,
    onCloseSheet,
  } = props;
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPhoneLayout = useMediaQuery(PHONE_SHEET_QUERY);
  const graph = useTrustGraph();
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isCompareClosing, setIsCompareClosing] = useState(false);
  const [sheetSelectionId, setSheetSelectionId] = useState(selectedId);
  const [shownHasTopContent, setShownHasTopContent] = useState(hasTopContent);
  // A new selection, or none, always opens the sheet in peek.
  if (sheetSelectionId !== selectedId) {
    setSheetSelectionId(selectedId);
    setIsSheetExpanded(false);
    setIsClosing(false);
    setIsCompareClosing(false);
  }

  const person = selectedId ? graph.peopleById[selectedId] : undefined;
  const hasList = !person && Boolean(emptyState);
  const canPlaySheetExit = isPhoneLayout && !reducedMotion;
  const suppression = useSheetSuppression(
    isSheetSuppressed,
    selectedId,
    canPlaySheetExit && (Boolean(person) || hasList || hasTopContent),
  );
  // Clearing the compare pair with nothing else to show slides the phone
  // sheet down first; it hides once that animation ends.
  if (shownHasTopContent !== hasTopContent) {
    setShownHasTopContent(hasTopContent);
    setIsCompareClosing(
      !hasTopContent && !person && !hasList && canPlaySheetExit,
    );
  }
  const isCompareSheetClosing =
    isCompareClosing &&
    canPlaySheetExit &&
    !person &&
    !hasList &&
    !hasTopContent;
  // Anything that brings content back, or a switch to the desktop rail,
  // ends the compare exit early.
  if (isCompareClosing && !isCompareSheetClosing) setIsCompareClosing(false);
  // A compare pair with nothing selected uses the list state too, so the
  // phone sheet shows the compare card. Once the pair clears, the card drops
  // out at once (compareSlot unmounts it) and the sheet slides down with the
  // list state until the exit ends.
  const panelState = person
    ? "open"
    : hasList || hasTopContent || isCompareSheetClosing
      ? "list"
      : "empty";
  const sheetState =
    isClosing || isCompareSheetClosing || suppression.isSuppressClosing
      ? "closing"
      : isSheetExpanded
        ? "expanded"
        : "peek";

  const toggleSheet = () => setIsSheetExpanded((isOpen) => !isOpen);
  // The X lives only on the phone sheet: it slides the sheet out first and
  // deselects once that animation ends (at once under reduced motion).
  const closeSheet = () => {
    setIsSheetExpanded(false);
    if (reducedMotion) {
      onCloseSheet();
      return;
    }
    setIsClosing(true);
  };
  const finishClosing = (event: AnimationEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (isCompareClosing) setIsCompareClosing(false);
    if (suppression.isSuppressClosing) suppression.finishSuppressClosing();
    if (!isClosing) return;
    setIsClosing(false);
    onCloseSheet();
  };
  // On the phone, Escape belongs to the sheet first: it closes a member's
  // sheet or folds an expanded list back to its peek, and the graph modal
  // only hears Escape once the sheet has nothing left to close. A filled
  // field marked `data-escape-clears` handles its own Escape first.
  const handleSheetEscape = (event: KeyboardEvent) => {
    if (
      event.key !== "Escape" ||
      !isPhoneLayout ||
      panelState === "empty" ||
      suppression.isSuppressed
    ) {
      return;
    }
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      target.hasAttribute("data-escape-clears") &&
      target.value !== ""
    ) {
      return;
    }
    if (person) {
      event.stopPropagation();
      if (!isClosing) closeSheet();
      return;
    }
    if (isSheetExpanded) {
      event.stopPropagation();
      setIsSheetExpanded(false);
    }
  };
  // A native listener on the sheet (same pattern as VouchGraphFiltersPanel)
  // stops Escape before it reaches the graph modal's document listener.
  const sheetRef = useRef<HTMLElement>(null);
  const handleSheetEscapeRef = useRef(handleSheetEscape);
  useEffect(() => {
    handleSheetEscapeRef.current = handleSheetEscape;
  });
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const onKeyDown = (event: KeyboardEvent) =>
      handleSheetEscapeRef.current(event);
    sheet.addEventListener("keydown", onKeyDown);
    return () => sheet.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <aside
      ref={sheetRef}
      className={styles.inspector}
      data-state={panelState}
      data-sheet={sheetState}
      data-suppressed={suppression.isSuppressed || undefined}
      onAnimationEnd={finishClosing}
    >
      {panelState !== "empty" && (
        <SheetGrab
          isSheetExpanded={isSheetExpanded}
          listLabel={hasList ? t("admin:vouchGraph.triage.title") : undefined}
          onToggle={toggleSheet}
        />
      )}
      {person && (
        <button
          type="button"
          className={styles.insSheetClose}
          onClick={closeSheet}
          aria-label={t("admin:common.close")}
        >
          <FiX aria-hidden />
        </button>
      )}
      {topSlot}
      <div key={person?.id ?? panelState} className={styles.insBody}>
        {person ? (
          <MemberDetail person={person} props={props} />
        ) : hasList ? (
          emptyState
        ) : (
          <EmptyCard />
        )}
      </div>
    </aside>
  );
}
