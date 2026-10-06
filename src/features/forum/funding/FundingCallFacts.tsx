import { useState } from "react";
import { FiEdit2, FiExternalLink } from "react-icons/fi";
import { Button, SaveButton } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Thread } from "../forum.data";
import { ELIGIBILITY_LABEL_KEYS, SCOPE_LABEL_KEYS } from "./funding.data";
import type { ForumFundingView } from "./funding.types";
import {
  defaultViewerTimeZone,
  formatLisbonDeadline,
  formatViewerDeadline,
  isViewerOffsetFromLisbon,
} from "./fundingDates";
import {
  amountRangeLabel,
  callDeadlineCopy,
  type FundingTone,
} from "./fundingFormat";
import { FactRow } from "./FundingFactRow";
import { useDeadlineRefetch } from "./useDeadlineRefetch";
import { useMinuteClock } from "./useMinuteClock";
import styles from "./FundingFacts.module.css";

const TONE_CLASS: Record<FundingTone, string | undefined> = {
  neutral: undefined,
  accent: styles.toneAccent,
  muted: styles.toneMuted,
};

export interface FundingCallFactsProps {
  thread: Thread;
  funding: ForumFundingView;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  /** Injectable for tests; the viewer's own zone otherwise. */
  viewerTimeZone?: string;
  /** Present only for the author or a moderator. */
  onEditDetails?: () => void;
}

export function FundingCallFacts({
  thread,
  funding,
  bookmarked,
  onToggleBookmark,
  viewerTimeZone,
  onEditDetails,
}: FundingCallFactsProps) {
  const { t, language } = useTranslation();
  const fmt = useFormat();
  // The clock also ticks just past the deadline, which turns the countdown to
  // Closed and lets `useDeadlineRefetch` ask the server on time.
  const nowMs = useMinuteClock(
    funding.deadline ? Date.parse(funding.deadline) : null,
  );
  const [zone] = useState(() => viewerTimeZone ?? defaultViewerTimeZone());
  useDeadlineRefetch(thread.slug, funding, nowMs);
  const amount = amountRangeLabel(t, fmt, funding.amountMin, funding.amountMax);
  const deadline = callDeadlineCopy(fmt, funding, nowMs);
  const isOpen = deadline !== null && deadline.tone !== "muted";
  const eligibility = new Intl.ListFormat(language, {
    type: "conjunction",
  }).format(
    funding.eligibility.map((value) => t(ELIGIBILITY_LABEL_KEYS[value])),
  );
  const eyebrow = t("forum:funding.facts.heading");

  return (
    <section className={styles.panel} aria-label={eyebrow}>
      <p className={styles.eyebrow} aria-hidden="true">
        {eyebrow}
      </p>
      <dl className={styles.facts}>
        {funding.funderName && (
          <FactRow label={t("forum:funding.facts.funder")}>
            {funding.funderName}
          </FactRow>
        )}
        {amount && (
          <FactRow label={t("forum:funding.facts.amount")}>{amount}</FactRow>
        )}
        <FactRow label={t("forum:funding.facts.deadline")}>
          <span className={styles.deadlineFact}>
            {funding.deadline && (
              <span>
                {t("forum:funding.facts.lisbonTime", {
                  date: formatLisbonDeadline(fmt, funding.deadline),
                })}
              </span>
            )}
            {funding.deadline &&
              isViewerOffsetFromLisbon(funding.deadline, zone) && (
                <span className={styles.yourTime}>
                  {t("forum:funding.facts.yourTime", {
                    date: formatViewerDeadline(fmt, funding.deadline, zone),
                  })}
                </span>
              )}
            {deadline && (
              <span className={TONE_CLASS[deadline.tone]}>
                <Translation
                  i18nKey={deadline.key}
                  values={deadline.values}
                  slots={
                    deadline.count === undefined
                      ? undefined
                      : {
                          count: (
                            <RollingNumber
                              value={fmt.number(deadline.count)}
                              numericValue={deadline.count}
                            />
                          ),
                        }
                  }
                />
              </span>
            )}
          </span>
        </FactRow>
        {funding.eligibility.length > 0 && (
          <FactRow label={t("forum:funding.facts.eligibility")}>
            {eligibility}
          </FactRow>
        )}
        {funding.scope && (
          <FactRow label={t("forum:funding.facts.scope")}>
            {t(SCOPE_LABEL_KEYS[funding.scope])}
          </FactRow>
        )}
      </dl>
      <div className={styles.actions}>
        <Button
          href={funding.linkUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          variant={isOpen ? "primary" : "ghost"}
          aria-label={t(
            isOpen
              ? "forum:funding.facts.openCallAria"
              : "forum:funding.facts.seeCallAria",
            { host: funding.linkHost },
          )}
        >
          {/* A closed call is there to read, so its quieter button says so. */}
          {t(
            isOpen
              ? "forum:funding.facts.openCall"
              : "forum:funding.facts.seeCall",
          )}
          <FiExternalLink aria-hidden />
        </Button>
        <SaveButton
          saved={bookmarked}
          onToggle={onToggleBookmark}
          label={t(
            bookmarked ? "shared:saveButton.saved" : "shared:saveButton.save",
          )}
        />
        {onEditDetails && (
          <Button variant="ghost" size="sm" onClick={onEditDetails}>
            <FiEdit2 aria-hidden />
            {t("forum:funding.facts.editDetails")}
          </Button>
        )}
      </div>
      {funding.deadline && isOpen && (
        <p className={styles.hint}>{t("forum:funding.facts.saveHint")}</p>
      )}
    </section>
  );
}
