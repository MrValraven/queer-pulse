import { useState } from "react";
import { FiClock, FiFlag, FiShield } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Thread } from "../forum.data";
import { ELIGIBILITY_LABEL_KEYS, PURPOSE_LABEL_KEYS } from "./funding.data";
import type { ForumFundingView } from "./funding.types";
import {
  amountRangeLabel,
  callDeadlineCopy,
  formatEuros,
  type FundingTone,
} from "./fundingFormat";
import styles from "./FundingRowFacts.module.css";

const TONE_CLASS: Record<FundingTone, string | undefined> = {
  neutral: undefined,
  accent: styles.deadlineAccent,
  muted: styles.deadlineMuted,
};

/** The facts a list row carries for an open call. Nothing interactive: the
 *  row's stretched title link still opens the thread from anywhere here. */
export function FundingRowFacts({ thread }: { thread: Thread }) {
  if (!thread.funding) return null;
  if (thread.kind === "call") return <CallRowFacts funding={thread.funding} />;
  if (thread.kind === "ask") return <AskRowFacts funding={thread.funding} />;
  return null;
}

function AskRowFacts({ funding }: { funding: ForumFundingView }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isEnded = funding.askState === "ended";
  return (
    <div className={styles.facts}>
      {funding.goalAmount !== null && (
        <span className={styles.amount}>
          {t("forum:funding.row.goal", {
            amount: formatEuros(fmt, funding.goalAmount),
          })}
        </span>
      )}
      {funding.askPurpose && (
        <span className={styles.eligibilityChip}>
          {t(PURPOSE_LABEL_KEYS[funding.askPurpose])}
        </span>
      )}
      <span>{t("forum:funding.row.onHost", { host: funding.linkHost })}</span>
      {isEnded ? (
        <span
          className={[styles.deadline, styles.deadlineMuted].join(" ")}
          data-tone="muted"
        >
          {t("forum:funding.row.ended")}
        </span>
      ) : (
        funding.approvedAt && (
          <span className={styles.checked}>
            <FiShield aria-hidden />
            {t("forum:funding.row.checked")}
          </span>
        )
      )}
    </div>
  );
}

function CallRowFacts({ funding }: { funding: ForumFundingView }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // One clock per mounted row, read once: the list re-renders on refetch.
  const [nowMs] = useState(() => Date.now());
  const amount = amountRangeLabel(t, fmt, funding.amountMin, funding.amountMax);
  const deadline = callDeadlineCopy(fmt, funding, nowMs);
  return (
    <div className={styles.facts}>
      {funding.funderName && (
        <span className={styles.funder}>
          <FiFlag aria-hidden />
          {funding.funderName}
        </span>
      )}
      {amount && <span className={styles.amount}>{amount}</span>}
      {deadline && (
        <span
          className={[styles.deadline, TONE_CLASS[deadline.tone]]
            .filter(Boolean)
            .join(" ")}
          data-tone={deadline.tone}
        >
          <FiClock aria-hidden />
          {t(deadline.key, deadline.values)}
        </span>
      )}
      {funding.eligibility.length > 0 && (
        <ul
          className={styles.eligibility}
          aria-label={t("forum:funding.row.eligibilityAria")}
        >
          {funding.eligibility.map((value) => (
            <li key={value} className={styles.eligibilityChip}>
              {t(ELIGIBILITY_LABEL_KEYS[value])}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
