import { FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Avatar, Button } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { tintForSlug } from "../../shared/api/refs";
import { initials, relativeTime } from "./api/feed.adapters";
import type { FeedItem } from "./api/feed.api";
import { MoreMenu } from "./FeedModeration";
import { FeedReasonLine } from "./FeedPostActions";
import styles from "./FeedCard.module.css";
import {
  FeedActionLink,
  FeedActions,
  FeedAvatarLink,
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
 *
 * SOC-04/SOC-18: it also carries the "why am I seeing this" line and a
 * per-thread "show me less of this". Muting a thread quiets that one
 * conversation in this member's feed; the thread itself is untouched and
 * still reachable from the forum.
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
      <div className={styles.postHeadRow}>
        <FeedCardHead
          label={t("feed:card.eyebrow.forumThread")}
          timestamp={timestamp}
        />
        {/* No Report item here: a forum thread is reported through its
            OPENING POST, whose id the aggregated feed item does not carry —
            offering it would file a report against the wrong subject. The
            thread page itself has the correct affordance. */}
        <MoreMenu
          authorName={authorName}
          slug={authorSlug}
          muteTarget={
            item.source
              ? {
                  sourceKind: item.source.kind,
                  sourceId: item.source.id,
                  name: item.source.name,
                }
              : undefined
          }
        />
      </div>
      <FeedIdentity
        lead={
          <FeedAvatarLink slug={authorSlug} name={authorName}>
            <Avatar
              initials={initials(authorName)}
              tint={authorTint}
              size={46}
              src={actor?.avatarUrl ?? undefined}
              alt={authorName}
            />
          </FeedAvatarLink>
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
      <FeedReasonLine reason={item.reason} subject={item.reasonSubject} />
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
