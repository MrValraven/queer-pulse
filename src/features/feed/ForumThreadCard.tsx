import { FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Avatar, Button } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { tintForSlug } from "../../shared/api/refs";
import { initials, relativeTime } from "./api/feed.adapters";
import type { FeedItem } from "../../shared/contracts/contracts";
import {
  FeedActionLink,
  FeedActions,
  FeedCardHead,
  FeedCardShell,
  FeedIdentity,
  FeedQuote,
  FeedStat,
} from "./FeedCard";

/**
 * "Forum thread" card for the feed's `forum_thread` `FeedItem`s. Live data
 * only — the design prototype never scripted a forum-thread feed card, so
 * there's no `DEMO_*` mock to fall back to the way `MemberCard`/
 * `GatheringCard` do; this card only renders once Task 9 wires it into the
 * feed's type switch.
 *
 * Backend mapping: `title` = thread title, `summary` =
 * "{category} · N replies", `link` = `/forum/threads/{slug}`.
 */
export function ForumThreadCard({ item }: { item: FeedItem }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const actor = item.actor;
  const authorSlug = actor?.handle ?? "";
  const authorName =
    actor?.displayName ?? t("feed:card.forumThread.anonymousAuthor");
  const authorTint = authorSlug ? tintForSlug(authorSlug) : "plum";
  const timestamp = relativeTime(item.createdAt, fmt);

  return (
    <FeedCardShell accent="ink">
      <FeedCardHead
        label={t("feed:card.eyebrow.forumThread")}
        timestamp={timestamp}
      />
      <FeedIdentity
        lead={
          <Avatar
            initials={initials(authorName)}
            tint={authorTint}
            size={46}
            src={actor?.avatarUrl ?? undefined}
            alt={authorName}
          />
        }
        name={
          <span>
            {authorName} <MemberStaffBadge slug={authorSlug || undefined} />
          </span>
        }
        meta={
          <FeedStat icon={<FiMessageSquare aria-hidden />}>
            {item.summary}
          </FeedStat>
        }
      />
      <FeedQuote>{item.title}</FeedQuote>
      <FeedActions
        primary={
          <Button variant="ghost" size="sm" to={item.link}>
            {t("feed:action.openThread")}
          </Button>
        }
        link={
          <FeedActionLink to={item.link}>
            {t("forum:threadPage.breadcrumbForum")}
          </FeedActionLink>
        }
      />
    </FeedCardShell>
  );
}
