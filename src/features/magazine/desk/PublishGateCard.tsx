import { useId } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiExternalLink,
  FiX,
} from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PublishGateItemDto } from "../api/pieces.api";
import { CARE_GATE_OPEN_CODE } from "../api/piecePublish.api";
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
 */
export function PublishGateCard({
  publishGate,
  action,
  onOpenCare,
}: PublishGateCardProps) {
  const { t } = useTranslation();
  const reasonId = useId();
  const { isPublished, isScheduled, publishedAtLabel, publicHref, refusal } =
    action;
  const isLiveOrScheduled = isPublished || isScheduled;

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
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {isLiveOrScheduled ? (
        <div className={styles.publishState}>
          <p className={styles.publishStatus}>
            {isScheduled ? (
              <FiClock aria-hidden />
            ) : (
              <FiCheck className={styles.doneIcon} aria-hidden />
            )}
            <span>
              {isScheduled
                ? t("magazine:piece.publish.scheduledFor", {
                    date: publishedAtLabel ?? "",
                  })
                : t("magazine:piece.publish.liveSince", {
                    date: publishedAtLabel ?? "",
                  })}
            </span>
          </p>
          {isPublished && publicHref && (
            <Button variant="ghost" size="sm" to={publicHref}>
              <FiExternalLink aria-hidden />
              {t("magazine:piece.publish.viewLive")}
            </Button>
          )}
          <Button
            variant="danger"
            onClick={action.askToUnpublish}
            disabled={action.isPending}
          >
            {t("magazine:piece.publish.unpublish")}
          </Button>
        </div>
      ) : (
        <>
          <p className={styles.tiny}>{t("magazine:piece.gate.notAdvisory")}</p>
          {action.hasOpenGateItems && (
            <>
              {/* The reason the Publish button below reads as blocked, and the
                  way out of it. `id` is what that button points its
                  `aria-describedby` at, so the reason is announced rather than
                  left as a silent disabled control. */}
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
              {refusal.openGateItems.map((reason) => (
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
