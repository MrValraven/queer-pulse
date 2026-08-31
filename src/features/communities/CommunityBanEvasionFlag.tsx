import { useState } from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiClock, FiFlag, FiHelpCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityBanEvasionEscalationDTO } from "./api/communityBanEvasion.api";
import type {
  CommunityBanEvasionFlagState,
  CommunityBanEvasionRowState,
} from "./api/useCommunityBanEvasion";
import { CommunityBanEvasionEscalate } from "./CommunityBanEvasionEscalate";
import styles from "./CommunityBanEvasionFlag.module.css";

const KEY = "communities:detail.modtools.joinRequests.banEvasion";

/**
 * The one bit a community moderator is told about an applicant's ban history,
 * and the button that hands the case to platform staff (PRD-31).
 *
 * THE DESIGN PRINCIPLE: the community moderator recognises, platform staff
 * investigates. The moderator learns that this applicant matches somebody
 * banned FROM THIS COMMUNITY. There is no score, no tier, no confidence, no
 * identifier, no name of a prior account and no date, and a match against
 * another community or against a platform-level ban answers "no" here. That is
 * deliberate. Do not surface more than the one bit, and do not let the copy
 * describe it as more than it is: it is a prompt to look, and the wording says
 * exactly that. Nothing on the platform acts on it.
 *
 * THREE OUTCOMES, NEVER TWO. Matched, no match, and could-not-check. A dropped
 * request or an id the endpoint left out of its answer renders as its own
 * visible state, because folding a failure into "no match" would tell a
 * moderator that somebody they themselves banned is clean.
 *
 * A row with no match and no escalation renders NOTHING. The common case is a
 * person asking to join, and the queue must let a moderator read it that way.
 */
export function CommunityBanEvasionFlag({
  applicantName,
  state,
  isEscalating,
  onRetry,
  onEscalate,
}: {
  applicantName: string;
  state: CommunityBanEvasionRowState;
  /** True while this row's escalation is in flight. */
  isEscalating: boolean;
  onRetry: () => void;
  onEscalate: (note?: string) => Promise<CommunityBanEvasionEscalationDTO>;
}) {
  const { t } = useTranslation();
  const [isComposing, setIsComposing] = useState(false);
  // The escalation this moderator just raised. Held locally because the list
  // refetch lands a beat later, and for that beat the button would otherwise
  // come back and invite a second press. It also covers the case where the
  // list itself failed to load.
  const [sentEscalation, setSentEscalation] =
    useState<CommunityBanEvasionEscalationDTO | null>(null);
  const [hasEarlierNoteKept, setHasEarlierNoteKept] = useState(false);
  const [hasSendFailed, setHasSendFailed] = useState(false);

  const fetched = state.escalation;
  const escalation =
    sentEscalation && fetched?.id !== sentEscalation.id
      ? sentEscalation
      : (fetched ?? sentEscalation);

  // Nothing matched and nobody escalated: the row stays a person asking to join.
  if (state.flag === "clear" && !escalation) return null;
  if (state.flag === "checking" && !escalation) {
    return (
      <p className={styles.checking} aria-busy="true">
        <FiClock aria-hidden /> {t(`${KEY}.checking`)}
      </p>
    );
  }

  const send = (note: string) => {
    const typed = note.trim();
    setHasSendFailed(false);
    void onEscalate(typed || undefined)
      .then((result) => {
        setSentEscalation(result);
        setIsComposing(false);
        // The POST is idempotent while an escalation is open and answers with
        // the EXISTING row and the FIRST note. When that is not what was just
        // typed, say so instead of showing the new text as though it were
        // saved.
        setHasEarlierNoteKept(Boolean(typed) && (result.note ?? "") !== typed);
      })
      .catch(() => setHasSendFailed(true));
  };

  const tone = TONE[state.flag];
  const HeadIcon = tone.icon;

  return (
    <div className={`${styles.panel} ${styles[tone.className]}`}>
      <p className={styles.title}>
        <HeadIcon aria-hidden className={styles.icon} />
        {t(tone.titleKey)}
      </p>
      {tone.bodyKey && <p className={styles.body}>{t(tone.bodyKey)}</p>}
      {state.flag === "matched" && (
        <p className={styles.scope}>{t(`${KEY}.matched.scope`)}</p>
      )}
      {state.flag === "unavailable" && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.quietBtn}
          aria-label={t(`${KEY}.unavailable.retryAria`, {
            name: applicantName,
          })}
          onClick={onRetry}
        >
          {t(`${KEY}.unavailable.retryCta`)}
        </Button>
      )}

      {escalation && <EscalationStatus escalation={escalation} />}
      {hasEarlierNoteKept && (
        <p className={styles.warn}>{t(`${KEY}.noteReplaced`)}</p>
      )}

      {escalation?.status !== "open" &&
        (isComposing ? (
          <CommunityBanEvasionEscalate
            isPending={isEscalating}
            onSend={send}
            onCancel={() => setIsComposing(false)}
          />
        ) : (
          <EscalateAction
            applicantName={applicantName}
            state={state}
            hasResolvedEscalation={escalation?.status === "resolved"}
            hasSendFailed={hasSendFailed}
            onOpen={() => setIsComposing(true)}
          />
        ))}
    </div>
  );
}

/** How each flag state is headed. Colour never carries the state on its own:
 *  every one of these has its own icon and its own sentence. */
const TONE: Record<
  CommunityBanEvasionFlagState,
  {
    icon: IconType;
    className: "panelMatched" | "panelUnknown" | "panelQuiet";
    titleKey: string;
    bodyKey: string | null;
  }
> = {
  matched: {
    icon: FiAlertCircle,
    className: "panelMatched",
    titleKey: `${KEY}.matched.title`,
    bodyKey: `${KEY}.matched.body`,
  },
  unavailable: {
    icon: FiHelpCircle,
    className: "panelUnknown",
    titleKey: `${KEY}.unavailable.title`,
    bodyKey: `${KEY}.unavailable.body`,
  },
  // Reachable only on a row that already carries an escalation, where the flag
  // itself is beside the point: the moderator is watching the case, not the bit.
  clear: {
    icon: FiFlag,
    className: "panelQuiet",
    titleKey: `${KEY}.escalated.title`,
    bodyKey: null,
  },
  checking: {
    icon: FiClock,
    className: "panelQuiet",
    titleKey: `${KEY}.escalated.title`,
    bodyKey: null,
  },
};

/**
 * Where an escalation stands, and deliberately nothing more. `resolved` means
 * somebody looked. It does not say what staff found, who closed it or when they
 * decided, because that is the cross-community judgement the one-bit design
 * exists to withhold. Nothing notifies a moderator either, so the copy never
 * promises to tell them.
 */
function EscalationStatus({
  escalation,
}: {
  escalation: CommunityBanEvasionEscalationDTO;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const raisedOn = format.date(new Date(escalation.createdAt), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const isOpen = escalation.status === "open";

  return (
    <div className={styles.escalation}>
      <p className={styles.escalationLine}>
        <FiFlag aria-hidden className={styles.icon} />
        {isOpen
          ? t(`${KEY}.escalated.open`, { date: raisedOn })
          : t(`${KEY}.escalated.resolved`, { date: raisedOn })}
      </p>
      <p className={styles.escalationNote}>
        {isOpen
          ? t(`${KEY}.escalated.openNote`)
          : t(`${KEY}.escalated.resolvedNote`)}
      </p>
      {escalation.note && (
        <p className={styles.storedNote}>
          <span className={styles.storedNoteLabel}>
            {t(`${KEY}.escalated.storedNoteLabel`)}
          </span>
          {escalation.note}
        </p>
      )}
    </div>
  );
}

/** The escalate button and what is known about whether it was already pressed.
 *  A failed escalations read leaves the button available on purpose: the POST
 *  is idempotent, so asking twice costs staff nothing, and the row says the
 *  state could not be read instead of guessing at it. */
function EscalateAction({
  applicantName,
  state,
  hasResolvedEscalation,
  hasSendFailed,
  onOpen,
}: {
  applicantName: string;
  state: CommunityBanEvasionRowState;
  hasResolvedEscalation: boolean;
  hasSendFailed: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.actionArea}>
      {state.isEscalationChecking && (
        <p className={styles.quietLine} aria-busy="true">
          {t(`${KEY}.escalation.checking`)}
        </p>
      )}
      {state.isEscalationUnavailable && (
        <p className={styles.warn}>{t(`${KEY}.escalation.unavailable`)}</p>
      )}
      <p className={styles.escalateHint}>{t(`${KEY}.escalateHint`)}</p>
      <Button
        variant="ghost"
        size="sm"
        className={styles.quietBtn}
        aria-label={t(
          hasResolvedEscalation
            ? `${KEY}.reEscalateAria`
            : `${KEY}.escalateAria`,
          { name: applicantName },
        )}
        onClick={onOpen}
      >
        <FiFlag aria-hidden />{" "}
        {t(
          hasResolvedEscalation ? `${KEY}.reEscalateCta` : `${KEY}.escalateCta`,
        )}
      </Button>
      {hasSendFailed && <p className={styles.warn}>{t(`${KEY}.sendFailed`)}</p>}
    </div>
  );
}
