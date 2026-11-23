import { useEffect, useRef, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { logError } from "../../shared/observability/logger";
import { AccountDependencyGate } from "../settings/AccountDependencyGate";
import type { DeletionRequest } from "../settings/api/account.api";
import {
  accountStepUpErrorCopy,
  cancelDeletionErrorCopy,
} from "../settings/settingsActionErrors";
import {
  useCancelDeletion,
  useDeactivate,
  useGetDeletionRequest,
  useReauth,
  useRequestDeletion,
} from "../settings/api/useAccountMutations";
import { useAccountDependencies } from "./api/useAccountDependencies";
import { StepAwayDialogs, type ConfirmKind } from "./StepAwayDialogs";
import styles from "./AccountData.module.css";

/** Already-pending deletion request banner, shown ahead of the step-away
 *  actions. Mirrors `DeleteAccountSections`' `DeletePendingBanner`. */
function PendingDeletionBanner({
  request,
  onCancel,
  cancelling,
}: {
  request: DeletionRequest;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const when = fmt.date(new Date(request.scheduledErasureAt), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className={styles.pendingBanner}>
      <FiAlertCircle className={styles.pendingBannerIcon} aria-hidden="true" />
      <div>
        <p className={styles.body}>
          <Translation
            i18nKey="members:profile.accountData.stepAway.pending.banner"
            components={{ strong: <strong /> }}
            values={{ date: when }}
          />
        </p>
        <Button variant="primary" onClick={onCancel} disabled={cancelling}>
          {cancelling
            ? t("members:profile.accountData.stepAway.pending.cancelling")
            : t("members:profile.accountData.stepAway.pending.cancelCta")}
        </Button>
      </div>
    </div>
  );
}

/**
 * "Hide me" (deactivate, reversible) / "Erase me" (deletion-request).
 * Each action sits behind a `ConfirmDialog`. "Erase me" waits only for the
 * dependency check's first answer. Above it, the shared
 * `AccountDependencyGate` lists what erasure hands on: owned communities with
 * an optional ownership offer (the backend passes each one on at erasure) and
 * live listings with an optional delete (erasure keeps them live).
 */
export function AccountDataStepAway({ ownerSlug }: { ownerSlug: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const { getReauthToken, beginReauth } = useReauth();
  const deactivate = useDeactivate();
  const requestDeletion = useRequestDeletion();
  const cancelDeletion = useCancelDeletion();
  const getDeletionRequest = useGetDeletionRequest();
  const dependencies = useAccountDependencies();
  // Where focus lands after the gate deletes its last listing and unmounts.
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<DeletionRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // On mount, surface any already-pending deletion request ahead of the
  // step-away actions. Mirrors `DeleteAccountSection`'s equivalent check.
  useEffect(() => {
    let active = true;
    getDeletionRequest()
      .then((request) => active && setPending(request))
      .catch((err) =>
        logError(err, { where: "AccountDataStepAway.getDeletionRequest" }),
      );
    return () => {
      active = false;
    };
  }, [getDeletionRequest]);

  // Fail closed: while dependencies are still loading, hold "erase", so it is
  // never offered before the member can see what it hands on.
  const eraseBlocked = dependencies.isLoading;

  async function handleCancelPending() {
    setCancelling(true);
    try {
      await cancelDeletion();
      setPending(null);
      showToast(
        t("members:profile.accountData.stepAway.pending.cancelledToast"),
        "success",
      );
    } catch (err) {
      logError(err, { where: "AccountDataStepAway.cancel" });
      const cause = cancelDeletionErrorCopy(err);
      showToast(t(cause.key, cause.values), "error");
    } finally {
      setCancelling(false);
    }
  }

  // No password is collected or sent: there is nothing to verify one
  // against. The real step-up is the code dialog (`beginReauth`, see
  // `useReauthToken.ts`): if no fresh token is cached yet, this closes the
  // typed `ConfirmDialog` so it does not sit under the code dialog, opens the
  // code dialog, and stops with no toast. The member presses Hide or Erase
  // again once the code is accepted. The typed `ConfirmDialog` is a separate,
  // real, checked gate on top of that.
  async function handleConfirm() {
    if (!confirmKind) return;
    const reauthToken = getReauthToken();
    if (!reauthToken) {
      setConfirmKind(null);
      beginReauth();
      return;
    }
    setSubmitting(true);
    try {
      if (confirmKind === "erase") {
        const request = await requestDeletion(
          reauthToken,
          reason.trim() || undefined,
        );
        setPending(request);
      } else {
        await deactivate(reauthToken);
      }
      setConfirmKind(null);
      setReason("");
      signOut();
    } catch (err) {
      logError(err, {
        where: "AccountDataStepAway.confirm",
        kind: confirmKind,
      });
      const cause = accountStepUpErrorCopy(err);
      showToast(t(cause.key, cause.values), "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (pending && pending.status !== "erased") {
    return (
      <section className={styles.section}>
        <h3 className={styles.heading}>
          {t("members:profile.accountData.stepAway.title")}
        </h3>
        <PendingDeletionBanner
          request={pending}
          onCancel={() => void handleCancelPending()}
          cancelling={cancelling}
        />
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.heading} ref={headingRef} tabIndex={-1}>
        {t("members:profile.accountData.stepAway.title")}
      </h3>

      <div className={styles.block}>
        <h4 className={styles.subheading}>
          {t("members:profile.accountData.stepAway.hide.title")}
        </h4>
        <p className={styles.body}>
          {t("members:profile.accountData.stepAway.hide.body")}
        </p>
        <Button variant="ghost" onClick={() => setConfirmKind("hide")}>
          {t("members:profile.accountData.stepAway.hide.cta")}
        </Button>
      </div>

      <div className={styles.block}>
        <h4 className={styles.subheading}>
          {t("members:profile.accountData.stepAway.erase.title")}
        </h4>
        <p className={styles.body}>
          {t("members:profile.accountData.stepAway.erase.body")}
        </p>

        <AccountDependencyGate
          communities={dependencies.communities}
          listings={dependencies.listings}
          fallbackFocusRef={headingRef}
        />

        <Button
          variant="danger"
          onClick={() => setConfirmKind("erase")}
          disabled={eraseBlocked}
        >
          {t("members:profile.accountData.stepAway.erase.cta")}
        </Button>
        {eraseBlocked && (
          <p className={styles.hint} role="status">
            {t("members:profile.accountData.stepAway.erase.disabledHint")}
          </p>
        )}
      </div>

      <StepAwayDialogs
        confirmKind={confirmKind}
        onCancel={() => {
          setConfirmKind(null);
          setReason("");
        }}
        onConfirm={() => void handleConfirm()}
        isSubmitting={submitting}
        reason={reason}
        onReasonChange={setReason}
        ownerSlug={ownerSlug}
      />
    </section>
  );
}
