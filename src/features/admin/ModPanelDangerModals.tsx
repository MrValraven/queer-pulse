import { useState } from "react";
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  Eyebrow,
  LoadErrorState,
  Modal,
  SkeletonLine,
  Spinner,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { memberRefDisplayName } from "../../shared/api/refs";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useArchiveCommunity } from "../communities/api/useCommunityMutations";
import {
  useCancelCommunityOwnershipOffer,
  useCommunityOwnershipOffer,
  useOfferCommunityOwnership,
} from "../communities/api/useCommunityOwnershipOffers";
import { useRoster } from "../communities/api/useRoster";
import type { RosterMember } from "../communities/community.model";
import {
  communityErrorText,
  OWNERSHIP_OFFER_OWNER_SIDE_KEYS,
} from "../communities/communityErrors";
import { photoOf } from "../communities/communityPeople";
import { RosterPickerSkeleton } from "../communities/RosterPickerSkeleton";
import styles from "./ModPanel.module.css";

/* -------------------------------------------------------------------------- */
/* ArchiveConfirmModal                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Confirms an irreversible community archive before it fires. Live: POSTs
 * `/communities/:slug/archive` (owner-only) via `useArchiveCommunity`, which
 * invalidates the detail + listings on success. Demo: the mutation is a no-op,
 * so this just confirms and toasts (the mock stays put).
 */
export function ArchiveConfirmModal({
  slug,
  onClose,
  onArchived,
}: {
  slug: string;
  onClose: () => void;
  onArchived?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const archiveCommunity = useArchiveCommunity();

  const confirm = () => {
    if (archiveCommunity.isPending) return;
    archiveCommunity.mutate(
      { slug },
      {
        onSuccess: () => {
          showToast(t("admin:modPanel.settings.archive.toast"), "success");
          onArchived?.();
          onClose();
        },
        onError: () =>
          showToast(t("admin:modPanel.settings.errorToast"), "error"),
      },
    );
  };

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={confirm}
      title={t("admin:modPanel.settings.archive.confirm.title")}
      tone="destructive"
      loading={archiveCommunity.isPending}
      confirmLabel={t("admin:modPanel.settings.archive.confirm.cta")}
      cancelLabel={t("admin:modPanel.settings.cancel")}
    >
      <Eyebrow>{t("admin:modPanel.settings.irreversible")}</Eyebrow>
      <p>{t("admin:modPanel.settings.archive.confirm.body")}</p>
    </ConfirmDialog>
  );
}

/* -------------------------------------------------------------------------- */
/* TransferOwnershipModal                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The owner's "hand this community on" step in the mod panel (PRD-514).
 * Ownership moves by offer: with no open offer the owner picks a roster member
 * and sends one (`POST /communities/:slug/ownership-offer`), and nothing moves
 * until that member accepts it from their inbox. With an offer already open
 * the dialog says who it went to and when it lapses, and its action cancels
 * it, since the backend keeps one open offer per community. Demo reads and
 * writes the same hooks' cached demo state. The export keeps its name so
 * `SettingsTab` mounts it unchanged.
 *
 * "Send offer" stays disabled until someone is picked, and a roster with
 * nobody else on it shows only its empty state and the close button, since
 * there is no offer to send.
 */
export function TransferOwnershipModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const rosterRead = useRoster(slug);
  // The picker waits for this read: an open offer turns the dialog into its
  // cancel step, and a send before the read lands could only be refused.
  const { offer, isLoading: isOfferLoading } = useCommunityOwnershipOffer(slug);
  const offerOwnership = useOfferCommunityOwnership(slug);
  const cancelOffer = useCancelCommunityOwnershipOffer(slug);
  const [selected, setSelected] = useState<string>("");
  const openOffer = offer?.status === "offered" ? offer : null;
  const isPending = offerOwnership.isPending || cancelOffer.isPending;

  const candidates = rosterRead.roster.filter(
    (member) => member.role !== "owner" && Boolean(member.slug),
  );
  const picked = candidates.find((member) => member.slug === selected);
  // A roster still loading, or one that failed, is never read as empty: only
  // a settled read with nobody else on it means there is no offer to send.
  // A failed next page leaves the loaded rows standing (the read is shared
  // with the Members tab), so only a failure with nothing loaded counts.
  const isRosterFailed = rosterRead.isError && rosterRead.roster.length === 0;
  const isRosterSettled = !rosterRead.isLoading && !isRosterFailed;
  const hasNobodyToOffer =
    !openOffer && isRosterSettled && candidates.length === 0;
  const showError = (error: Error) =>
    showToast(
      communityErrorText(t, error, OWNERSHIP_OFFER_OWNER_SIDE_KEYS),
      "error",
    );

  const send = () => {
    if (!picked?.slug) return;
    offerOwnership.mutate(
      {
        memberSlug: picked.slug,
        offeree: {
          slug: picked.slug,
          firstName: picked.name,
          lastName: "",
          avatarUrl: picked.avatarUrl ?? null,
        },
      },
      {
        onSuccess: (sent) => {
          showToast(
            t("communities:ownershipOffer.pending", {
              name: picked.name,
              date: fmt.date(new Date(sent.expiresAt)),
            }),
            "success",
          );
          onClose();
        },
        onError: showError,
      },
    );
  };

  const cancel = () =>
    cancelOffer.mutate(undefined, {
      onSuccess: () => {
        showToast(t("communities:ownershipOffer.cancelled"), "success");
        onClose();
      },
      onError: showError,
    });

  const isBusy = isPending || isOfferLoading;
  const confirm = () => {
    if (isBusy) return;
    if (openOffer) cancel();
    else send();
  };

  return (
    <Modal
      title={t("communities:ownershipOffer.title")}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            {t("admin:modPanel.settings.cancel")}
          </Button>
          {!hasNobodyToOffer && (openOffer || !isRosterFailed) && (
            <Button
              variant={openOffer ? "danger" : "primary"}
              onClick={confirm}
              disabled={isBusy || (!openOffer && !picked)}
              aria-busy={isPending || undefined}
            >
              {isPending && <Spinner />}
              {t(
                openOffer
                  ? "communities:ownershipOffer.cancel"
                  : "communities:ownershipOffer.send",
              )}
            </Button>
          )}
        </>
      }
    >
      <p>
        {openOffer
          ? t("communities:ownershipOffer.pending", {
              name:
                memberRefDisplayName(openOffer.offeree, t) ||
                t("communities:common.someMember"),
              date: fmt.date(new Date(openOffer.expiresAt)),
            })
          : t("communities:ownershipOffer.explainer")}
      </p>
      {isOfferLoading ? (
        <SkeletonLine width="60%" />
      ) : openOffer ? null : rosterRead.isLoading ? (
        <RosterPickerSkeleton />
      ) : isRosterFailed ? (
        <LoadErrorState
          compact
          onRetry={rosterRead.refetch}
          title={t("communities:ownershipOffer.rosterErrorTitle")}
          description={t("communities:ownershipOffer.rosterErrorBody")}
        />
      ) : (
        <OfferCandidateList
          candidates={candidates}
          selected={selected}
          onSelect={setSelected}
        />
      )}
    </Modal>
  );
}

/** The roster members the owner may offer the community to, as a radiogroup.
 *  Split out of `TransferOwnershipModal` to keep it under 200 lines. */
function OfferCandidateList({
  candidates,
  selected,
  onSelect,
}: {
  candidates: RosterMember[];
  selected: string;
  onSelect: (slug: string) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  if (candidates.length === 0) {
    return (
      <EmptyState
        compact
        title={t("admin:modPanel.settings.transfer.modal.emptyTitle")}
        description={t("admin:modPanel.settings.transfer.modal.emptyDesc")}
      />
    );
  }
  return (
    <div
      role="radiogroup"
      aria-label={t("admin:modPanel.settings.transfer.modal.pickLabel")}
    >
      {candidates.map((member) => (
        <label className={styles.modRow} key={member.slug}>
          <input
            type="radio"
            name="offer-owner"
            value={member.slug}
            checked={selected === member.slug}
            onChange={() => onSelect(member.slug ?? "")}
          />
          <Avatar
            initials={member.initials}
            tint={member.tint}
            src={photoOf(member, demoMode)}
            size={38}
            alt={member.name}
          />
          <div className={styles.modMain}>
            <div className={styles.modName}>{member.name}</div>
            {member.title && (
              <div className={styles.modMeta}>{member.title}</div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}
