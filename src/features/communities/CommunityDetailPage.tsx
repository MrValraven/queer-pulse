import { Navigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { JoinModal } from "./JoinModal";
import { EditCommunityModal } from "./EditCommunityModal";
import { LeaveCommunityModal } from "./LeaveCommunityModal";
import { CommunityDetailHero } from "./CommunityDetailHero";
import { CommunityFrozenBanner } from "./CommunityFrozenBanner";
import { LivingHubTabs } from "./LivingHubTabs";
import { FallbackHubTabs } from "./FallbackHubTabs";
import { CommunitySidebar } from "./CommunitySidebar";
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
              action={{ label: t("common:error.retry"), onClick: state.refetch }}
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
    leaveMutation,
    joining,
    setJoining,
    editing,
    setEditing,
    confirmingLeave,
    setConfirmingLeave,
  } = state;

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
          {living?.frozen && slug && (
            <CommunityFrozenBanner slug={slug} canManage={canEdit} />
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
