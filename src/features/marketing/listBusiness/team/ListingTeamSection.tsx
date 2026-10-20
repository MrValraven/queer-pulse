import { useRef, useState, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { FiInfo } from "react-icons/fi";
import {
  Collapse,
  ConfirmDialog,
  LoadErrorState,
  SkeletonLine,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { normalizeRoleLabel } from "../api/listingTeam.adapters";
import type { ListingTeamManagerRowView } from "../api/listingTeam.types";
import type { ManagedListingDTO } from "../api/listings.api";
import { useListingTeam } from "../api/useListingTeam";
import { useListingTeamMutations } from "../api/useListingTeamMutations";
import { isListingTeamOpen } from "./listingTeamSection.data";
import { ListingTeamAcceptedList } from "./ListingTeamAcceptedList";
import { ListingTeamInvitePicker } from "./ListingTeamInvitePicker";
import { ListingTeamPendingRow } from "./ListingTeamPendingRow";
import { useListingTeamAnswers } from "./useListingTeamAnswers";
import styles from "./ListingTeam.module.css";

type HeadingRef = RefObject<HTMLHeadingElement | null>;

const REQUESTS_HEADING_ID = "listing-team-requests-heading";
const INVITES_HEADING_ID = "listing-team-invites-heading";

/** Focus went with a row that left: nowhere, detached, inert or in a dialog. */
function isFocusLost(): boolean {
  const active = document.activeElement;
  return (
    !(active instanceof HTMLElement) ||
    active === document.body ||
    !active.isConnected ||
    active.closest("[inert], [role='dialog'], [role='alertdialog']") !== null
  );
}

/**
 * "Team" inside the listing editor: personas asking to join, invites sent and
 * the people shown on the page, in page order. Every answer takes effect when
 * pressed, so nothing here waits on the save bar.
 */
export function ListingTeamSection({
  listing,
}: {
  listing: ManagedListingDTO;
}) {
  const { t } = useTranslation();
  const { team, isLoading, isError, refetch } = useListingTeam(listing.ref);
  const mutations = useListingTeamMutations(listing.ref);
  const { busyMemberId, errorByMemberId, answer } = useListingTeamAnswers();
  const [removeTarget, setRemoveTarget] =
    useState<ListingTeamManagerRowView | null>(null);
  const requestsHeadingRef = useRef<HTMLHeadingElement>(null);
  const invitesHeadingRef = useRef<HTMLHeadingElement>(null);
  const acceptedHeadingRef = useRef<HTMLHeadingElement>(null);
  const isOpen = isListingTeamOpen(listing);
  const isBusy = busyMemberId !== null;

  // A list that folded away takes its heading with it; the members heading
  // is always on the page, so focus lands there.
  const keepFocusInSection = (headingRef: HeadingRef) => {
    if (!isFocusLost()) return;
    const heading = headingRef.current;
    const isHeadingShown =
      heading !== null &&
      heading.isConnected &&
      heading.closest("[inert]") === null;
    (isHeadingShown ? heading : acceptedHeadingRef.current)?.focus();
  };

  const renderPending = (
    row: ListingTeamManagerRowView,
    kind: "request" | "invite",
  ) => (
    <ListingTeamPendingRow
      key={row.id}
      row={row}
      kind={kind}
      isBusy={isBusy}
      isRowBusy={busyMemberId === row.id}
      isApproveBlocked={!isOpen}
      errorMessage={errorByMemberId[row.id]}
      onApprove={(roleLabel) =>
        void answer(
          row.id,
          () =>
            mutations.approve.mutateAsync({
              memberId: row.id,
              roleLabel: normalizeRoleLabel(roleLabel),
            }),
          "added",
        )
      }
      onDecline={() =>
        void answer(
          row.id,
          () => mutations.decline.mutateAsync({ memberId: row.id }),
          "declined",
        )
      }
      onCancel={() =>
        void answer(
          row.id,
          () => mutations.cancelInvite.mutateAsync({ memberId: row.id }),
          "cancelled",
        )
      }
    />
  );

  // The dialog stays open with its spinner while the removal runs.
  const confirmRemoval = async () => {
    const target = removeTarget;
    if (!target || isBusy) return;
    await answer(
      target.id,
      () => mutations.remove.mutateAsync({ memberId: target.id }),
      "removed",
    );
    setRemoveTarget(null);
  };

  let body;
  if (isLoading) {
    body = <SkeletonLine width="100%" height={56} />;
  } else if (isError || !team) {
    body = <LoadErrorState compact onRetry={refetch} />;
  } else {
    body = (
      <>
        {/* Only the heading folds: each list and its row presence stay
            mounted, so the last row's exit still hands focus on. */}
        <Collapse isOpen={team.requestsReceived.length > 0}>
          <h3
            ref={requestsHeadingRef}
            id={REQUESTS_HEADING_ID}
            className={styles.heading}
            tabIndex={-1}
          >
            {t("marketing:listBusiness.team.requests.heading")}
          </h3>
        </Collapse>
        <ul className={styles.list} aria-labelledby={REQUESTS_HEADING_ID}>
          <AnimatePresence
            initial={false}
            onExitComplete={() => keepFocusInSection(requestsHeadingRef)}
          >
            {team.requestsReceived.map((row) => renderPending(row, "request"))}
          </AnimatePresence>
        </ul>
        <Collapse isOpen={team.invitesSent.length > 0}>
          <h3
            ref={invitesHeadingRef}
            id={INVITES_HEADING_ID}
            className={styles.heading}
            tabIndex={-1}
          >
            {t("marketing:listBusiness.team.invites.heading")}
          </h3>
        </Collapse>
        <ul className={styles.list} aria-labelledby={INVITES_HEADING_ID}>
          <AnimatePresence
            initial={false}
            onExitComplete={() => keepFocusInSection(invitesHeadingRef)}
          >
            {team.invitesSent.map((row) => renderPending(row, "invite"))}
          </AnimatePresence>
        </ul>
        <ListingTeamAcceptedList
          rows={team.accepted}
          busyMemberId={busyMemberId}
          errorByMemberId={errorByMemberId}
          headingRef={acceptedHeadingRef}
          onRowExitComplete={() => keepFocusInSection(acceptedHeadingRef)}
          onReorder={(memberId, memberIds) =>
            answer(memberId, () => mutations.reorder.mutateAsync({ memberIds }))
          }
          onSaveRole={(memberId, roleLabel) =>
            answer(
              memberId,
              () =>
                mutations.updateRoleLabel.mutateAsync({
                  memberId,
                  roleLabel: normalizeRoleLabel(roleLabel),
                }),
              "roleSaved",
            )
          }
          onRemove={setRemoveTarget}
        />
      </>
    );
  }

  return (
    <div className={styles.section}>
      <p className={styles.intro}>{t("marketing:listBusiness.team.intro")}</p>
      <Collapse isOpen={!isOpen}>
        <p className={styles.notice} role="status">
          <FiInfo aria-hidden />
          <span>{t("marketing:listBusiness.team.notLiveNotice")}</span>
        </p>
      </Collapse>
      <ListingTeamInvitePicker
        listingRef={listing.ref}
        isListingOpen={isOpen}
      />
      {body}
      <AnimatePresence
        onExitComplete={() => keepFocusInSection(acceptedHeadingRef)}
      >
        {removeTarget && (
          <ConfirmDialog
            key={removeTarget.id}
            open
            tone="destructive"
            loading={busyMemberId === removeTarget.id}
            title={
              removeTarget.persona
                ? t("marketing:listBusiness.team.removeConfirm.title", {
                    name: removeTarget.persona.titleName,
                  })
                : t("marketing:listBusiness.team.removeConfirm.titleHidden")
            }
            description={t("marketing:listBusiness.team.removeConfirm.body")}
            confirmLabel={t("marketing:listBusiness.team.removeCta")}
            onClose={() => setRemoveTarget(null)}
            onConfirm={() => void confirmRemoval()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
