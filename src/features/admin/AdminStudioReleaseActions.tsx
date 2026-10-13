import { useEffect, useRef, useState } from "react";
import { Button, ConfirmDialog, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_LIMITS } from "../studio/api/studio.types";
import type { ModReport } from "./adminModeration.data";
import {
  useRestoreStudioRelease,
  useStaffStudioRelease,
  useTakeDownStudioRelease,
} from "./api/useAdminStudio";
import styles from "./AdminModerationPage.module.css";
import studioStyles from "./AdminStudio.module.css";

/**
 * A reported Studio release, read through the staff view
 * (GET /admin/studio/releases/:id): cover, title, artist, status, and staff's
 * takedown reason. Take down shows for a live release, Restore after one.
 */
export function AdminStudioReleaseActions({ report }: { report: ModReport }) {
  const { t } = useTranslation();
  const staffView = useStaffStudioRelease(report.subjectId);
  const takeDown = useTakeDownStudioRelease();
  const restore = useRestoreStudioRelease();
  const [isTakingDown, setIsTakingDown] = useState(false);
  const [reason, setReason] = useState("");
  const [lastAction, setLastAction] = useState<"takenDown" | "restored" | null>(
    null,
  );
  const actionRowRef = useRef<HTMLDivElement>(null);
  const shouldFocusSwappedButton = useRef(false);
  const release = staffView.data ?? null;
  const releaseStatus = release?.status ?? null;

  // Take down and Restore swap in place, so the focused button (and the
  // confirm dialog's return target) unmounts. Once the swap lands, focus goes
  // to the button that replaced it.
  useEffect(() => {
    if (!shouldFocusSwappedButton.current) return;
    shouldFocusSwappedButton.current = false;
    const frame = requestAnimationFrame(() =>
      actionRowRef.current?.querySelector("button")?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [releaseStatus]);
  // Retry on a never-loaded failed query resets it to pending: read
  // errorUpdateCount so the error panel stays mounted while retrying.
  const hasLoadFailed = release === null && staffView.errorUpdateCount > 0;
  const isRetrying = hasLoadFailed && staffView.isFetching;

  if (hasLoadFailed) {
    return (
      <section className={styles.dSec}>
        <span className={styles.dSecLabel}>
          {t("admin:moderation.studioRelease.heading")}
        </span>
        <p>{t("admin:moderation.studioRelease.loadFailed")}</p>
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={isRetrying || undefined}
          onClick={() => {
            if (!isRetrying) void staffView.refetch();
          }}
        >
          {t("admin:moderation.studioRelease.retry")}
        </Button>
      </section>
    );
  }
  if (!release) return null;
  const isTakenDown = release.status === "taken_down";

  return (
    <section className={styles.dSec}>
      <span className={styles.dSecLabel}>
        {t("admin:moderation.studioRelease.heading")}
      </span>
      <div className={studioStyles.subject}>
        <span className={studioStyles.cover}>
          <ImageSlot
            src={release.coverUrl ?? undefined}
            tint={release.tint}
            width={56}
            height={56}
            radius={6}
            alt={t("admin:moderation.studioRelease.thumbAlt", {
              title: release.title || report.title,
            })}
            placeholder=""
          />
        </span>
        <span className={studioStyles.subjectText}>
          <span className={studioStyles.subjectTitle}>
            {t("admin:moderation.studioRelease.subject", {
              title: release.title || report.title,
              artist: release.artist.name || report.reportedName,
            })}
          </span>
          <span className={studioStyles.fact}>
            <span className={studioStyles.factKey}>
              {t("admin:moderation.studioRelease.statusLabel")}
            </span>
            <span className={studioStyles.factValue}>
              {t(release.statusLabelKey)}
            </span>
          </span>
          {release.takedownReason && (
            <span className={studioStyles.fact}>
              <span className={studioStyles.factKey}>
                {t("admin:moderation.studioRelease.takedownReasonLabel")}
              </span>
              <span className={studioStyles.factValue}>
                {release.takedownReason}
              </span>
            </span>
          )}
        </span>
      </div>
      <p
        role="status"
        className={`${studioStyles.status} ${studioStyles.panelNote}`}
      >
        {lastAction === "takenDown"
          ? t("admin:moderation.studioRelease.takenDownNote")
          : lastAction === "restored"
            ? release.status === "published"
              ? t("admin:moderation.studioRelease.restoredNote")
              : t("admin:moderation.studioRelease.restoredDraftNote")
            : ""}
      </p>
      <div
        ref={actionRowRef}
        className={`${styles.dHeadChips} ${studioStyles.panelActions}`}
      >
        {isTakenDown ? (
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={restore.isPending || undefined}
            onClick={() => {
              if (!restore.isPending) {
                restore.mutate(
                  { releaseId: report.subjectId },
                  {
                    onSuccess: () => {
                      shouldFocusSwappedButton.current = true;
                      setLastAction("restored");
                    },
                  },
                );
              }
            }}
          >
            {t("admin:moderation.studioRelease.restoreCta")}
          </Button>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsTakingDown(true)}
          >
            {t("admin:moderation.studioRelease.takeDownCta")}
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={isTakingDown}
        onClose={() => setIsTakingDown(false)}
        onConfirm={() =>
          takeDown.mutate(
            { releaseId: report.subjectId, reason: reason.trim() },
            {
              onSuccess: () => {
                shouldFocusSwappedButton.current = true;
                setLastAction("takenDown");
                setIsTakingDown(false);
                setReason("");
              },
            },
          )
        }
        loading={takeDown.isPending}
        tone="destructive"
        title={t("admin:moderation.studioRelease.takeDownTitle", {
          title: release.title || report.title,
        })}
        description={t("admin:moderation.studioRelease.takeDownBody")}
        confirmLabel={t("admin:moderation.studioRelease.takeDownConfirm")}
        reason={{
          value: reason,
          onChange: setReason,
          label: t("admin:moderation.studioRelease.reasonLabel"),
          required: true,
          maxLength: STUDIO_LIMITS.takedownReasonMax,
        }}
      />
    </section>
  );
}
