import { useId, useState } from "react";
import { FiClock, FiLock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ThreadPoll, ThreadPollOption } from "./forum.data";
import styles from "./ThreadPollCard.module.css";

/**
 * The ballot on an opening post: the options, the viewer's own answer, and the
 * tally once there is one to show.
 *
 * ## NULL IS NOT ZERO
 *
 * `voteCount` and `totalVotes` arrive as `number | null`, and `null` is the
 * server DECLINING to say — it withholds the tally until the viewer has voted
 * or the poll has closed, so nobody answers with the majority instead of with
 * the truth. `resultsVisible` says which of the two a null is, and it is the
 * only thing this card branches on. Drawing a bar from a null at 0% would tell
 * a member "no votes" about a poll that may hold hundreds, so before the
 * results are released this renders CHOICES ONLY: no numbers, no bars, no
 * percentages, and a line saying the answers show once they have voted.
 *
 * ## A real form control
 *
 * One `<fieldset>` with a `<legend>` that says how many answers to pick, and a
 * native radio (single-choice) or checkbox (multi-choice) per option. Keyboard
 * behaviour, grouping and announcement come from the platform rather than from
 * a `role` written on a `<div>`.
 *
 * A CLOSED poll still READS. The options, the viewer's own answer and the final
 * tally all stay on the page; only the inputs and the submit go away.
 */
export function ThreadPollCard({
  poll,
  onVote,
  isVoting,
  error,
}: {
  poll: ThreadPoll;
  /** Cast the whole selection. Re-voting replaces the previous answer. */
  onVote: (optionIds: string[]) => void;
  isVoting: boolean;
  /** Why the last ballot did not land, or null. */
  error: "closed" | "failed" | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const groupName = useId();
  const [selection, setSelection] = useState<string[]>(() =>
    poll.options.filter((option) => option.selected).map((option) => option.id),
  );

  const isOpen = !poll.isClosed;
  // THE gate on every number below. Never `voteCount || 0`, and never a `?? 0`
  // rescue either: a released result that still arrived without a total is a
  // number nobody sent, so it stays null and simply draws nothing.
  const showResults = poll.resultsVisible;
  const total = showResults ? poll.totalVotes : null;

  const toggle = (optionId: string) => {
    setSelection((current) => {
      if (!poll.allowMultiple) return [optionId];
      return current.includes(optionId)
        ? current.filter((held) => held !== optionId)
        : [...current, optionId];
    });
  };

  const hasChanged =
    selection.length > 0 &&
    !(
      poll.hasVoted &&
      selection.length ===
        poll.options.filter((option) => option.selected).length &&
      selection.every(
        (optionId) =>
          poll.options.find((option) => option.id === optionId)?.selected,
      )
    );

  return (
    <section className={styles.poll}>
      <fieldset className={styles.group} disabled={!isOpen || isVoting}>
        <legend className={styles.legend}>
          {t(
            poll.allowMultiple
              ? "forum:composePage.preview.pollPickMany"
              : "forum:composePage.preview.pollPickOne",
          )}
        </legend>
        {poll.options.map((option) => (
          <PollOptionRow
            key={option.id}
            option={option}
            groupName={groupName}
            allowMultiple={poll.allowMultiple}
            isChecked={selection.includes(option.id)}
            onToggle={() => toggle(option.id)}
            showResults={showResults}
            total={total}
          />
        ))}
      </fieldset>

      {isOpen && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.submit}
          disabled={!hasChanged || isVoting}
          aria-busy={isVoting}
          onClick={() => onVote(selection)}
        >
          {t(poll.hasVoted ? "forum:poll.changeVoteCta" : "forum:poll.voteCta")}
        </Button>
      )}

      <PollFootnote poll={poll} total={total} formatNumber={format.number} />

      {error && (
        <p className={styles.error} role="alert">
          {t(
            error === "closed"
              ? "forum:poll.voteFailedClosed"
              : "forum:poll.voteFailed",
          )}
        </p>
      )}
    </section>
  );
}

/**
 * One answer: its control, its label, and its share of the tally once there is
 * one. The fill is a span behind the words whose width is set inline, and that
 * width is only ever set when a released count and a released total are BOTH
 * present. An option with a withheld count therefore carries no width at all
 * rather than one sitting at zero.
 */
function PollOptionRow({
  option,
  groupName,
  allowMultiple,
  isChecked,
  onToggle,
  showResults,
  total,
}: {
  option: ThreadPollOption;
  groupName: string;
  allowMultiple: boolean;
  isChecked: boolean;
  onToggle: () => void;
  showResults: boolean;
  /** Total selections, or null while the results are withheld. */
  total: number | null;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  // Two conditions, both required: the server released the results AND this
  // option carries a real count. Either one missing means there is no number.
  const count =
    showResults && option.voteCount !== null ? option.voteCount : null;
  // A share needs BOTH a released count and a released total to divide it by.
  // Missing either, there is no percentage and therefore no fill: an empty
  // track says "not saying", where a track at zero would say "nobody".
  const share =
    count !== null && total !== null && total > 0
      ? Math.round((count / total) * 100)
      : null;

  return (
    <label
      className={styles.option}
      data-answered={count !== null ? "true" : undefined}
    >
      <input
        type={allowMultiple ? "checkbox" : "radio"}
        className={styles.control}
        name={allowMultiple ? undefined : groupName}
        checked={isChecked}
        onChange={onToggle}
      />
      <span
        className={styles.bar}
        // No fill at all while the tally is withheld: the track stays empty
        // instead of reading as an answer nobody picked.
        style={share !== null ? { width: `${share}%` } : undefined}
        aria-hidden="true"
      />
      <span className={styles.optionLabel}>{option.label}</span>
      {count !== null && (
        <span className={styles.optionCount}>
          {t("forum:poll.optionVotes", {
            count,
            formatted: format.number(count),
          })}
        </span>
      )}
    </label>
  );
}

/** The quiet line under the ballot: how many answers are in, and when voting
 *  stops. Says the results are waiting on a ballot rather than printing a
 *  total nobody is entitled to yet. */
function PollFootnote({
  poll,
  total,
  formatNumber,
}: {
  poll: ThreadPoll;
  total: number | null;
  formatNumber: (value: number) => string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <p className={styles.footnote}>
      {/* Three states, and none of them is a zero standing in for a silence:
          the results are withheld (say so), the results are released and carry
          a total (print it), or they are released and carry none (say nothing
          at all rather than invent the number). */}
      {!poll.resultsVisible && (
        <span>{t("forum:poll.resultsAfterVoting")}</span>
      )}
      {total !== null && (
        <span>
          {t("forum:poll.totalVotes", {
            count: total,
            formatted: formatNumber(total),
          })}
        </span>
      )}
      {poll.isClosed ? (
        <span className={styles.footnoteState}>
          <FiLock aria-hidden="true" />
          {t("forum:poll.closed")}
        </span>
      ) : (
        poll.closesAt && (
          <span className={styles.footnoteState}>
            <FiClock aria-hidden="true" />
            {t("forum:poll.closesAt", {
              date: format.date(new Date(poll.closesAt), {
                day: "numeric",
                month: "short",
              }),
            })}
          </span>
        )
      )}
    </p>
  );
}
