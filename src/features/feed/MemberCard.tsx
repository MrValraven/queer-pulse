import type { AvatarTint } from "../../shared/components/ui";
import { tintForSlug } from "../../shared/api/refs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberContact } from "../connect/useMemberContact";
import { useIsMemberCardSplit } from "../members/memberCardLayout";
import { initials as initialsFor } from "./api/feed.adapters";
import type { FeedItem } from "./api/feed.api";
import { FeedCardShell } from "./FeedCard";
import { MemberContactButton } from "./MemberContactButton";
import {
  compactJoinedTimeLabel,
  memberContextLabel,
  resolveMemberContext,
} from "./memberCardContext";
import {
  MemberAvatarLink,
  MemberCardBody,
  MemberCardHead,
  MemberNameBlock,
  MemberPortraitColumn,
} from "./MemberCardParts";
import styles from "./MemberCard.module.css";

/** Everything the card shows, read from its `new_member` feed item. Live and
 *  demo both pass one (the demo builds live-shaped items in
 *  `demoNewMembers.data.ts`). */
function useMemberCardModel(item: FeedItem) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const slug = item.actor?.handle ?? "";
  const name = item.title;
  const { connected, isSelf } = useMemberContact(slug);

  const context = resolveMemberContext({
    reason: item.reason,
    reasonSubject: item.reasonSubject,
    mutualConnectionCount: item.mutualConnectionCount,
    sharedInterests: item.sharedInterests,
    isConnected: connected,
  });

  const bio = item.summary.trim() || undefined;
  const neighbourhood = item.neighbourhood ?? undefined;
  // Every interest goes through: the tag row folds what does not fit on its
  // one line into a "+N" chip.
  const interests = item.interests ?? [];
  const tint: AvatarTint = slug ? tintForSlug(slug) : "plum";

  return {
    slug,
    name,
    hasAction: slug !== "" && !isSelf,
    isConnected: connected,
    contextLabel: memberContextLabel(context, t),
    timeLabel: compactJoinedTimeLabel(item.createdAt, t, formatters),
    dateTime: item.createdAt,
    pronouns: item.actor?.pronouns ?? undefined,
    neighbourhood,
    bio,
    interests,
    sharedInterests: item.sharedInterests,
    isEmpty: !bio && !neighbourhood && interests.length === 0,
    photo: {
      slug,
      name,
      initials: initialsFor(name),
      tint,
      src: item.actor?.avatarUrl ?? undefined,
    },
  };
}

/**
 * The feed's "New member" card, in one card per person (the People tab, and
 * the All tab when only one person joined).
 *
 * Above the mobile cutover (`useIsMemberCardSplit`) the photo fills a left
 * column at 35% of the card's width, flush with its top, left and bottom
 * edges, with the head, identity, bio, chips and action in the column beside
 * it. At the cutover and below, the head sits on top, then a 64px round
 * avatar beside the name block, then the rest at full width.
 *
 * Both layouts lead with one per-person context line in place of a repeated
 * "New member" label, then put what the member wrote about themselves first:
 * the bio, up to four lines with a Read more toggle, then their interests on
 * one row with the ones the viewer shares leading. Coral stays on the single
 * action, and groups space on two values: 4px inside a group, 12px between
 * groups.
 */
export function MemberCard({ item }: { item: FeedItem }) {
  const model = useMemberCardModel(item);
  const isSplit = useIsMemberCardSplit();
  const head = (
    <MemberCardHead
      contextLabel={model.contextLabel}
      timeLabel={model.timeLabel}
      dateTime={model.dateTime}
    />
  );
  const nameBlock = (
    <MemberNameBlock
      slug={model.slug}
      name={model.name}
      pronouns={model.pronouns}
      neighbourhood={model.neighbourhood}
    />
  );
  const body = (
    <MemberCardBody
      bio={model.bio}
      interests={model.interests}
      sharedInterests={model.sharedInterests}
      isEmpty={model.isEmpty}
      isConnected={model.isConnected}
    />
  );
  // Wrapped so the button keeps its own width in the column instead of
  // stretching, and left out entirely when there is no button to hold.
  const action = model.hasAction && (
    <div className={styles.action}>
      <MemberContactButton slug={model.slug} name={model.name} />
    </div>
  );

  if (isSplit) {
    return (
      <FeedCardShell accent="ink" className={styles.portraitSplit}>
        <MemberPortraitColumn {...model.photo} />
        <div className={styles.details}>
          {head}
          {nameBlock}
          {body}
          {action}
        </div>
      </FeedCardShell>
    );
  }
  return (
    <FeedCardShell accent="ink">
      {head}
      <div className={styles.identityRow}>
        <MemberAvatarLink {...model.photo} />
        {nameBlock}
      </div>
      {body}
      {action}
    </FeedCardShell>
  );
}
