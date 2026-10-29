import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  Badge,
  Button,
  Collapse,
  type BadgeTone,
} from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLandingPreviewOwnerView } from "./api/studioLandingPreviews.adapters";
import type { StudioLandingPreviewAction } from "./api/studioLandingPreviews.api";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import {
  STUDIO_DISCLOSURE,
  STUDIO_DISCLOSURE_EXIT,
  studioStaggerDelay,
} from "./studioMotion";
import styles from "./StudioLandingPreviews.module.css";

const ACTION_CTA_KEY = {
  approve: "studio:landingPreviews.approveCta",
  decline: "studio:landingPreviews.declineCta",
  withdraw: "studio:landingPreviews.withdrawCta",
} as const satisfies Record<StudioLandingPreviewAction, string>;

const ACTION_LABEL_KEY = {
  approve: "studio:landingPreviews.approveLabel",
  decline: "studio:landingPreviews.declineLabel",
  withdraw: "studio:landingPreviews.withdrawLabel",
} as const satisfies Record<StudioLandingPreviewAction, string>;

function statusKeyOf(preview: StudioLandingPreviewOwnerView): string | null {
  if (preview.status === "pending")
    return "studio:landingPreviews.status.pending";
  if (preview.status !== "approved") return null;
  return preview.isEligible
    ? "studio:landingPreviews.status.approved"
    : "studio:landingPreviews.status.approvedOff";
}

/** Pending waits (amber), a live approval is jade and an approval that is off
 *  the page reads neutral. */
function toneOf(preview: StudioLandingPreviewOwnerView): BadgeTone {
  if (preview.status === "pending") return "amber";
  return preview.isEligible ? "jade" : "ghost";
}

/** One request or approved preview of one persona. Which buttons show follows
 *  the server's flags; Approve and Withdraw confirm in the card, Decline acts
 *  at once. A refusal reads in this row's own alert line. */
export function StudioLandingPreviewOwnerRow({
  preview,
  isBusy,
  onAction,
  index = 0,
  failureText = null,
}: {
  preview: StudioLandingPreviewOwnerView;
  isBusy: boolean;
  onAction: (action: StudioLandingPreviewAction) => void;
  index?: number;
  /** The reason the last answer on this row failed, already worded. */
  failureText?: string | null;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const statusKey = statusKeyOf(preview);
  const collapsed = { opacity: 0, height: 0, overflow: "hidden" } as const;
  const actions: StudioLandingPreviewAction[] = [];
  if (preview.canApprove) actions.push("approve");
  if (preview.canDecline) actions.push("decline");
  if (preview.canWithdraw) actions.push("withdraw");
  return (
    <m.li
      className={styles.row}
      data-preview-id={preview.id}
      inert={!isPresent}
      aria-busy={isBusy || undefined}
      initial={collapsed}
      animate={{
        opacity: 1,
        height: "auto",
        transition: {
          ...STUDIO_DISCLOSURE,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE.duration,
          delay: reducedMotion ? 0 : studioStaggerDelay(index),
        },
        transitionEnd: { overflow: "visible" },
      }}
      exit={{
        ...collapsed,
        transition: {
          ...STUDIO_DISCLOSURE_EXIT,
          duration: reducedMotion ? 0 : STUDIO_DISCLOSURE_EXIT.duration,
        },
      }}
    >
      <div className={styles.rowInner}>
        <span className={styles.cover}>
          <StudioPlaylistCover
            coverUrls={preview.coverUrl ? [preview.coverUrl] : []}
            tint={preview.coverTint}
            label={preview.trackTitle}
            radius={8}
          />
        </span>
        <div className={styles.text}>
          <p className={styles.trackTitle}>{preview.trackTitle}</p>
          <p className={styles.meta}>{preview.releaseTitle}</p>
          {statusKey && (
            <Badge tone={toneOf(preview)} className={styles.chip}>
              {t(statusKey)}
            </Badge>
          )}
          {preview.relation === "credited" && (
            <p className={styles.meta}>
              {t("studio:landingPreviews.credited", {
                artist: preview.mainArtist.name,
              })}
            </p>
          )}
          <p className={styles.meta}>
            {t("studio:landingPreviews.requestedOn", {
              date: fmt.date(preview.requestedAt, {
                day: "numeric",
                month: "short",
              }),
            })}
          </p>
          <div className={styles.actions}>
            {actions.map((action) => (
              <Button
                key={action}
                data-preview-action={action}
                size="sm"
                variant={action === "approve" ? "primary" : "quiet"}
                aria-label={t(ACTION_LABEL_KEY[action], {
                  track: preview.trackTitle,
                })}
                aria-disabled={isBusy || undefined}
                onClick={() => {
                  if (!isBusy) onAction(action);
                }}
              >
                {t(ACTION_CTA_KEY[action])}
              </Button>
            ))}
          </div>
          <Collapse isOpen={failureText !== null}>
            <p role="alert" className={styles.failure}>
              {failureText}
            </p>
          </Collapse>
        </div>
      </div>
    </m.li>
  );
}
