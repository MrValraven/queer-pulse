import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useHousingGroup } from "./api/useHousingGroup";
import {
  useCanPostGroupListing,
  useMyGroupListings,
} from "./api/useMyGroupListings";
import { useWithdrawGroupListing } from "./api/useGroupListingOwnerActions";
import {
  GroupDetailHeader,
  GroupNorms,
  GroupListings,
  GroupListingsLocked,
} from "./HousingGroupDetailSections";
import { GroupEmptyState } from "./GroupEmptyState";
import { MyGroupListings } from "./MyGroupListings";
import { MyHousingJoinRequests } from "./MyHousingJoinRequests";
import { useMyGroupJoinRequests } from "./api/useMyHousingJoinRequests";
import { EditGroupListingModal } from "./EditGroupListingModal";
import { PostGroupRoomModal } from "./PostGroupRoomModal";
import { JoinGroupModal } from "./JoinGroupModal";
import type { MyGroupListing } from "./housingGroups.data";
import styles from "./HousingGroupsPage.module.css";

/** One vetted group: its norms, its public listings, the join-with-screening
 *  flow (P3.1/P3.3), and the member's own rooms here with the state each is
 *  actually in, plus the way in to post one (LOC-19). */
export function HousingGroupDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: group, isLoading } = useHousingGroup(slug);
  const canPost = useCanPostGroupListing();
  const { data: myListings, isLoading: isLoadingMine } =
    useMyGroupListings(slug);
  // PRD-242. Where the `housing_join_decided` bell row lands. The read is flat
  // across every group, so this page picks out its own row; a member who never
  // applied here has none and the section renders nothing.
  const { data: myJoinRequests, isLoading: isLoadingMyJoinRequests } =
    useMyGroupJoinRequests();
  const myJoinRequestsHere = (myJoinRequests ?? []).filter(
    (request) => request.slug === slug,
  );
  const [isJoining, setIsJoining] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [editingListing, setEditingListing] = useState<MyGroupListing | null>(
    null,
  );
  const [withdrawingListing, setWithdrawingListing] =
    useState<MyGroupListing | null>(null);
  const withdrawListing = useWithdrawGroupListing(slug ?? "");

  function handleWithdraw() {
    if (!withdrawingListing) return;
    // The row stays on the page until the DELETE resolves. Success is the only
    // thing that removes it; a failure leaves the page exactly as it was.
    withdrawListing.mutate(withdrawingListing.id, {
      onSuccess: () => {
        setWithdrawingListing(null);
        showToast(t("economy:groupListing.toast.withdrawn"), "success");
      },
      onError: (error) => {
        setWithdrawingListing(null);
        showToast(
          describeError(
            t("economy:groupListing.toast.withdrawFailed"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
          "error",
        );
      },
    });
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className={`wrap ${styles.detailLoading}`} aria-busy="true">
          <div className={styles.cardSkeleton} />
        </div>
      </PageShell>
    );
  }

  if (!group) {
    return (
      <PageShell>
        <div className={`wrap ${styles.notFound}`}>
          <GroupEmptyState />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GroupDetailHeader group={group} onJoin={() => setIsJoining(true)} />
      {/* Held back until the read settles. Having applied here is the exception
          rather than the rule, so a skeleton on every group page would announce
          a section most readers will never have. */}
      {!isLoadingMyJoinRequests && (
        <MyHousingJoinRequests
          requests={myJoinRequestsHere}
          titleKey="economy:housingJoinRequests.group.title"
          titleEmKey="economy:housingJoinRequests.group.titleEm"
          subKey="economy:housingJoinRequests.group.sub"
        />
      )}
      <GroupNorms norms={group.norms} />
      {/* An access-gated group answers its rooms only to the people it has let
          in (ENG-172). `listingsGate` carries the reader's own standing, and
          `listings` is empty and meaningless whenever it is set, so the two
          are branched rather than merged: an empty grid here would read as a
          group with nothing in it. */}
      {group.listingsGate ? (
        <GroupListingsLocked
          membershipStanding={group.listingsGate.membershipStanding}
          onJoin={() => setIsJoining(true)}
        />
      ) : (
        <GroupListings listings={group.listings ?? []} />
      )}

      {canPost && (
        <MyGroupListings
          listings={myListings ?? []}
          isLoading={isLoadingMine}
          busyListingId={
            withdrawListing.isPending ? (withdrawingListing?.id ?? null) : null
          }
          onPost={() => setIsPosting(true)}
          onEdit={setEditingListing}
          onWithdraw={setWithdrawingListing}
        />
      )}

      {isJoining && (
        <JoinGroupModal group={group} onClose={() => setIsJoining(false)} />
      )}

      {isPosting && slug && (
        <PostGroupRoomModal
          groupSlug={slug}
          groupName={group.name}
          onClose={() => setIsPosting(false)}
        />
      )}

      {editingListing && slug && (
        <EditGroupListingModal
          groupSlug={slug}
          listing={editingListing}
          onClose={() => setEditingListing(null)}
        />
      )}

      <ConfirmDialog
        open={withdrawingListing !== null}
        onClose={() => setWithdrawingListing(null)}
        onConfirm={handleWithdraw}
        title={t("economy:groupListing.withdraw.confirmTitle")}
        description={t("economy:groupListing.withdraw.confirmBody", {
          title: withdrawingListing?.title ?? "",
        })}
        tone="destructive"
        loading={withdrawListing.isPending}
        confirmLabel={t("economy:groupListing.withdraw.confirmCta")}
      />
    </PageShell>
  );
}
