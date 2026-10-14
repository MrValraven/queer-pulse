import { useEffect, useRef, useState } from "react";
import { ApiError } from "../../shared/api/client";
import { Button, Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ModReport } from "./adminModeration.data";
import type { AdminPersonaPostDTO } from "./api/adminPersonaPosts.api";
import {
  useRemoveReportedPersonaPost,
  useStaffPersonaPost,
} from "./api/useAdminPersonaPosts";
import styles from "./AdminModerationPage.module.css";
import studioStyles from "./AdminStudio.module.css";

const REASON_MAX = 500;
const PHOTO_WIDTH = 240;
const PHOTO_HEIGHT = 180;

const hostOf = (url: string | null) => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
};

/** The post as written: the persona, the body, its photo and its link's
 *  host. The persona's name comes from the staff read alone: the report's
 *  reported member is the persona's creator, who stays unnamed here. */
function ReportedPostSubject({ post }: { post: AdminPersonaPostDTO }) {
  const { t } = useTranslation();
  const personaName = post.persona.name;
  const linkHost = hostOf(post.linkUrl);
  return (
    <div className={studioStyles.subjectText}>
      <p className={studioStyles.subjectTitle}>
        {t("admin:moderation.personaPost.subject", { persona: personaName })}
      </p>
      <p className={studioStyles.factValue}>{post.body}</p>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={t("admin:moderation.personaPost.photoAlt", {
            persona: personaName,
          })}
          className={studioStyles.postPhoto}
          width={PHOTO_WIDTH}
          height={PHOTO_HEIGHT}
          loading="lazy"
          decoding="async"
        />
      )}
      {linkHost && (
        <span className={studioStyles.fact}>
          <span className={studioStyles.factKey}>
            {t("admin:moderation.personaPost.linkLabel")}
          </span>
          <span className={studioStyles.factValue}>{linkHost}</span>
        </span>
      )}
    </div>
  );
}

/** A reported persona post, read through the staff view
 *  (GET /admin/persona-posts/:id), then "Remove update". An update already gone
 *  (a 404, or removed here) reads as removed, with no action left. */
export function AdminPersonaPostActions({ report }: { report: ModReport }) {
  const { t } = useTranslation();
  const staffView = useStaffPersonaPost(report.subjectId);
  const remove = useRemoveReportedPersonaPost();
  const [isConfirming, setIsConfirming] = useState(false);
  const [reason, setReason] = useState("");
  // Removed from this panel reads "Update removed"; an update that was already
  // gone (deleted by its owner, or a 404 on Remove) reads as gone.
  const [wasRemovedHere, setWasRemovedHere] = useState(false);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);
  const shouldFocusHeading = useRef(false);
  const post = staffView.data;
  const isGone = post === null;
  // Retry on a never-loaded failed query resets it to pending: read
  // errorUpdateCount so the line stays while retrying.
  const hasLoadFailed = post === undefined && staffView.errorUpdateCount > 0;
  const isRetrying = hasLoadFailed && staffView.isFetching;

  // A Retry that lands unmounts the focused Retry button, so focus goes to
  // the panel's heading once the read answers.
  useEffect(() => {
    if (post === undefined || !shouldFocusHeading.current) return;
    shouldFocusHeading.current = false;
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [post]);

  // After a removal, or a removal that finds the post already gone, the
  // Remove button folds away with the post: the dialog closes and focus
  // moves to the line that says the post is gone.
  const finishRemoval = () => {
    setIsConfirming(false);
    setReason("");
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  if (post === undefined && !hasLoadFailed) return null;

  return (
    <section className={styles.dSec}>
      <span ref={headingRef} tabIndex={-1} className={styles.dSecLabel}>
        {t("admin:moderation.personaPost.heading")}
      </span>
      {hasLoadFailed && (
        <p className={studioStyles.panelNote}>
          {t("admin:moderation.personaPost.loadFailed")}{" "}
          <Button
            variant="ghost"
            size="sm"
            aria-disabled={isRetrying || undefined}
            onClick={() => {
              if (isRetrying) return;
              shouldFocusHeading.current = true;
              void staffView.refetch();
            }}
          >
            {t("admin:moderation.personaPost.retry")}
          </Button>
        </p>
      )}
      <Collapse isOpen={Boolean(post)}>
        {post && <ReportedPostSubject post={post} />}
      </Collapse>
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className={`${studioStyles.status} ${studioStyles.panelNote}`}
      >
        {isGone
          ? t(
              wasRemovedHere
                ? "admin:moderation.personaPost.removedNote"
                : "admin:moderation.personaPost.goneNote",
            )
          : ""}
      </p>
      <Collapse isOpen={Boolean(post)}>
        <div className={`${styles.dHeadChips} ${studioStyles.panelActions}`}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsConfirming(true)}
          >
            {t("admin:moderation.personaPost.removeCta")}
          </Button>
        </div>
      </Collapse>
      <ConfirmDialog
        open={isConfirming}
        onClose={() => setIsConfirming(false)}
        onConfirm={() =>
          remove.mutate(
            {
              postId: report.subjectId,
              reason: reason.trim(),
              reportId: report.id,
            },
            {
              onSuccess: () => {
                setWasRemovedHere(true);
                finishRemoval();
              },
              onError: (error) => {
                if (error instanceof ApiError && error.status === 404)
                  finishRemoval();
              },
            },
          )
        }
        loading={remove.isPending}
        tone="destructive"
        title={t("admin:moderation.personaPost.removeTitle")}
        description={t("admin:moderation.personaPost.removeBody")}
        confirmLabel={t("admin:moderation.personaPost.removeCta")}
        reason={{
          value: reason,
          onChange: setReason,
          label: t("admin:moderation.personaPost.reasonLabel"),
          required: true,
          maxLength: REASON_MAX,
        }}
      />
    </section>
  );
}
