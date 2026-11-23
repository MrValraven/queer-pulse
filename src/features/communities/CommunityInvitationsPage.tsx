import { useState } from "react";
import { FiMail } from "react-icons/fi";
import { PageShell, PageHero } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import {
  EmptyState,
  HubBackLink,
  LoadErrorState,
  SkeletonCard,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  useDeclineCommunityInvite,
  useMyCommunityInvites,
} from "./api/useCommunityInvites";
import { CommunityInvitationRow } from "./CommunityInvitationRow";
import { CommunityOwnershipOffersSection } from "./CommunityOwnershipOffersSection";
import { useMyCommunityOwnershipOffers } from "./api/useCommunityOwnershipOffers";
import { DeclineInviteModal } from "./DeclineInviteModal";
import { communityErrorText } from "./communityErrors";
import styles from "./CommunityInvitations.module.css";

/**
 * The invitations shelf (PRD-140): every community that has asked this member
 * in, with the two answers on each.
 *
 * Its own page under `/communities/*` rather than a strip on the hub, and the
 * reason is what the list actually holds. A `private` community's card reaches
 * a non-member NOWHERE else in the app: the community 404s anybody who is not
 * on its roster, and until this endpoint existed an invitation to one lived
 * only in a bell that scrolled away. That makes this a standing, addressable
 * place a member can return to and a notification can point at, which a
 * section of somebody else's page is not.
 *
 * Demo mode has no invitation record, so the shelf reads empty there rather
 * than inventing invitations out of fixtures.
 *
 * The open ownership offers addressed to this member (PRD-514) sit above the
 * invitations: both are a community waiting on this member's answer, and an
 * ownership notification links here.
 */
export function CommunityInvitationsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { invites, isLoading, isError, refetch } = useMyCommunityInvites();
  // With offers above, the invitations get a heading of their own so the two
  // lists read as two sections.
  const { offers } = useMyCommunityOwnershipOffers();
  const declineMutation = useDeclineCommunityInvite();
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const declining = invites.find((invite) => invite.id === decliningId);

  const confirmDecline = () => {
    if (!declining) return;
    declineMutation.mutate(
      {
        inviteId: declining.id,
        communitySlug: declining.community.slug,
      },
      {
        onSuccess: () =>
          showToast(t("communities:detail.invite.declinedToast"), "success"),
        onError: (error) => showToast(communityErrorText(t, error), "error"),
        onSettled: () => setDecliningId(null),
      },
    );
  };

  return (
    <PageShell>
      <PageMeta title={t("communities:invites.title")} />
      <PageHero
        backLink={
          <HubBackLink
            to={routes.communities}
            label={t("communities:detail.breadcrumb")}
            tone="dark"
          />
        }
        eyebrow={t("communities:detail.breadcrumb")}
        title={t("communities:invites.title")}
        sub={t(
          offers.length > 0
            ? "communities:invites.introWithOffers"
            : "communities:invites.intro",
        )}
        compact
      />
      <div className={styles.body}>
        <div className="wrap">
          {/* PRD-514: open ownership offers come first, since they lapse. */}
          <CommunityOwnershipOffersSection />
          {offers.length > 0 && (
            <h2 className={styles.invitesTitle}>
              {t("communities:invites.listTitle")}
            </h2>
          )}
          {isLoading ? (
            <div className={styles.list} aria-busy="true">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : isError ? (
            <LoadErrorState onRetry={refetch} />
          ) : invites.length === 0 ? (
            <EmptyState
              icon={<FiMail />}
              title={t("communities:invites.empty.title")}
              description={t("communities:invites.empty.description")}
            />
          ) : (
            <ul className={styles.list}>
              {invites.map((invite) => (
                <CommunityInvitationRow
                  key={invite.id}
                  invite={invite}
                  isDeclining={
                    declineMutation.isPending && decliningId === invite.id
                  }
                  onDecline={() => setDecliningId(invite.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {declining && (
        <DeclineInviteModal
          name={declining.community.name}
          pending={declineMutation.isPending}
          onConfirm={confirmDecline}
          onClose={() => setDecliningId(null)}
        />
      )}
    </PageShell>
  );
}
