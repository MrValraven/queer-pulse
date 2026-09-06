import { FiAlertCircle, FiCheck, FiInfo, FiX } from "react-icons/fi";
import {
  Button,
  DatePicker,
  FormField,
  SegmentedControl,
} from "../../../../shared/components/ui";
import { cx } from "../../../../shared/lib/cx";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleBlock } from "../../api/pieces.api";
import {
  buildPublishChecklist,
  isPublishReady,
} from "./articlePublishChecklist";
import type { PublishGateFailure } from "./articlePublishAction";
import { isFutureInstant } from "./scheduleValidity";
import styles from "../pieceTabs.module.css";

export type PublishStatus = "now" | "schedule" | "issue";

export interface PublishRailProps {
  standfirst: string;
  blocks: ArticleBlock[];
  publishStatus: PublishStatus;
  onPublishStatusChange: (status: PublishStatus) => void;
  /** `"yyyy-mm-ddThh:mm"` local wall-clock value (`DatePicker` `datetime`
   *  mode's shape), or `null` while nothing's picked yet. Only read when
   *  `publishStatus === "schedule"`. */
  scheduledAt: string | null;
  onScheduledAtChange: (value: string | null) => void;
  published: boolean;
  publishPending: boolean;
  onPublish: () => void;
  /** ENG-111. The draft moved on underneath this tab, so it cannot be flushed
   *  before publishing and this button would ship whatever the server holds
   *  rather than what is on screen. Blocks unpublishing too: the same reload
   *  clears it, and a conflicted editor should make no writes at all. */
  hasSaveConflict: boolean;
  /** The server's structured refusal from the last publish attempt, or null
   *  when the last attempt succeeded or has not happened. The rail is the one
   *  place in this editor that can name the care-gate items holding a piece
   *  back, so it renders them verbatim. */
  gateFailure: PublishGateFailure | null;
}

/**
 * The publish rail: a Now/Schedule/With-issue seg plus the "before it
 * ships" checklist (`buildPublishChecklist` — shared with the page header's
 * own Publish button so the two never disagree). Ported from the design
 * prototype's publish rail (`mag-write.jsx`). Publish stays disabled while
 * an unpublished draft still has an open required item, while "Schedule" is
 * picked without a valid future instant, or while "With issue" is picked (a
 * direct publish would contradict that choice — CNT-2: it ships automatically
 * when `shipIssue` runs, never from this button). Unpublishing an
 * already-live article is never gated by any of this (mirrors
 * `DeckPublishRail`).
 *
 * The checklist is only what this CLIENT can see. The server gates a publish
 * on two more things the editor holds nothing about: the piece's care gate,
 * and a readiness re-check against the SAVED draft, which can differ from
 * this tab's if another editor has been in the piece. Either refusal comes
 * back with the items still open, and `gateFailure` renders them here.
 */
export function PublishRail({
  standfirst,
  blocks,
  publishStatus,
  onPublishStatusChange,
  scheduledAt,
  onScheduledAtChange,
  published,
  publishPending,
  onPublish,
  hasSaveConflict,
  gateFailure,
}: PublishRailProps) {
  const { t } = useTranslation();
  const checklist = buildPublishChecklist(standfirst, blocks, t);
  const doneCount = checklist.filter((item) => item.done).length;
  const scheduleValid = isFutureInstant(scheduledAt);
  const disabled =
    publishPending ||
    hasSaveConflict ||
    (!published &&
      (publishStatus === "issue" ||
        !isPublishReady(checklist) ||
        (publishStatus === "schedule" && !scheduleValid)));

  return (
    <div className={styles.card}>
      <h3>{t("magazine:write.publish.title")}</h3>
      <SegmentedControl
        label={t("magazine:write.publish.whenLabel")}
        options={[
          { value: "now", label: t("magazine:write.publish.now") },
          { value: "schedule", label: t("magazine:write.publish.schedule") },
          { value: "issue", label: t("magazine:write.publish.withIssue") },
        ]}
        value={publishStatus}
        onChange={(value) => onPublishStatusChange(value as PublishStatus)}
        fullWidth
      />

      {publishStatus === "schedule" && (
        <FormField
          label={t("magazine:write.publish.scheduleLabel")}
          helper={t("magazine:write.publish.scheduleNote")}
          error={
            scheduledAt && !scheduleValid
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
      {publishStatus === "issue" && (
        <p className={styles.tiny}>{t("magazine:write.publish.issueNote")}</p>
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

      {/* The server refused the last publish and said why. Rendered as a
          block in the rail rather than a toast: a toast is gone before the
          desk can act on a list, and these items are the work itself. */}
      {gateFailure && (
        <div role="alert" className={cx(styles.note, styles.warn)}>
          <b>
            {t(
              gateFailure.code === "magazine_care_gate_open"
                ? "magazine:write.publish.gate.careHeading"
                : "magazine:write.publish.gate.notReadyHeading",
            )}
          </b>
          {gateFailure.openGateItems.length > 0 && (
            <ul className={styles.ticks}>
              {gateFailure.openGateItems.map((item) => (
                <li key={item} className={styles.open}>
                  <FiAlertCircle aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button
        variant="plum"
        disabled={disabled}
        aria-busy={publishPending}
        onClick={onPublish}
      >
        {published
          ? t("magazine:write.publish.unpublishCta")
          : publishStatus === "schedule"
            ? t("magazine:write.publish.scheduleCta")
            : t("magazine:write.publish.cta")}
      </Button>
    </div>
  );
}
