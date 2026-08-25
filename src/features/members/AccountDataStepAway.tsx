import { useEffect, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { useDirectoryListingsActions } from "../../app/providers/useDirectoryListingsActions";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { logError } from "../../shared/observability/logger";
import { useRoster } from "../communities/api/useRoster";
import { TransferOwnershipModal } from "../communities/TransferOwnershipModal";
import type { DeletionRequest } from "../settings/api/account.api";
import {
  useCancelDeletion,
  useDeactivate,
  useGetDeletionRequest,
  useReauth,
  useRequestDeletion,
} from "../settings/api/useAccountMutations";
import {
  useAccountDependencies,
  type AccountDependencyCommunity,
  type AccountDependencyListing,
} from "./api/useAccountDependencies";
import { StepAwayDialogs, type ConfirmKind } from "./StepAwayDialogs";
import styles from "./AccountData.module.css";

/** Already-pending deletion request banner, shown in place of the step-away
 *  actions — mirrors `DeleteAccountSections`' `DeletePendingBanner`. */
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

/** The owned-community / live-listing rows blocking "Erase me", each with its
 *  own real remedy — grouped separately so the main component stays under
 *  the file's line budget. */
function DependencyList({
  communities,
  listings,
}: {
  communities: AccountDependencyCommunity[];
  listings: AccountDependencyListing[];
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.block}>
      <p className={styles.dependencyIntro}>
        {t("members:profile.accountData.stepAway.erase.blockedByDependencies")}
      </p>
      {communities.length > 0 && (
        <ul className={styles.dependencyList}>
          {communities.map((community) => (
            <CommunityDependencyRow
              key={community.slug}
              community={community}
            />
          ))}
        </ul>
      )}
      {listings.length > 0 && (
        <ul className={styles.dependencyList}>
          {listings.map((listing) => (
            <ListingDependencyRow key={listing.ref} listing={listing} />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * One owned community blocking erasure. Its only out is a real ownership
 * transfer (`POST /communities/:slug/transfer`, the same
 * `TransferOwnershipModal` the community danger zone uses) — a community
 * requires an owner and there's no anonymous-owner state, so this is a real
 * precondition, not just informational copy. The roster only loads once the
 * modal is actually opened (`useRoster` is disabled until `slug` is set).
 */
function CommunityDependencyRow({
  community,
}: {
  community: AccountDependencyCommunity;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { roster } = useRoster(open ? community.slug : undefined);

  return (
    <>
      <li className={styles.dependencyRow}>
        <span>{community.name}</span>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          {t("members:profile.accountData.stepAway.dependency.transferCta")}
        </Button>
      </li>
      {open && (
        <TransferOwnershipModal
          slug={community.slug}
          name={community.name}
          roster={roster}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/**
 * One live listing blocking erasure. Unlike a community, a listing has NO
 * ownership-transfer capability on the backend — `ListingsController` exposes
 * create/update/withdraw only, never a transfer route — so the only available
 * action is "Close listing" (`DELETE /listings/:ref`, the same
 * `withdrawListing` mutator `PlacesSection`'s owner-delete button uses), not
 * "Transfer or close" as the source design's copy has it. This is a real,
 * permanent scope gap versus that design, not an oversight — flagged here for
 * the maintainer rather than silently downgraded.
 */
function ListingDependencyRow({
  listing,
}: {
  listing: AccountDependencyListing;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { withdrawListing } = useDirectoryListingsActions();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <li className={styles.dependencyRow}>
        <span>{listing.name}</span>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          {t("members:profile.accountData.stepAway.dependency.closeCta")}
        </Button>
      </li>
      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          withdrawListing(listing.ref);
          setConfirming(false);
          showToast(
            t("members:profile.accountData.stepAway.dependency.closedToast"),
            "info",
          );
        }}
        title={t(
          "members:profile.accountData.stepAway.dependency.closeConfirm.title",
          { name: listing.name },
        )}
        description={t(
          "members:profile.accountData.stepAway.dependency.closeConfirm.body",
        )}
        tone="destructive"
      />
    </>
  );
}

/**
 * "Hide me" (deactivate, reversible) / "Erase me" (deletion-request, gated).
 * Each action sits behind a `ConfirmDialog`. "Erase me" is DISABLED — not
 * hidden — while `useAccountDependencies` still reports any owned communities
 * or live listings, wired to that hook's live result (never a hardcoded
 * flag): a community can't exist without an owner, so this precondition is
 * real, and each dependency row below carries its own real remedy.
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

  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pending, setPending] = useState<DeletionRequest | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // On mount, surface any already-pending deletion request instead of the
  // step-away actions — mirrors `DeleteAccountSection`'s equivalent check.
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

  // Fail closed: while dependencies are still loading, treat "erase" as
  // blocked rather than briefly allowing it before the first fetch lands.
  const eraseBlocked = dependencies.isLoading || dependencies.hasDependencies;

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
      showToast(
        t("members:profile.accountData.stepAway.pending.cancelErrorToast"),
        "error",
      );
    } finally {
      setCancelling(false);
    }
  }

  // No password is collected or sent — auth is OAuth-only, so there is
  // nothing to verify one against. The real step-up is a Google OAuth round
  // trip (`beginReauth`, see `useReauthToken.ts`): if no fresh token is
  // cached yet, this redirects away instead of proceeding, and the member
  // presses confirm again after landing back. The typed `ConfirmDialog` is a
  // separate, real, checked gate on top of that.
  async function handleConfirm() {
    if (!confirmKind) return;
    const reauthToken = getReauthToken();
    if (!reauthToken) {
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
      showToast(
        t("members:profile.accountData.stepAway.toast.actionError"),
        "error",
      );
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
      <h3 className={styles.heading}>
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

        {dependencies.hasDependencies && (
          <DependencyList
            communities={dependencies.communities}
            listings={dependencies.listings}
          />
        )}

        <Button
          variant="danger"
          onClick={() => setConfirmKind("erase")}
          disabled={eraseBlocked}
        >
          {t("members:profile.accountData.stepAway.erase.cta")}
        </Button>
        {eraseBlocked && !dependencies.isLoading && (
          <p className={styles.hint}>
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
