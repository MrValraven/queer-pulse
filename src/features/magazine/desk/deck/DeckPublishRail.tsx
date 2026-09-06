import { FiCheck, FiInfo, FiX } from "react-icons/fi";
import {
  Button,
  DatePicker,
  FormField,
  SegmentedControl,
} from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useFormat } from "../../../../shared/i18n/format";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { DeckDraft } from "../../deckDraft";
import { isFutureInstant } from "../editor/scheduleValidity";
import { buildDeckPublishChecklist } from "./deckPublishChecklist";
import {
  isDeckPublishBlocked,
  type DeckPublishStatus,
} from "./deckPublishGate";
import styles from "../pieceTabs.module.css";

// Re-exported so every existing import site keeps reading the rail as the
// home of its own status type; the union itself lives beside the gate that
// interprets it.
export type { DeckPublishStatus };

export interface DeckPublishRailProps {
  draft: DeckDraft;
  published: boolean;
  /** `false` for a brand-new, never-saved draft — publishing needs a server id. */
  canPublish: boolean;
  publishPending: boolean;
  publishStatus: DeckPublishStatus;
  onPublishStatusChange: (status: DeckPublishStatus) => void;
  /** `"yyyy-mm-ddThh:mm"` local wall-clock value (`DatePicker` `datetime`
   *  mode's shape), or `null` while nothing is picked yet. Only read when
   *  `publishStatus === "schedule"`. */
  scheduledAt: string | null;
  onScheduledAtChange: (value: string | null) => void;
  /** The issue this deck ships with, resolved through the desk piece that
   *  owns it, or `null` when no piece has filed it under one yet. */
  issueNumber: string | null;
  /** The stored publish instant. A future one means the deck is scheduled
   *  rather than live, which is worth saying out loud: otherwise scheduling
   *  and publishing look identical once the rail flips to Unpublish. */
  publishedAt: string | null;
  onPublish: () => void;
}

/**
 * The deck editor's publish rail: a Now/Schedule/With-issue seg plus the
 * "before it ships" checklist (`buildDeckPublishChecklist`, shared with the
 * page header's own Publish button so the two never disagree). Mirrors the
 * article editor's `PublishRail` (`desk/editor/PublishRail.tsx`) down to the
 * `pieceTabs.module.css` card/ticks styling and the generic `write.publish.*`
 * copy.
 *
 * PRD-131 — all three segments now do what they say:
 *
 * - **Now** publishes on the spot.
 * - **Schedule** picks a future instant and sends it as `publishedAt`. No new
 *   column was needed: the public deck reads already require
 *   `published_at <= now`, so a future stamp holds the deck back on its own.
 * - **With issue** is a hold, so the Publish button is deliberately disabled
 *   for it. `MagazinePieceService.shipIssue` publishes the deck of every
 *   past-gate piece in an issue, so the deck goes live when the issue does
 *   and pressing Publish here would contradict that choice. When no piece has
 *   filed the deck under an issue, the note says so instead of promising a
 *   ship that will never come.
 *
 * Publish stays disabled while an unpublished draft has an open required
 * item or an invalid schedule. Unpublishing a live deck is never gated: an
 * editor must always be able to pull something down.
 */
export function DeckPublishRail({
  draft,
  published,
  canPublish,
  publishPending,
  publishStatus,
  onPublishStatusChange,
  scheduledAt,
  onScheduledAtChange,
  issueNumber,
  publishedAt,
  onPublish,
}: DeckPublishRailProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // `isFutureInstant` is documented against the `DatePicker` wall-clock
  // shape, but it is a plain `new Date(...)` comparison, so a stored ISO
  // instant answers the same question: is this deck scheduled rather than
  // already live?
  const scheduledInstant =
    publishedAt && isFutureInstant(publishedAt) ? new Date(publishedAt) : null;
  const checklist = buildDeckPublishChecklist(draft, t);
  const doneCount = checklist.filter((item) => item.done).length;
  const isScheduleValid = isFutureInstant(scheduledAt);
  const disabled =
    !canPublish ||
    publishPending ||
    isDeckPublishBlocked({ draft, published, publishStatus, scheduledAt, t });

  return (
    <div className={styles.card}>
      <h3>{t("magazine:write.publish.title")}</h3>
      {scheduledInstant && (
        <p className={styles.tiny}>
          {t("magazine:deck.editor.publish.scheduledFor", {
            date: fmt.date(scheduledInstant),
            time: fmt.time(scheduledInstant),
          })}
        </p>
      )}
      {/* Timing is a draft-only choice: a live deck's only next move is to
          come back down, so the seg would just be noise beside Unpublish. */}
      {!published && (
        <SegmentedControl
          label={t("magazine:write.publish.whenLabel")}
          options={[
            { value: "now", label: t("magazine:write.publish.now") },
            { value: "schedule", label: t("magazine:write.publish.schedule") },
            { value: "issue", label: t("magazine:write.publish.withIssue") },
          ]}
          value={publishStatus}
          onChange={(value) =>
            onPublishStatusChange(value as DeckPublishStatus)
          }
          fullWidth
        />
      )}

      {!published && publishStatus === "schedule" && (
        <FormField
          label={t("magazine:write.publish.scheduleLabel")}
          helper={t("magazine:write.publish.scheduleNote")}
          error={
            scheduledAt && !isScheduleValid
              ? t("magazine:write.publish.scheduleInvalid")
              : undefined
          }
        >
          <DatePicker
            mode="datetime"
            value={scheduledAt}
            onChange={onScheduledAtChange}
            clearable
          />
        </FormField>
      )}
      {!published && publishStatus === "issue" && (
        <p className={styles.tiny}>
          {issueNumber
            ? t("magazine:deck.editor.publish.issueLinked", {
                number: issueNumber,
              })
            : t("magazine:deck.editor.publish.issueUnlinked")}
        </p>
      )}

      <div>
        <span className={styles.tiny}>
          {t("magazine:write.publish.checklistHeading", {
            done: doneCount,
            total: checklist.length,
          })}
        </span>
        <ul className={styles.ticks}>
          {checklist.map((item) => (
            <li
              key={item.id}
              className={cx(!item.done && item.required && styles.open)}
            >
              {item.done ? (
                <FiCheck aria-hidden />
              ) : item.required ? (
                <FiX aria-hidden />
              ) : (
                <FiInfo aria-hidden />
              )}
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant="plum"
        disabled={disabled}
        aria-busy={publishPending}
        onClick={onPublish}
      >
        {published
          ? t("magazine:deck.editor.unpublish")
          : publishStatus === "schedule"
            ? t("magazine:write.publish.scheduleCta")
            : t("magazine:deck.editor.publish")}
      </Button>
    </div>
  );
}
