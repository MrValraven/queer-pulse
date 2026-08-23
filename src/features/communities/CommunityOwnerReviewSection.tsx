import { useState } from "react";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  OWNER_REVIEW_REASON_MAX,
  OWNER_REVIEW_REASON_MIN,
  type CommunityOwnerReviewStateDTO,
} from "./api/communityOwnerReview.api";
import {
  useOpenCommunityOwnerReview,
  useWithdrawCommunityOwnerReview,
} from "./api/useCommunityOwnerReview";
import {
  CommunityOwnerReviewFlagNotice,
  CommunityOwnerReviewNotice,
} from "./CommunityOwnerReviewNotice";
import styles from "./CommunityDangerZone.module.css";

/**
 * The owner-absence escalation, in the danger zone.
 *
 * Moderators and co-owners can ask platform staff to look at a community whose
 * owner has stopped answering; the owner sees any open request and can
 * withdraw it, since the owner reading it is itself the evidence that they are
 * present. Who may do which comes from the server's own `canOpen`/`canWithdraw`
 * rather than from a role check repeated here.
 *
 * Filing requires a written account, and the copy asks for contact attempts
 * and what the community is waiting on. Platform staff decide what the silence
 * means.
 */
export function CommunityOwnerReviewSection({
  slug,
  state,
  isOwner,
}: {
  slug: string;
  state: CommunityOwnerReviewStateDTO | null;
  isOwner: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const openReview = useOpenCommunityOwnerReview(slug);
  const withdrawReview = useWithdrawCommunityOwnerReview(slug);
  const [isFiling, setIsFiling] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [reason, setReason] = useState("");

  if (!state) return null;

  const failed = () =>
    showToast(
      t("communities:detail.dangerZone.ownerReview.errorToast"),
      "error",
    );

  const submit = () => {
    if (reason.trim().length < OWNER_REVIEW_REASON_MIN) {
      showToast(
        t("communities:detail.dangerZone.ownerReview.confirm.tooShort", {
          min: fmt.number(OWNER_REVIEW_REASON_MIN),
        }),
        "error",
      );
      return;
    }
    openReview.mutate(
      { reason: reason.trim() },
      {
        onSuccess: () => {
          setIsFiling(false);
          setReason("");
          showToast(
            t("communities:detail.dangerZone.ownerReview.filedToast"),
            "success",
          );
        },
        onError: failed,
      },
    );
  };

  const withdraw = () => {
    withdrawReview.mutate(undefined, {
      onSuccess: () => {
        setIsWithdrawing(false);
        showToast(
          t("communities:detail.dangerZone.ownerReview.withdrawnToast"),
          "success",
        );
      },
      onError: failed,
    });
  };

  return (
    <>
      {state.request ? (
        <CommunityOwnerReviewNotice
          request={state.request}
          isOwner={isOwner}
          action={
            state.canWithdraw ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsWithdrawing(true)}
              >
                {t("communities:detail.dangerZone.ownerReview.withdrawCta")}
              </Button>
            ) : undefined
          }
        />
      ) : state.needsOwnerReviewAt ? (
        <CommunityOwnerReviewFlagNotice />
      ) : state.canOpen ? (
        <div className={styles.row}>
          <div className={styles.rowLabel}>
            {t("communities:detail.dangerZone.ownerReview.label")}
          </div>
          <p className={styles.rowText}>
            {t("communities:detail.dangerZone.ownerReview.text")}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setIsFiling(true)}>
            {t("communities:detail.dangerZone.ownerReview.cta")}
          </Button>
        </div>
      ) : null}

      {isFiling && (
        <ConfirmDialog
          open
          loading={openReview.isPending}
          title={t("communities:detail.dangerZone.ownerReview.confirm.title")}
          description={t(
            "communities:detail.dangerZone.ownerReview.confirm.body",
          )}
          confirmLabel={t(
            "communities:detail.dangerZone.ownerReview.confirm.confirmCta",
          )}
          reason={{
            value: reason,
            onChange: setReason,
            required: true,
            maxLength: OWNER_REVIEW_REASON_MAX,
            label: t(
              "communities:detail.dangerZone.ownerReview.confirm.reasonLabel",
            ),
            placeholder: t(
              "communities:detail.dangerZone.ownerReview.confirm.reasonPlaceholder",
            ),
          }}
          onClose={() => setIsFiling(false)}
          onConfirm={submit}
        >
          <p className={styles.rowText}>
            {t("communities:detail.dangerZone.ownerReview.confirm.minHint", {
              min: fmt.number(OWNER_REVIEW_REASON_MIN),
            })}
          </p>
        </ConfirmDialog>
      )}

      {isWithdrawing && (
        <ConfirmDialog
          open
          loading={withdrawReview.isPending}
          title={t("communities:detail.dangerZone.ownerReview.withdraw.title")}
          description={t(
            "communities:detail.dangerZone.ownerReview.withdraw.body",
          )}
          confirmLabel={t(
            "communities:detail.dangerZone.ownerReview.withdraw.confirmCta",
          )}
          onClose={() => setIsWithdrawing(false)}
          onConfirm={withdraw}
        />
      )}
    </>
  );
}
