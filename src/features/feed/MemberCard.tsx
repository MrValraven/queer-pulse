import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Avatar, Button } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useMemberContact } from "../connect/useMemberContact";
import { useSocial } from "../../app/providers/useSocial";
import { memberAvatar } from "../members/data/members";
import { tintForSlug } from "../../shared/api/refs";
import { initials, relativeTime } from "./api/feed.adapters";
import type { FeedItem } from "../../shared/contracts/contracts";
import { DEMO_MEMBER } from "./feedCards.data";
import {
  FeedActionLink,
  FeedActions,
  FeedCardHead,
  FeedCardShell,
  FeedIdentity,
  FeedProofStack,
  FeedQuote,
  FeedTagRow,
} from "./FeedCard";

/**
 * "New member" card for the feed's People tab. With no `item`, renders the
 * demo prototype's scripted `DEMO_MEMBER` (Kai Larsson) mock, including the
 * Follow affordance (demo-only: `useSocial().followEnabled` is false in live
 * — there's no member/author-level follow endpoint there). With a live
 * `FeedItem`, renders straight off its fields — pronouns/neighbourhood/
 * interest chips/common-communities the demo mock shows aren't part of the
 * aggregate, so they're simply omitted rather than guessed at.
 */
export function MemberCard({ item }: { item?: FeedItem } = {}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const slug = item ? (item.actor?.handle ?? "") : DEMO_MEMBER.slug;
  const name = item?.title ?? DEMO_MEMBER.name;
  const { connected, contact } = useMemberContact(slug || "");
  const { isFollowing, toggleFollow } = useSocial();

  const timestamp = item
    ? relativeTime(item.createdAt, fmt)
    : t("feed:card.newMember.today");
  const quote = item ? item.summary : DEMO_MEMBER.quote;
  const meta = item
    ? undefined
    : `${DEMO_MEMBER.pronouns} · ${DEMO_MEMBER.hood} · ${DEMO_MEMBER.occupation}`;
  const avatarSrc = item
    ? (item.actor?.avatarUrl ?? undefined)
    : memberAvatar(DEMO_MEMBER.slug)?.photo;
  const avatarInitials = item ? initials(name) : DEMO_MEMBER.initials;
  const tint = item ? (slug ? tintForSlug(slug) : "plum") : DEMO_MEMBER.tint;
  const profileLink = item?.link ?? `/profile/${DEMO_MEMBER.slug}`;

  const sayHi = (
    <Button
      variant="primary"
      size="sm"
      onClick={() => contact({ slug, name })}
    >
      {connected ? t("connect:contact.message") : t("feed:action.sayHi")}
    </Button>
  );
  // Follow is a demo-only affordance — gated off in live mode (no
  // member/author-level follow endpoint there), so only render it when
  // there's no live `item` to render from.
  const follow = !item ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => toggleFollow(slug)}
      aria-pressed={isFollowing(slug)}
    >
      {isFollowing(slug) ? t("feed:action.following") : t("feed:action.follow")}
    </Button>
  ) : undefined;

  return (
    <FeedCardShell accent="coral">
      <FeedCardHead
        label={t("feed:card.eyebrow.newMember")}
        timestamp={timestamp}
      />
      <FeedIdentity
        lead={
          <Avatar
            initials={avatarInitials}
            tint={tint}
            size={46}
            src={avatarSrc}
            alt={name}
          />
        }
        name={
          <span>
            {name} <MemberStaffBadge slug={slug || undefined} />
          </span>
        }
        meta={meta}
      />
      {quote && <FeedQuote>{quote}</FeedQuote>}
      {!item && (
        <FeedTagRow tags={DEMO_MEMBER.tags.map((label) => ({ label }))} />
      )}
      {!item && (
        <FeedProofStack
          avatars={DEMO_MEMBER.commonCommunities}
          label={t("feed:proof.communitiesInCommon", {
            count: DEMO_MEMBER.commonCommunities.length,
          })}
        />
      )}
      <FeedActions
        primary={sayHi}
        secondary={follow}
        link={
          <FeedActionLink to={profileLink}>
            {t("feed:action.profile")}
          </FeedActionLink>
        }
      />
    </FeedCardShell>
  );
}
