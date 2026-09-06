import { Navigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { CommunityDetailHero } from "./CommunityDetailHero";
import { CommunityDetailDialogs } from "./CommunityDetailDialogs";
import { CommunityFrozenBanner } from "./CommunityFrozenBanner";
import { CommunityRulesUpdateNotice } from "./CommunityRulesUpdateNotice";
import { CommunityHubLayout } from "./CommunityHubLayout";
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

  // Only what this LAYOUT renders. Everything the five dialogs need stays on
  // `state` and is handed to `CommunityDetailDialogs` whole.
  const {
    slug,
    community,
    detail,
    living,
    discussionThreads,
    joined,
    requested,
    role,
    canEdit,
    isInvited,
    isInviteOnlyLocked,
    canDeclineInvite,
    canWithdrawRequest,
    joinLabel,
    memberNum,
    hasCount,
    members,
    heroAvatars,
    avatarImageUrl,
    saved,
    onToggleSave,
    onShare,
    posts,
    discussionPaging,
    rosterResult,
    related,
    communityPulse,
    setJoining,
    setEditing,
    setConfirmingLeave,
    setConfirmingWithdraw,
    setDecliningInvite,
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
        avatarImageUrl={avatarImageUrl}
        joined={joined}
        requested={requested}
        isInvited={isInvited}
        isInviteOnlyLocked={isInviteOnlyLocked}
        canDeclineInvite={canDeclineInvite}
        canWithdrawRequest={canWithdrawRequest}
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
        // Accepting is the ordinary front door: the same wizard, so the house
        // rules are still read and agreed to on the way in. The backend
        // spends the invitation and admits them straight to the roster.
        onAcceptInvite={() => setJoining(true)}
        onDeclineInvite={() => setDecliningInvite(true)}
        onWithdrawRequest={() => setConfirmingWithdraw(true)}
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
          <CommunityHubLayout
            community={community}
            detail={detail}
            living={living}
            slug={slug}
            threads={discussionThreads}
            joined={joined}
            role={role}
            canEdit={canEdit}
            members={members}
            memberNum={memberNum}
            hasCount={hasCount}
            posts={posts}
            discussionPaging={discussionPaging}
            rosterResult={rosterResult}
            related={related}
            communityPulse={communityPulse}
          />

          {slug && <SimilarCommunitiesSection currentSlug={slug} />}
        </div>
      </div>

      <CommunityDetailDialogs state={state} />
    </PageShell>
  );
}
