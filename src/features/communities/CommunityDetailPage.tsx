import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { JoinModal } from "./JoinModal";
import { EditCommunityModal } from "./EditCommunityModal";
import { LeaveCommunityModal } from "./LeaveCommunityModal";
import type { Person } from "./communityDetails";
import { useCommunity } from "./api/useCommunity";
import { useRelatedCommunities } from "./api/useRelatedCommunities";
import { useRoster } from "./api/useRoster";
import { useCommunityPosts } from "./api/useCommunityPosts";
import { useCommunityDiscussions } from "./api/useCommunityDiscussions";
import { useJoinCommunity, useRemoveMember } from "./api/useCommunityMutations";
import { CommunityDetailHero } from "./CommunityDetailHero";
import { LivingHubTabs } from "./LivingHubTabs";
import { FallbackHubTabs } from "./FallbackHubTabs";
import { CommunitySidebar } from "./CommunitySidebar";
import styles from "./CommunityDetailPage.module.css";

export function CommunityDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isSaved, toggleSave } = useSaved();
  const { isMember, join, leave, hasRequested, requestToJoin, roleIn } =
    useCommunityMembership();
  const [joining, setJoining] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const {
    community,
    detail,
    living: baseLiving,
    myRole,
    myJoinRequestStatus,
    editable,
    notFound,
    isLoading,
    isError,
    refetch,
  } = useCommunity(slug);
  const rosterResult = useRoster(slug);
  const roster = rosterResult.roster;
  const posts = useCommunityPosts(slug);
  const { threads, paging: discussionPaging } = useCommunityDiscussions(slug);
  const joinMutation = useJoinCommunity(slug ?? "");
  // Self-leave reuses the member-removal mutation with the viewer's own slug —
  // it hits the same DELETE /communities/:slug/members/:memberSlug the backend
  // treats as "leave the community yourself" (P1-11).
  const leaveMutation = useRemoveMember(slug ?? "");
  const related = useRelatedCommunities(slug, community?.type);

  if (notFound) return <Navigate to={routes.communities} replace />;
  // A non-404 failure must render a retryable error state, not an eternal
  // skeleton (P1-14). Demo mode never errors (no live query runs).
  if (isError) {
    return (
      <PageShell>
        <div className={styles.body}>
          <div className="wrap">
            <EmptyState
              icon={<FiAlertTriangle />}
              title={t("common:error.title")}
              description={t("common:error.description")}
              action={{ label: t("common:error.retry"), onClick: refetch }}
            />
          </div>
        </div>
      </PageShell>
    );
  }
  if (isLoading || !community || !detail) {
    return (
      <PageShell>
        <div className={styles.body}>
          <div className="wrap" aria-busy="true">
            <SkeletonLine width="40%" height={30} />
            <SkeletonLine width="70%" height={16} style={{ marginTop: 16 }} />
            <SkeletonLine width="55%" height={16} style={{ marginTop: 10 }} />
          </div>
        </div>
      </PageShell>
    );
  }

  // Compose the enriched hub: roster + posts arrive from their own endpoints
  // (in demo they equal `baseLiving`'s, keeping this byte-for-byte).
  const living = baseLiving
    ? { ...baseLiving, roster, pinned: posts.pinned, pulse: posts.pulse }
    : undefined;

  // Discussion threads: real `community_post` data is the source of truth,
  // but non-flagship demo communities have no living/mock posts seeded, so
  // `useCommunityDiscussions` returns empty and the tab would show an
  // EmptyState where the synthetic thread used to render. In demo mode only,
  // fall back to the synthetic `detail.topicThread` when there are no real
  // threads. Live mode always uses the real threads — an empty state there
  // is intentional.
  const discussionThreads =
    demoMode && threads.length === 0 && detail.topicThread
      ? [detail.topicThread]
      : threads;

  // Membership CTA state: the session provider is the demo source of truth;
  // live mode reads the viewer's role/request straight off the detail DTO.
  const joined = demoMode ? (slug ? isMember(slug) : false) : myRole != null;
  const requested = demoMode
    ? slug
      ? hasRequested(slug)
      : false
    : myJoinRequestStatus === "pending";
  const role = demoMode ? (slug ? roleIn(slug) : null) : myRole;
  const canEdit = role === "owner" || role === "mod";

  const tier =
    living?.accessTier ?? (community.privateBadge ? "private" : "public");
  const joinLabel =
    tier === "invite"
      ? t("communities:detail.join.invite")
      : tier === "public"
        ? t("communities:detail.join.public")
        : t("communities:detail.join.request");

  const memberNum = parseInt(community.count, 10);
  const hasCount = !Number.isNaN(memberNum);
  // The real roster: live mode fetches it, flagship demo communities supply it,
  // and a just-founded community has only its founder — so fall back to the
  // organiser rather than fabricating a crowd that isn't there.
  const members: Person[] = roster.length > 0 ? roster : [detail.organiser];
  const heroAvatars = members.slice(0, 5);

  // Bookmark this community via the backend-wired SavedProvider (kind "group") —
  // independent of membership: you can save a community to revisit without
  // joining it.
  const savedId = `group:${slug}`;
  const saved = isSaved(savedId);
  const onToggleSave = () => {
    const nowSaved = toggleSave({
      id: savedId,
      kind: "group",
      title: community.name,
      href: `/community/${slug}`,
      meta: community.count,
      description: community.description,
    });
    showToast(
      t(
        nowSaved
          ? "communities:detail.save.savedToast"
          : "communities:detail.save.removedToast",
      ),
      "success",
    );
  };

  const onJoined = () => {
    if (slug) join(slug);
    joinMutation.mutate({});
  };
  const onRequested = () => {
    if (slug) requestToJoin(slug);
    joinMutation.mutate({});
  };
  // Leave: demo drives the session provider (unchanged); live fires the real
  // DELETE with the viewer's own slug, then invalidates so the CTA flips back to
  // "Join". On failure the mutation's global error handler surfaces the reason —
  // membership is never optimistically dropped, so there's no false success.
  // Only ever reached after the member confirms in LeaveCommunityModal — leaving
  // is destructive, so it never fires straight off the "Joined" button.
  const performLeave = () => {
    setConfirmingLeave(false);
    if (!slug) return;
    if (demoMode) {
      leave(slug);
      return;
    }
    const mySlug = user?.profile.slug;
    if (!mySlug) {
      showToast(t("communities:common.error"), "error");
      return;
    }
    leaveMutation.mutate(mySlug);
  };

  // Share this community: the native share sheet on devices that support it
  // (mobile), else copy the link to the clipboard and confirm with a toast.
  const onShare = async () => {
    const url = `${window.location.origin}/community/${slug}`;
    const shareData = {
      title: community.name,
      text: community.description,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // The member dismissed the share sheet — not an error, stay silent.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast(t("communities:detail.share.copiedToast"), "success");
    } catch {
      showToast(t("communities:common.error"), "error");
    }
  };

  return (
    <PageShell>
      <CommunityDetailHero
        community={community}
        detail={detail}
        joined={joined}
        requested={requested}
        joinLabel={joinLabel}
        canEdit={canEdit}
        heroAvatars={heroAvatars}
        memberNum={memberNum}
        hasCount={hasCount}
        saved={saved}
        onToggleSave={onToggleSave}
        onShare={() => {
          void onShare();
        }}
        onJoin={() => setJoining(true)}
        onLeave={() => setConfirmingLeave(true)}
        onEdit={() => setEditing(true)}
      />

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            {living ? (
              <LivingHubTabs
                community={community}
                info={detail}
                living={living}
                threads={discussionThreads}
                slug={living.slug}
                isMember={joined}
                role={role}
                pulsePaging={posts}
                discussionPaging={discussionPaging}
                rosterPaging={rosterResult}
              />
            ) : (
              <FallbackHubTabs
                detail={detail}
                members={members}
                hasCount={hasCount}
                memberNum={memberNum}
                threads={discussionThreads}
                slug={slug ?? ""}
                isMember={joined}
                discussionPaging={discussionPaging}
              />
            )}

            <CommunitySidebar detail={detail} related={related} />
          </div>
        </div>
      </div>

      {joining && (
        <JoinModal
          community={{
            name: community.name,
            typeLabel: detail.badge,
            count: community.count,
            description: community.description,
            tags: detail.tags,
          }}
          tier={tier}
          onClose={() => setJoining(false)}
          onJoined={onJoined}
          onRequested={onRequested}
        />
      )}

      {editing && slug && editable && (
        <EditCommunityModal
          slug={slug}
          editable={editable}
          onClose={() => setEditing(false)}
        />
      )}

      {confirmingLeave && (
        <LeaveCommunityModal
          name={community.name}
          pending={leaveMutation.isPending}
          onConfirm={performLeave}
          onClose={() => setConfirmingLeave(false)}
        />
      )}
    </PageShell>
  );
}
