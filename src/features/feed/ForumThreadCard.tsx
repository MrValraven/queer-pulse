import { useId } from "react";
import { FiEye, FiEyeOff, FiMessageSquare } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { Avatar, Button } from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { tintForSlug } from "../../shared/api/refs";
import { initials, relativeTime } from "./api/feed.adapters";
import type { FeedItem } from "./api/feed.api";
import { MoreMenu } from "./FeedModeration";
import { FeedReasonLine } from "./FeedPostActions";
import { ForumThreadLikeButton } from "./ForumThreadLikeButton";
import { CATS } from "../forum/forum.data";
import { ForumAvatar, OfficialBadge } from "../forum/ForumAuthor";
import { ContentWarningPill } from "../forum/ForumContentWarning";
import {
  contentWarningLabels,
  useContentWarningReveal,
} from "../forum/forumWarnings.helpers";
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
 * only: the design prototype never scripted a forum-thread feed card, so
 * there's no `DEMO_*` mock to fall back to the way `MemberCard`/
 * `GatheringCard` do; this card only renders once Task 9 wires it into the
 * feed's type switch.
 *
 * Backend mapping: `title` = thread title, `category` = the raw category key
 * and `replyCount` = a LIVE count that excludes deleted replies since
 * ENG-132 (the card translates both; `summary` keeps the English
 * "{category} · N replies" for older clients), `link` = `/thread/{slug}`,
 * `excerpt` = the opening post as plain text (PRD-167), which may be null,
 * and `contentWarnings` = the author's warnings (DES-404).
 *
 * SOC-04/SOC-18: it also carries the "why am I seeing this" line and a
 * per-thread "show me less of this". Muting a thread quiets that one
 * conversation in this member's feed; the thread itself is untouched and
 * still reachable from the forum.
 *
 * ENG-417: an anonymous or official thread arrives with a `bylineMask` and a
 * null `actor`. It then wears the mask's own name and an empty slug, so the
 * card has no profile link and no person-scoped menu items.
 *
 * FEED-LIKE: the card offers the same like the thread page does, through
 * `ForumThreadLikeButton`, which upvotes the thread's opening post.
 */
export function ForumThreadCard({ item }: { item: FeedItem }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const byline = threadByline(item, t);
  const { authorSlug, authorName } = byline;
  const isOfficial = byline.mask === "official";
  const timestamp = relativeTime(item.createdAt, fmt);

  return (
    <FeedCardShell accent="ink">
      <div className={styles.postHeadRow}>
        <FeedCardHead
          label={t("feed:card.eyebrow.forumThread")}
          timestamp={timestamp}
        />
        {/* No Report item here: a forum thread is reported through its
            OPENING POST, whose id the aggregated feed item does not carry,
            so offering it would file a report against the wrong subject. The
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
            <ThreadBylineAvatar byline={byline} />
          </FeedAvatarLink>
        }
        name={
          <span className={styles.bylineName}>
            {authorName}
            {isOfficial ? (
              <OfficialBadge />
            ) : (
              <MemberStaffBadge slug={authorSlug || undefined} />
            )}
          </span>
        }
        meta={
          <FeedStat icon={<FiMessageSquare aria-hidden />}>
            {threadMetaLine(item, t)}
          </FeedStat>
        }
      />
      <FeedQuote>{item.title}</FeedQuote>
      <ThreadExcerpt item={item} />
      <FeedReasonLine reason={item.reason} subject={item.reasonSubject} />
      <FeedActions
        primary={
          <Button variant="ghost" size="sm" to={item.link}>
            {t("feed:action.openThread")}
          </Button>
        }
        secondary={<ForumThreadLikeButton item={item} />}
        link={
          <FeedActionLink to={item.link}>
            {t("forum:threadPage.breadcrumbForum")}
          </FeedActionLink>
        }
      />
    </FeedCardShell>
  );
}

interface ThreadByline {
  mask: "anonymous" | "official" | null;
  avatarUrl: string | null;
  authorSlug: string;
  authorName: string;
}

/**
 * Who the card credits. Official wins over anonymous, the same precedence the
 * forum's own byline uses. A masked thread gets an empty slug, which is what
 * keeps the avatar unlinked and the person-scoped menu items hidden.
 *
 * An unmasked item with no actor borrows the forum's anonymous name, so an
 * unnamed author reads the same on every card and on the forum itself.
 */
function threadByline(item: FeedItem, t: TFunction): ThreadByline {
  const anonymousName = t("forum:composePage.preview.anonymousName");
  if (item.bylineMask === "official") {
    return {
      mask: "official",
      avatarUrl: null,
      authorSlug: "",
      authorName: t("feed:card.forumThread.officialAuthor"),
    };
  }
  if (item.bylineMask === "anonymous") {
    return {
      mask: "anonymous",
      avatarUrl: null,
      authorSlug: "",
      authorName: anonymousName,
    };
  }
  const actor = item.actor;
  return {
    mask: null,
    avatarUrl: actor?.avatarUrl ?? null,
    authorSlug: actor?.handle ?? "",
    authorName: actor?.displayName ?? anonymousName,
  };
}

/**
 * The byline's face, drawn the way the forum draws it (S6): the institutional
 * account wears the brand mark on plum through the forum's own `ForumAvatar`,
 * and an anonymous thread shows one letter of the mask's name, the same single
 * letter `ThreadOpCardHead` and `ForumThreadRow` draw. Two initials would read
 * as a real member's.
 */
function ThreadBylineAvatar({ byline }: { byline: ThreadByline }) {
  if (byline.mask === "official") {
    return (
      <ForumAvatar
        className={styles.brandAvatar}
        person={{ initials: "", name: byline.authorName, official: true }}
      />
    );
  }
  return (
    <Avatar
      initials={
        byline.mask === "anonymous"
          ? byline.authorName.slice(0, 1)
          : initials(byline.authorName)
      }
      tint={byline.authorSlug ? tintForSlug(byline.authorSlug) : "plum"}
      size={46}
      src={byline.avatarUrl ?? undefined}
      alt={byline.authorName}
    />
  );
}

/**
 * ENG-420: "{category} · {replies}" in the reader's language. The category
 * key is translated through the forum's own category list; a key the list
 * does not know shows the reply count alone. A response with no `category`
 * comes from an older server, so its English `summary` is shown as sent.
 */
function threadMetaLine(item: FeedItem, t: TFunction): string {
  if (!item.category) return item.summary;
  const replies = t("feed:card.forumThread.replies", {
    count: item.replyCount ?? 0,
  });
  const categoryMeta = CATS.find((category) => category.id === item.category);
  if (!categoryMeta) return replies;
  return t("feed:card.forumThread.meta", {
    category: t(categoryMeta.nameKey),
    replies,
  });
}

/**
 * PRD-167: the opening post's own words, so a thread is decided on the same
 * terms as every other card in the feed. The backend strips the markup, cuts
 * it to 180 characters on a word boundary, and sends null when there is
 * nothing readable to show, which renders nothing at all.
 *
 * DES-404: a warned thread wears the forum's warning pill whenever it has
 * warnings, excerpt or no excerpt, and keeps its excerpt covered until the
 * reader presses the reveal, exactly as the forum list does. The reveal is
 * keyed on the thread's slug, the same key the forum list and thread page
 * use, so uncovering a thread here also uncovers it in the forum for the
 * rest of the session.
 *
 * N8: the pill is the one place the warnings are listed. The reveal keeps a
 * short label and points at the pill through `aria-describedby`, so a screen
 * reader still hears what it uncovers before pressing it.
 */
function ThreadExcerpt({ item }: { item: FeedItem }) {
  const { t } = useTranslation();
  const excerptId = useId();
  const pillId = useId();
  const { isRevealed, reveal, cover } = useContentWarningReveal(
    threadRevealKey(item),
  );
  // Counted as the pill counts them, so the excerpt is only ever covered
  // while a pill says why.
  const hasWarnings = contentWarningLabels(item.contentWarnings, t).length > 0;
  const isExcerptCovered = hasWarnings && !isRevealed;
  const pill = hasWarnings && (
    <div id={pillId} className={styles.warningPillSlot}>
      <ContentWarningPill
        warnings={item.contentWarnings}
        className={styles.warningPill}
      />
    </div>
  );
  if (!item.excerpt) return pill || null;
  return (
    <>
      {pill}
      <p
        id={excerptId}
        // A blur is no cover to a screen reader, so the covered excerpt is
        // hidden from assistive tech too. It holds nothing focusable.
        aria-hidden={isExcerptCovered || undefined}
        className={[
          styles.threadExcerpt,
          isExcerptCovered && styles.threadExcerptCovered,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {item.excerpt}
      </p>
      {hasWarnings && (
        <WarningRevealButton
          isRevealed={isRevealed}
          onToggle={isRevealed ? cover : reveal}
          controlsId={excerptId}
          describedById={pillId}
        />
      )}
    </>
  );
}

/**
 * The feed's reveal: the same real button as the forum's
 * `ContentWarningReveal` (focusable, `aria-expanded` against the passage it
 * governs), with a short label because the pill above already names the
 * warnings. Its 44 px target reaches up over the covered excerpt, so the two
 * read as one group (S7).
 */
function WarningRevealButton({
  isRevealed,
  onToggle,
  controlsId,
  describedById,
}: {
  isRevealed: boolean;
  onToggle: () => void;
  controlsId: string;
  describedById: string;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.warningReveal}
      aria-expanded={isRevealed}
      aria-controls={controlsId}
      aria-describedby={describedById}
      onClick={onToggle}
    >
      {isRevealed ? (
        <FiEyeOff aria-hidden="true" />
      ) : (
        <FiEye aria-hidden="true" />
      )}
      {isRevealed
        ? t("forum:composePage.preview.hideAgain")
        : t("feed:card.forumThread.revealWarned")}
    </button>
  );
}

/** The path prefix of a thread's `link` (`routeMap.ts#thread`). */
const THREAD_LINK_PREFIX = "/thread/";

/**
 * The reveal key the forum uses for this thread: its slug, which the feed
 * item carries as the last segment of `link`. A link of any other shape falls
 * back to the item id, the forum's own fallback when a thread has no slug.
 */
function threadRevealKey(item: FeedItem): string {
  if (!item.link.startsWith(THREAD_LINK_PREFIX)) return item.id;
  const slug = item.link.slice(THREAD_LINK_PREFIX.length).split(/[?#/]/)[0];
  return slug || item.id;
}
