import { useId } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiExternalLink,
  FiGlobe,
  FiX,
} from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PublishGateItemDto } from "../api/pieces.api";
import { CARE_GATE_OPEN_CODE } from "../api/piecePublish.api";
import { publishGateLabel, publishRefusalReasons } from "./publishGateReason";
import type { PiecePublishAction } from "./usePiecePublishAction";
import styles from "./pieceTabs.module.css";

export interface PublishGateCardProps {
  publishGate: PublishGateItemDto[];
  /** The one publish action shared with the page header, so the two controls
   *  are never in different states. */
  action: PiecePublishAction;
  /** Sends the editor to the Care tab, where the open items are resolved. */
  onOpenCare: () => void;
}

/**
 * The publish gate: every consent and sensitivity-read blocker that must be
 * resolved before a piece can go out, and the publish action itself. Lives in
 * the piece record's `.erail` sidebar.
 *
 * While anything below is open the Publish button is `aria-disabled` rather
 * than `disabled`, so it keeps its place in the tab order and a screen reader
 * still reaches the reason through `aria-describedby`. The real gate is the
 * server's: it re-checks on every attempt and can refuse a publish this card
 * believed was clear (someone reopened an item in another tab), which is what
 * the refusal block renders.
 *
 * Unpublishing is never gated. Pulling a live piece back down has to stay
 * available whatever state the gate is in.
 *
 * PRD-437: there is no scheduled job, so a scheduled piece's writer hears
 * about it only when an editor presses Publish after its instant has passed.
 * The card says so on both sides of that instant: while scheduled, under the
 * date; once live but still short of Published, as the status line, with
 * Publish offered beside Unpublish. While care items are still open that
 * line names them as the first step, so it never asks for a Publish the
 * gate above would block.
 */
export function PublishGateCard({
  publishGate,
  action,
  onOpenCare,
}: PublishGateCardProps) {
  const { t, language } = useTranslation();
  const {
    isPublished,
    isScheduled,
    isAlreadyLive,
    publishedAtLabel,
    publicHref,
    refusal,
  } = action;
  const isLiveOrScheduled = isPublished || isScheduled || isAlreadyLive;

  return (
    <div className={styles.card}>
      <h3>{t("magazine:piece.gate.heading")}</h3>
      <div className={styles.stack}>
        {publishGate.map((item) => (
          <div
            key={item.label}
            className={cx(styles.gaterow, !item.done && styles.open)}
          >
            {item.done ? (
              <FiCheck className={styles.doneIcon} aria-hidden />
            ) : (
              <FiX className={styles.openIcon} aria-hidden />
            )}
            <span>{publishGateLabel(item.label, item.done, t, language)}</span>
          </div>
        ))}
      </div>

      {isLiveOrScheduled ? (
        <div className={styles.publishState}>
          <p className={styles.publishStatus}>
            {isScheduled ? (
              <FiClock aria-hidden />
            ) : isAlreadyLive ? (
              <FiGlobe aria-hidden />
            ) : (
              <FiCheck className={styles.doneIcon} aria-hidden />
            )}
            <span>
              {isScheduled
                ? t("magazine:piece.publish.scheduledFor", {
                    date: publishedAtLabel ?? "",
                  })
                : isAlreadyLive
                  ? t(
                      action.hasOpenGateItems
                        ? "magazine:desk.goLive.liveSinceCloseCare"
                        : "magazine:desk.goLive.liveSinceTellWriter",
                      { date: publishedAtLabel ?? "" },
                    )
                  : t("magazine:piece.publish.liveSince", {
                      date: publishedAtLabel ?? "",
                    })}
            </span>
          </p>
          {isScheduled && (
            <p className={styles.tiny}>
              {t("magazine:desk.goLive.writerHearsOnPublish")}
            </p>
          )}
          {isPublished && publicHref && (
            <Button variant="ghost" size="sm" to={publicHref}>
              <FiExternalLink aria-hidden />
              {t("magazine:piece.publish.viewLive")}
            </Button>
          )}
          {isAlreadyLive && (
            <PublishGateControls action={action} onOpenCare={onOpenCare} />
          )}
          <Button
            variant="danger"
            onClick={action.askToUnpublish}
            disabled={action.isPending}
          >
            {isScheduled
              ? t("magazine:piece.header.unschedule")
              : t("magazine:piece.publish.unpublish")}
          </Button>
        </div>
      ) : (
        <>
          <p className={styles.tiny}>{t("magazine:piece.gate.notAdvisory")}</p>
          <PublishGateControls action={action} onOpenCare={onOpenCare} />
        </>
      )}

      {refusal && (
        <div
          className={cx(styles.note, styles.warn, styles.noteStack)}
          role="alert"
        >
          <b>
            <FiAlertTriangle aria-hidden />
            {refusal.code === CARE_GATE_OPEN_CODE
              ? t("magazine:piece.publish.refusedCareGateHeading")
              : t("magazine:piece.publish.refusedNotReadyHeading")}
          </b>
          {refusal.openGateItems.length > 0 ? (
            <ul className={styles.ticks}>
              {publishRefusalReasons(
                refusal.openGateItems,
                refusal.code,
                t,
                language,
              ).map((reason) => (
                <li key={reason} className={styles.open}>
                  <FiX aria-hidden />
                  {reason}
                </li>
              ))}
            </ul>
          ) : (
            // The server always sends `openGateItems`, but a proxy or an older
            // build can strip it. Fall back to its prose rather than an
            // empty warning box that names no reason at all.
            <span>{t("magazine:piece.publish.refusedNoDetail")}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface PublishGateControlsProps {
  action: PiecePublishAction;
  onOpenCare: () => void;
}

/**
 * The gated Publish button with its blocked reason and the way to the Care
 * tab. Shared by a draft and by a live piece still short of Published
 * (PRD-437), since settling that piece answers to the same gate.
 */
function PublishGateControls({ action, onOpenCare }: PublishGateControlsProps) {
  const { t } = useTranslation();
  const reasonId = useId();

  return (
    <>
      {action.hasOpenGateItems && (
        <>
          {/* The reason the Publish button below reads as blocked, and the
              way out of it. `id` is what that button points its
              `aria-describedby` at, so a screen reader announces the reason
              with the control. */}
          <p className={cx(styles.note, styles.warn)} id={reasonId}>
            <span>
              {t("magazine:piece.publish.blockedByGate", {
                count: action.openGateItems.length,
              })}
            </span>
          </p>
          <Button variant="ghost" size="sm" onClick={onOpenCare}>
            {t("magazine:piece.publish.openCareTab")}
          </Button>
        </>
      )}
      <Button
        variant="plum"
        onClick={action.askToPublish}
        aria-disabled={action.hasOpenGateItems || action.isPending}
        aria-describedby={action.hasOpenGateItems ? reasonId : undefined}
      >
        {t("magazine:piece.gate.publish")}
      </Button>
    </>
  );
}
