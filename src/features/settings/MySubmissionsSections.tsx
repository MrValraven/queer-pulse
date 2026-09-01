import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  EmptyState,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
  type BadgeTone,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import styles from "./MySubmissionsPage.module.css";

/**
 * The one visual vocabulary the three intakes share.
 *
 * The three status vocabularies genuinely differ, so this maps only the shades
 * that truly correspond and nothing else: each row still carries its own
 * source's word as the pill's TEXT. A partner application's "rejected", a swap
 * proposal's "declined" and a resource suggestion's "declined" all read as
 * `refused` here, and all three print a different sentence.
 *
 * `closed` exists because a resource suggestion can be `archived`, which is the
 * queue tidying up rather than anybody's verdict. Folding it into `refused`
 * would tell a member they were turned down when nobody turned them down.
 */
export type SubmissionTone = "waiting" | "taken" | "refused" | "closed";

/**
 * Tone to pill colour. The pill's meaning is carried by its text in every case;
 * colour only reinforces it, so a member who cannot tell amber from jade loses
 * nothing.
 */
const TONE_BADGE: Record<SubmissionTone, BadgeTone> = {
  waiting: "amber",
  taken: "jade",
  refused: "plum",
  closed: "ghost",
};

export interface SubmissionCardProps {
  /** Which intake this was, as a short noun phrase. */
  kindLabel: string;
  /** The submission's own headline, read back to the member. */
  title: string;
  tone: SubmissionTone;
  /** The source vocabulary's own word for where this stands. */
  statusLabel: string;
  /** ISO, when the member sent it. */
  sentAt: string;
  /** ISO, when somebody decided. `null` prints no date, never "pending". */
  decidedAt: string | null;
  /** One extra identifying line, e.g. the city or the swap's poster. */
  detail?: string | null;
  /** What the member themself wrote, shown back verbatim. */
  ownMessage?: string | null;
  /** Label above `note`, e.g. "The reviewer wrote". */
  noteLabel?: string;
  /** The reviewer's reason, addressed to this member. */
  note?: string | null;
  /** A neutral sentence explaining a state that is not a verdict. */
  explanation?: string | null;
  /** Printed on a refusal that carries no recorded reason. */
  missingNote?: string | null;
  /** Only ever set where a destination genuinely exists. */
  linkTo?: string;
  linkLabel?: string;
}

/**
 * One thing the member sent in, and what happened to it. Deliberately one
 * component for all three intakes: the whole finding behind this page is that
 * each vertical grew its own answer to "what did I send and what came of it",
 * so the shape of the answer is shared even where the words are not.
 */
export function SubmissionCard({
  kindLabel,
  title,
  tone,
  statusLabel,
  sentAt,
  decidedAt,
  detail,
  ownMessage,
  noteLabel,
  note,
  explanation,
  missingNote,
  linkTo,
  linkLabel,
}: SubmissionCardProps) {
  const { t, language } = useTranslation();
  return (
    <FadeIn className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.kind}>{kindLabel}</span>
        <Badge tone={TONE_BADGE[tone]}>{statusLabel}</Badge>
      </div>

      <h3 className={styles.cardTitle}>{title}</h3>
      {detail && <p className={styles.cardDetail}>{detail}</p>}

      <p className={styles.cardMeta}>
        {t("settings:mySubmissions.row.sentOn", {
          date: formatDate(sentAt, language),
        })}
        {/* `decidedAt` is only ever a date to print. Whether a submission is
            settled is read from its status, because a decision taken before the
            platform recorded decision dates comes back settled with a null
            date. */}
        {decidedAt
          ? ` · ${t("settings:mySubmissions.row.decidedOn", {
              date: formatDate(decidedAt, language),
            })}`
          : ""}
      </p>

      {ownMessage && <p className={styles.ownMessage}>{ownMessage}</p>}

      {explanation && <p className={styles.explanation}>{explanation}</p>}

      {note && (
        <div className={styles.note}>
          {noteLabel && <div className={styles.noteLabel}>{noteLabel}</div>}
          <p className={styles.noteBody}>{note}</p>
        </div>
      )}

      {!note && missingNote && (
        <p className={styles.explanation}>{missingNote}</p>
      )}

      {linkTo && linkLabel && (
        <div className={styles.cardActions}>
          <Link to={linkTo} className={styles.viewLink}>
            {linkLabel}
          </Link>
        </div>
      )}
    </FadeIn>
  );
}

/** Mirrors a card so a section does not jump when its rows arrive. */
export function SubmissionsSkeleton() {
  return (
    <div className={styles.list} aria-busy="true">
      {Array.from({ length: 2 }).map((_, skeletonIndex) => (
        <div key={skeletonIndex} className={styles.card} aria-hidden>
          <SkeletonLine width={110} height={18} />
          <SkeletonLine width="62%" height={22} style={{ marginTop: 10 }} />
          <SkeletonLine width="40%" height={14} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

export interface SubmissionSectionProps {
  heading: string;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  errorTitle: string;
  errorDescription: string;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  children: ReactNode;
}

/**
 * One intake's slice of the page, with its own load, failure and empty states.
 *
 * The order of these branches is the point. A failed fetch is answered with
 * `LoadErrorState` and a retry, never with the empty state: "we could not
 * reach the server" and "you have never submitted anything" are opposite
 * answers, and showing the second when the first is true tells somebody
 * waiting on a decision that their submission is gone.
 *
 * Each section owns its state entirely, so one failing source leaves the other
 * two rendering. A single combined error would blank the page for a member
 * whose partner application is perfectly readable.
 */
export function SubmissionSection({
  heading,
  isLoading,
  isError,
  isEmpty,
  onRetry,
  errorTitle,
  errorDescription,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  children,
}: SubmissionSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{heading}</h2>
      {isLoading ? (
        <SubmissionsSkeleton />
      ) : isError ? (
        <LoadErrorState
          compact
          onRetry={onRetry}
          title={errorTitle}
          description={errorDescription}
        />
      ) : isEmpty ? (
        <EmptyState
          compact
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <div className={styles.list}>{children}</div>
      )}
    </section>
  );
}
