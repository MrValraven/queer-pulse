import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { SkeletonLine, Button } from "../../shared/components/ui";
import { AdminDrawer, AdminAvatar, AdminChip, type AvatarTone } from "./ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberRefToPerson } from "../../shared/api/refs";
import type { VerificationRequestStatus } from "../economy/api/verification.api";
import { VERIFICATION_STATUS_TONE } from "./verificationStatusTone";
import { VERIFICATION_REQUEST_STATUS_TONE } from "./verificationRequestStatusTone";
import {
  useVerificationRequestDetail,
  useDecideVerificationRequest,
} from "./api/useAdminVerifications";
import type {
  AdminVerificationRequestDetailDTO,
  VerificationRequestDecisionAction,
} from "./api/adminVerifications.api";
import { VerificationHistoryPanel } from "./VerificationHistoryPanel";
import { VerificationSignalsPanel } from "./VerificationSignalsPanel";
import styles from "./VerificationRequestDrawer.module.css";

/** Statuses a moderator can still act on. Mirrors the backend's state
 *  machine (`submitted → pending → in_review → approved/rejected`, with a
 *  rejected request re-entering the loop via `appealing`): once a request
 *  has landed on `approved` or `withdrawn`, or sits `rejected` without an
 *  appeal filed, there's nothing left to decide here. Illegal transitions
 *  are enforced server-side regardless — this only drives which buttons the
 *  drawer offers so a moderator isn't invited to retry a closed request. */
const DECIDABLE_STATUSES: readonly VerificationRequestStatus[] = [
  "pending",
  "in_review",
  "appealing",
];

/**
 * The Review-queue segment's request drawer (Task 9): member header with the
 * requested level and the request's own status, a duplicate-fingerprint
 * banner when Phase 3's `signals.duplicateProviderRef` flags one (above the
 * appeal banner — the more urgent of the two), an appeal banner when this
 * is a re-opened appeal, the member's own context (their words + optional
 * reference link), the prior decision when one exists, the append-only audit
 * history (`VerificationHistoryPanel`, same component the direct-override
 * drawer uses), the Phase 3 `VerificationSignalsPanel`, and a footer with
 * the three moves a moderator can make: mark in-review, approve, or reject.
 * `requestId` drives its own `useVerificationRequestDetail` fetch (the list
 * row alone doesn't carry `context`/`signals`/`history`) — while loading, the
 * head and body render lightweight skeletons and the footer stays disabled.
 *
 * Reject requires a reason (disabled until typed); approve/mark-in-review
 * send the reason too when one was typed, but it's optional for them per
 * `decideVerificationRequest`'s contract. All three end in a success toast;
 * `useDecideVerificationRequest` owns every cache invalidation (queue rows,
 * this detail, and — on approve — the level console), so this drawer never
 * patches a cache itself.
 *
 * Task 4's next-in-queue: when the caller passes `onDecided`, a successful
 * decision calls it with the just-decided `requestId` INSTEAD of closing —
 * `ReviewQueueSegment` uses that to open the next request in the queue (or
 * close if none remain). Deliberately opt-in (falls back to `onClose()`
 * when `onDecided` is omitted) so this stays the drawer's own single-decision
 * flow, never triggered by the bulk-action bar or the keyboard shortcuts,
 * which both decide through `useBulkDecideVerificationRequests` instead and
 * never open this drawer at all.
 */
export function VerificationRequestDrawer({
  requestId,
  onClose,
  onDecided,
}: {
  requestId: string;
  onClose: () => void;
  /** Called with `requestId` after a successful single decision, in place of
   *  `onClose` — see the next-in-queue note above. */
  onDecided?: (decidedRequestId: string) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { detail, isLoading } = useVerificationRequestDetail(requestId);
  const { decide, pending } = useDecideVerificationRequest();
  const [reason, setReason] = useState("");

  // The drawer stays mounted across a next-in-queue advance (only its
  // `requestId` prop changes), so the reason textarea must be reset by hand
  // — otherwise a reject reason typed for one request would silently carry
  // over and prefill the next one. Reset during render (React's own pattern
  // for "adjusting state when a prop changes", see "You Might Not Need An
  // Effect") rather than in a `useEffect`, which would render the stale
  // reason for one frame before clearing it.
  const [reasonForRequestId, setReasonForRequestId] = useState(requestId);
  if (requestId !== reasonForRequestId) {
    setReasonForRequestId(requestId);
    setReason("");
  }

  const person = memberRefToPerson(detail?.member ?? null);
  const name = person?.name ?? t("admin:verifications.unknownMember");
  const reasonTrimmed = reason.trim();

  const canDecide = Boolean(
    detail && DECIDABLE_STATUSES.includes(detail.status),
  );
  const inReviewDisabled =
    pending || !canDecide || detail?.status === "in_review";
  const approveDisabled = pending || !canDecide;
  const rejectDisabled = pending || !canDecide || reasonTrimmed.length === 0;

  function handleDecide(action: VerificationRequestDecisionAction) {
    decide(
      { id: requestId, action, reason: reasonTrimmed || undefined },
      {
        onSuccess: () => {
          showToast(
            t(`admin:verifications.requests.toast.${action}`),
            "success",
          );
          if (onDecided) {
            onDecided(requestId);
          } else {
            onClose();
          }
        },
        onError: () => {
          showToast(t("admin:verifications.toast.error"), "error");
        },
      },
    );
  }

  return (
    <AdminDrawer
      label={t("admin:verifications.requests.drawer.label", { name })}
      onClose={onClose}
      head={
        isLoading || !detail ? (
          <DrawerHeadSkeleton />
        ) : (
          <div className={styles.dHead}>
            <AdminAvatar
              initials={person?.initials ?? "?"}
              // Person.tint is a wider AvatarTint union; tintForSlug (its
              // only source) only ever produces coral/plum/jade, a subset of
              // AdminAvatar's AvatarTone — same cast as the row list.
              tone={(person?.tint as AvatarTone | undefined) ?? "anon"}
              size="lg"
              src={person?.avatarUrl ?? undefined}
              alt={name}
            />
            <div>
              <h2 className={styles.dName}>{name}</h2>
              <div className={styles.dChips}>
                <AdminChip tone={VERIFICATION_STATUS_TONE[detail.requestedLevel]}>
                  {t(`admin:verifications.level.${detail.requestedLevel}`)}
                </AdminChip>
                <AdminChip
                  tone={VERIFICATION_REQUEST_STATUS_TONE[detail.status]}
                  dot
                >
                  {t(`admin:verifications.requests.status.${detail.status}`)}
                </AdminChip>
              </div>
            </div>
          </div>
        )
      }
      foot={
        <div className={styles.dFoot}>
          <label className={styles.footField}>
            <span className={styles.footFieldLabel}>
              {t("admin:verifications.requests.drawer.reasonLabel")}
            </span>
            <textarea
              className={styles.footTextarea}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t(
                "admin:verifications.requests.drawer.reasonPlaceholder",
              )}
            />
          </label>

          {!canDecide && detail ? (
            <p className={styles.footHint}>
              {t("admin:verifications.requests.drawer.notDecidableHint")}
            </p>
          ) : (
            canDecide && (
              <p className={styles.footHelp}>
                {t("admin:verifications.requests.drawer.reasonRequiredHint")}
              </p>
            )
          )}

          <div className={styles.footActions}>
            <Button
              variant="ghost"
              size="md"
              disabled={inReviewDisabled}
              onClick={() => handleDecide("in_review")}
            >
              {pending
                ? t("admin:verifications.requests.drawer.deciding")
                : t("admin:verifications.requests.drawer.markInReviewCta")}
            </Button>
            <Button
              variant="jade"
              size="md"
              disabled={approveDisabled}
              onClick={() => handleDecide("approve")}
            >
              {pending
                ? t("admin:verifications.requests.drawer.deciding")
                : t("admin:verifications.requests.drawer.approveCta")}
            </Button>
            <Button
              variant="danger"
              size="md"
              disabled={rejectDisabled}
              onClick={() => handleDecide("reject")}
            >
              {pending
                ? t("admin:verifications.requests.drawer.deciding")
                : t("admin:verifications.requests.drawer.rejectCta")}
            </Button>
          </div>
        </div>
      }
    >
      {isLoading || !detail ? (
        <DrawerBodySkeleton />
      ) : (
        <>
          {detail.signals?.duplicateProviderRef && (
            <p className={styles.duplicateBanner}>
              <FiAlertTriangle aria-hidden className={styles.duplicateBannerIcon} />
              {t("admin:verifications.requests.drawer.duplicateBanner", {
                count: detail.signals.duplicateProviderRef.count,
              })}
            </p>
          )}
          {detail.isAppeal && (
            <p className={styles.appealBanner}>
              {t("admin:verifications.requests.drawer.appealBanner")}
            </p>
          )}
          <RequestContextSection detail={detail} />
          <VerificationHistoryPanel
            events={detail.history}
            isLoading={false}
          />
          <VerificationSignalsPanel signals={detail.signals} />
        </>
      )}
    </AdminDrawer>
  );
}

function RequestContextSection({
  detail,
}: {
  detail: AdminVerificationRequestDetailDTO;
}) {
  const { t } = useTranslation();
  const reviewerPerson = memberRefToPerson(detail.reviewedBy);

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>
        {t("admin:verifications.requests.drawer.contextHeading")}
      </h4>
      {detail.context ? (
        <p className={styles.contextText}>{detail.context}</p>
      ) : (
        <p className={styles.contextEmpty}>
          {t("admin:verifications.requests.drawer.contextEmpty")}
        </p>
      )}
      {detail.evidenceRef && (
        <p className={styles.metaLine}>
          {t("admin:verifications.requests.drawer.evidenceLabel")}:{" "}
          {detail.evidenceRef}
        </p>
      )}
      {detail.decisionReason && (
        <p className={styles.metaLine}>
          {t("admin:verifications.requests.drawer.decisionHeading")}:{" "}
          {detail.decisionReason}
          {reviewerPerson &&
            ` · ${t("admin:verifications.requests.drawer.reviewedBy", {
              actor: reviewerPerson.name,
            })}`}
        </p>
      )}
    </div>
  );
}

function DrawerHeadSkeleton() {
  return (
    <div className={styles.dHead} aria-hidden>
      <SkeletonLine width={56} height={56} style={{ borderRadius: "50%" }} />
      <SkeletonLine width={140} height={18} />
    </div>
  );
}

function DrawerBodySkeleton() {
  return (
    <div aria-hidden>
      <SkeletonLine width="90%" height={14} />
      <SkeletonLine width="60%" height={12} style={{ marginTop: 8 }} />
      <SkeletonLine width="85%" height={14} style={{ marginTop: 20 }} />
    </div>
  );
}
