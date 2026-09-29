import { useEffect, useState } from "react";
import { FiAlertTriangle, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { communityPath } from "../../app/routeMap";
import {
  Button,
  EmptyState,
  ImageSlot,
  Modal,
  SkeletonLine,
  Tag,
  TagRow,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useCommunityGateCard } from "./api/useCommunityGateCard";
import { useMyCommunityInvites } from "./api/useCommunityInvites";
import { shortTypeLabel } from "./api/communities.adapters";
import { COMMUNITY_TAG_LABEL_KEY } from "./communityTags.data";
import { CommunityJoinFlowModal } from "./CommunityJoinFlowModal";
import { GateAction } from "./CommunityGateAction";
import styles from "./CommunityGateModal.module.css";

/**
 * A closed community, seen from outside.
 *
 * Mounted over the discover grid by `CommunitiesHubPage` when the URL carries
 * `?gate=<slug>`, which is where `/community/:slug` redirects a viewer the
 * community has not let in. The hub never mounts for them, so this is not a
 * scrim over hidden content: there is nothing behind it to hide.
 *
 * What it may show is `CommunityGateCardDTO` and only that. No roster, no
 * owner, no post, no house rules: the rules reach an applicant inside the join
 * wizard. If a field you want is missing from that type, the answer is that
 * an outsider may not see it. The one thing the card knows about the viewer
 * is their own join request, so an applicant sees that they already asked and
 * can take the request back.
 */
export function CommunityGateModal({
  slug,
  onClose,
}: {
  slug: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const { card, isLoading, isError, notFound, refetch } =
    useCommunityGateCard(slug);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const navigate = useNavigate();

  // Gone, or private with no invitation. It disappears silently rather than
  // announcing that something was there, which is the same posture a private
  // community's detail already takes.
  useEffect(() => {
    if (notFound) onClose();
  }, [notFound, onClose]);

  // Every gated tier turns on whether an invitation exists, `request`
  // included. A viewer who HOLDS an invitation to a `request`-tier community
  // must be offered Accept, which spends the invitation and admits them, and
  // not "Ask to join", which files a request for a moderator to review
  // something they have already been granted. Shares its react-query cache
  // with the invitations shelf on the page underneath, so reading it for the
  // third tier costs no extra request.
  const shouldReadInvitations =
    card?.accessTier === "request" ||
    card?.accessTier === "invite" ||
    card?.accessTier === "private";
  const { invites, isLoading: isInvitesLoading } = useMyCommunityInvites({
    enabled: shouldReadInvitations,
  });
  const hasStandingInvitation = invites.some(
    (invite) => invite.community.slug === slug,
  );

  if (notFound) return null;

  // The error branch comes BEFORE the loading one, and the order is the whole
  // point: `useCommunityGateCard` returns `card: null` on failure, so a failed
  // fetch satisfies the `!card` guard below and would sit on the skeleton
  // forever, with the retry the viewer needs unreachable underneath it.
  if (isError) {
    return (
      <Modal title={t("communities:gate.eyebrow")} onClose={onClose}>
        <EmptyState
          icon={<FiAlertTriangle />}
          title={t("communities:gate.error.title")}
          description={t("communities:gate.error.description")}
          action={{ label: t("common:error.retry"), onClick: refetch }}
          compact
        />
      </Modal>
    );
  }

  // `!card` stays on this branch: it is what narrows `card` to non-null for
  // everything below.
  if (isLoading || !card) {
    return (
      <Modal title={t("communities:gate.eyebrow")} onClose={onClose}>
        <div aria-busy="true">
          <SkeletonLine width="60%" height={24} />
          <SkeletonLine width="90%" height={14} style={{ marginTop: 14 }} />
          <SkeletonLine width="75%" height={14} style={{ marginTop: 8 }} />
        </div>
      </Modal>
    );
  }

  // A private community's count is withheld the same way the discover grid
  // withholds it (see `cardDtoToCommunity`), so the gate and the grid never
  // say two different things about the same community.
  const memberCountLabel =
    card.accessTier === "private"
      ? t("communities:common.count.membersOnly")
      : t("communities:common.count.members", { count: card.memberCount });

  // A real join (the server answered `joined`, or demo admitted them) ends in
  // the community itself. Closing the welcome step takes the new member
  // inside, and the gate goes with the hub underneath it: a gate left open
  // over a community they just entered would still read as a closed door.
  // `replace` swaps out the `?gate=` entry, so Back skips the door too. The
  // join already invalidated `["community", slug]`, so the detail loads fresh
  // as a member.
  const closeWizard = () => {
    setIsJoining(false);
    if (hasJoined) void navigate(communityPath(card.slug), { replace: true });
  };

  const placeLabel = card.isOnline
    ? t("communities:gate.online")
    : [card.area, card.city].filter(Boolean).join(", ");

  return (
    <>
      <Modal
        eyebrow={t("communities:gate.eyebrow")}
        title={card.name}
        sub={card.tagline}
        onClose={onClose}
        footer={
          <Button variant="ghost" onClick={onClose}>
            {t("communities:gate.close")}
          </Button>
        }
      >
        {card.coverImageUrl && (
          <ImageSlot
            src={card.coverImageUrl}
            alt=""
            width="100%"
            height={140}
            shape="rounded"
            className={styles.cover}
          />
        )}

        <div className={styles.identity}>
          <ImageSlot
            src={card.avatarImageUrl ?? undefined}
            alt=""
            width={44}
            height={44}
            shape="rounded"
            initials={card.name.slice(0, 1)}
          />
          <ul className={styles.meta}>
            <li>{shortTypeLabel(card.type)}</li>
            <li>
              <FiUsers aria-hidden /> {memberCountLabel}
            </li>
            {placeLabel && <li>{placeLabel}</li>}
          </ul>
        </div>

        {card.languages.length > 0 && (
          <p className={styles.line}>
            <span className={styles.label}>
              {t("communities:gate.languages")}
            </span>{" "}
            {card.languages.join(", ")}
          </p>
        )}

        {card.purpose.trim() && (
          <section className={styles.section}>
            <h3 className={styles.heading}>{t("communities:gate.about")}</h3>
            <p className={styles.body}>{card.purpose}</p>
          </section>
        )}

        {card.tags.length > 0 && (
          <TagRow>
            {card.tags.map((tagId) => (
              <Tag key={tagId}>
                {COMMUNITY_TAG_LABEL_KEY[tagId]
                  ? t(COMMUNITY_TAG_LABEL_KEY[tagId])
                  : tagId}
              </Tag>
            ))}
          </TagRow>
        )}

        {card.nextGathering && (
          <section className={styles.section}>
            <h3 className={styles.heading}>
              {t("communities:gate.nextGathering")}
            </h3>
            <p className={styles.body}>
              {card.nextGathering.title}
              {", "}
              {format.date(new Date(card.nextGathering.startAt))}
            </p>
          </section>
        )}

        <GateAction
          accessTier={card.accessTier}
          communityName={card.name}
          slug={card.slug}
          joinRequestStatus={card.myJoinRequestStatus ?? null}
          hasStandingInvitation={hasStandingInvitation}
          isInvitesLoading={shouldReadInvitations && isInvitesLoading}
          isWizardOpen={isJoining}
          onAct={() => setIsJoining(true)}
        />
      </Modal>

      {isJoining && (
        <CommunityJoinFlowModal
          community={{
            slug: card.slug,
            name: card.name,
            typeLabel: shortTypeLabel(card.type),
            count: memberCountLabel,
            description: card.tagline,
            accessTier: card.accessTier,
          }}
          isInvited={hasStandingInvitation}
          onMembershipGranted={() => setHasJoined(true)}
          onClose={closeWizard}
        />
      )}
    </>
  );
}
