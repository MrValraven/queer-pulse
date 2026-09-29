import {
  useCallback,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { FiUsers } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GatheringDetail } from "../../gatherings/data";
import { useGoTogetherCard } from "../api/useGoTogetherCard";
import type { GoTogetherCardDTO } from "../api/goTogether.types";
import { GoTogetherGroupEntry } from "../group/GoTogetherGroupEntry";
import { GoTogetherOptInFlow } from "./GoTogetherOptInPanel";
import {
  NotVerifiedPanel,
  PairInvitePanel,
  PanelHeader,
  QuestionnaireNeededPanel,
  QuietPanel,
  UnmatchedPanel,
  WaitingPanel,
} from "./GoTogetherStatePanels";
import { BLOCKER_PANEL, GO_TOGETHER_CARD_ANCHOR } from "./goTogetherCard.data";
import {
  GoTogetherHeadingFocusContext,
  moveFocusTo,
  useArriveAtCardAnchor,
  useFocusCardHeading,
  useHeadingFocusControls,
} from "./goTogetherCardFocus";
import styles from "./GoTogetherCard.module.css";

const GROUPED_STATES: ReadonlySet<GoTogetherCardDTO["state"]> = new Set([
  "grouped",
  "feedbackDue",
]);

/**
 * The Go together card on a gathering page. It shows to members who are
 * going, and to anyone already in a group. Everything else (the feature off
 * for this gathering, a visitor, a member not going) renders nothing.
 */
export function GoTogetherCard({ gathering }: { gathering: GatheringDetail }) {
  const { data: card, refetch } = useGoTogetherCard(gathering.slug);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusHeading = useCallback(() => moveFocusTo(headingRef.current), []);
  const headingFocus = useHeadingFocusControls(card?.state, focusHeading);
  useArriveAtCardAnchor(sectionRef, headingRef, card?.state);
  const isGoing = gathering.myRsvpStatus === "going";

  // An RSVP change refreshes the card through `useRsvp`/`useUnrsvp`, which
  // invalidate `goTogetherKeys.cardRoot` once the server has the new standing.
  if (!card || card.state === "unavailable") return null;
  const isGrouped = GROUPED_STATES.has(card.state);
  if (!isGoing && !isGrouped) return null;
  if (
    card.state === "ineligible" &&
    card.ineligibleReason &&
    BLOCKER_PANEL[card.ineligibleReason] === null
  )
    return null;
  if (isGrouped && !card.groupId) return null;

  // One frame for every state, so the heading stays mounted and can take
  // focus when an action swaps the panel under the pressed button.
  return (
    <GoTogetherHeadingFocusContext.Provider value={headingFocus}>
      <GoTogetherCardFrame sectionRef={sectionRef} headingRef={headingRef}>
        {isGrouped && card.groupId ? (
          <GoTogetherGroupEntry
            groupId={card.groupId}
            eventSlug={gathering.slug}
            isFeedbackDue={card.state === "feedbackDue"}
          />
        ) : (
          <GoTogetherCardContent
            card={card}
            slug={gathering.slug}
            onVerified={() => void refetch()}
          />
        )}
      </GoTogetherCardFrame>
    </GoTogetherHeadingFocusContext.Provider>
  );
}

/** The heading and the paper card around every state's panel, the group
 *  entry included. The section carries the anchor the questionnaire's return
 *  path points at. */
function GoTogetherCardFrame({
  sectionRef,
  headingRef,
  children,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <section
      id={GO_TOGETHER_CARD_ANCHOR}
      ref={sectionRef}
      className={styles.wrap}
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={styles.eyebrow}
      >
        <FiUsers aria-hidden />
        {t("goTogether:product.name")}
      </h2>
      <div className={styles.card}>{children}</div>
    </section>
  );
}

/** One panel per card state. Returns null for a state with nothing to say. */
function GoTogetherCardContent({
  card,
  slug,
  onVerified,
}: {
  card: GoTogetherCardDTO;
  slug: string;
  onVerified: () => void;
}) {
  const { t } = useTranslation();
  const focusCardHeading = useFocusCardHeading();
  switch (card.state) {
    case "questionnaireNeeded":
      return (
        <QuestionnaireNeededPanel
          slug={slug}
          needsRefresh={card.profile.needsRefresh}
        />
      );
    case "notOptedIn":
      return (
        <>
          <PanelHeader
            title={t("goTogether:card.title")}
            body={t("goTogether:card.body")}
          />
          <GoTogetherOptInFlow
            slug={slug}
            variant="optIn"
            hostQuestions={card.hostQuestions}
            confirmLabel={t("goTogether:card.optIn.confirm")}
            onDone={focusCardHeading}
          />
        </>
      );
    case "waiting":
      return <WaitingPanel card={card} slug={slug} />;
    case "pairInvite":
      return <PairInvitePanel card={card} slug={slug} />;
    case "ineligible": {
      const panel = card.ineligibleReason
        ? BLOCKER_PANEL[card.ineligibleReason]
        : "restricted";
      if (panel === "notVerified")
        return <NotVerifiedPanel onVerified={onVerified} />;
      return panel ? <QuietPanel state={panel} /> : null;
    }
    case "unmatched":
      return <UnmatchedPanel slug={slug} />;
    case "closed":
      return (
        <p className={styles.mutedNote}>{t("goTogether:card.closed.note")}</p>
      );
    default:
      return null;
  }
}
