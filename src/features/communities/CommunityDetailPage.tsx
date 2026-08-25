import { Navigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { JoinModal } from "./JoinModal";
import { EditCommunityModal } from "./EditCommunityModal";
import { LeaveCommunityModal } from "./LeaveCommunityModal";
import { CommunityDetailHero } from "./CommunityDetailHero";
import { CommunityFrozenBanner } from "./CommunityFrozenBanner";
import { CommunityRulesUpdateNotice } from "./CommunityRulesUpdateNotice";
import { LivingHubTabs } from "./LivingHubTabs";
import { FallbackHubTabs } from "./FallbackHubTabs";
import { CommunitySidebar } from "./CommunitySidebar";
import { SimilarCommunitiesSection } from "./SimilarCommunitiesSection";
import { useCommunityDetailState } from "./useCommunityDetailState";
import styles from "./CommunityDetailPage.module.css";

export function CommunityDetailPage() {
  const { t } = useTranslation();
  const state = useCommunityDetailState();

  if (state.status === "notFound") {
    return <Navigate to={routes.communities} replace />;
  }
  if (state.status === "error") {
    return (
      <PageShell>
        <div className={styles.body}>
          <div className="wrap">
            <EmptyState
              icon={<FiAlertTriangle />}
              title={t("common:error.title")}
              description={t("common:error.description")}
              action={{
                label: t("common:error.retry"),
                onClick: state.refetch,
              }}
            />
          </div>
        </div>
      </PageShell>
    );
  }
  if (state.status === "loading") {
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

  const {
    slug,
    community,
    cardStats,
    detail,
    editable,
    living,
    discussionThreads,
    joined,
    requested,
    role,
    canEdit,
    tier,
    joinLabel,
    memberNum,
    hasCount,
    members,
    heroAvatars,
    saved,
    onToggleSave,
    onShare,
    onJoined,
    onRequested,
    performLeave,
    posts,
    discussionPaging,
    rosterResult,
    related,
    communityPulse,
    leaveMutation,
    joining,
    setJoining,
    editing,
    setEditing,
    confirmingLeave,
    setConfirmingLeave,
  } = state;

  // Rendered only from the loaded branch: the not-found / error / loading
  // returns above bail out before this, so the tab title is never a community
  // called "" — those states keep the neutral brand default from index.html.
  // The community's own tagline, and its cover when it has one. Both are
  // omitted rather than sent empty, so PageMeta falls back to the neutral
  // brand description / default social image instead of a blank card.
  const metaDescription = community.description.trim();
  const coverImageUrl = community.coverImageUrl ?? "";

  return (
    <PageShell>
      <PageMeta
        title={t("communities:seo.detail.title", { name: community.name })}
        {...(metaDescription ? { description: metaDescription } : {})}
        {...(coverImageUrl
          ? {
              image: coverImageUrl,
              imageAlt: t("communities:seo.detail.imageAlt", {
                name: community.name,
              }),
            }
          : {})}
      />
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
          {(living?.frozen || detail.frozen) && slug && (
            <CommunityFrozenBanner slug={slug} canManage={canEdit} />
          )}
          {/* An owner edited the house rules since this member agreed to them.
              In-page and dismissible on purpose: reading the community is
              never blocked behind re-agreeing. */}
          {slug && (
            <CommunityRulesUpdateNotice
              slug={slug}
              name={community.name}
              isMember={joined}
            />
          )}
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
                communityPulse={communityPulse}
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
                canModerate={canEdit}
                discussionPaging={discussionPaging}
              />
            )}

            <CommunitySidebar
              detail={detail}
              related={related}
              communityPulse={communityPulse}
            />
          </div>

          {slug && <SimilarCommunitiesSection currentSlug={slug} />}
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
            // Lets the wizard read this community's house rules + their
            // current version for the rules step.
            slug,
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
          canChangeAccess={role === "owner"}
          previewStats={cardStats}
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
