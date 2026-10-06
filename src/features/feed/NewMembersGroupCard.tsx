import { useId, useState } from "react";
import { AvatarStack } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { FeedItem } from "./api/feed.api";
import { FeedCardShell } from "./FeedCard";
import {
  feedItemToNewMemberRow,
  type NewMemberRowModel,
} from "./groupNewMembers";
import { NewMembersGroupRow } from "./NewMembersGroupRow";
import styles from "./NewMembersGroupCard.module.css";

/** Rows shown before "Show all", and faces in the head's avatar stack. */
const COLLAPSED_ROW_COUNT = 3;
const STACK_AVATAR_COUNT = 5;

/**
 * Every recent joiner in one card for the "All" tab (two or more of them),
 * so a wave of sign-ups reads as one piece of news instead of a run of
 * near-identical cards. Shows the first three people with a toggle for the
 * rest; the list is labelled by the card's title.
 */
export function NewMembersGroupCard({
  members,
}: {
  members: NewMemberRowModel[];
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const listId = useId();
  const [isExpanded, setIsExpanded] = useState(false);
  const count = members.length;
  const hasCollapsedRows = count > COLLAPSED_ROW_COUNT;
  const visibleMembers =
    isExpanded || !hasCollapsedRows
      ? members
      : members.slice(0, COLLAPSED_ROW_COUNT);

  return (
    <FeedCardShell accent="ink">
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {t("feed:memberCard.group.title", { count })}
        </h2>
        {/* Decorative: every face here is named in the list below. */}
        <AvatarStack
          aria-hidden
          className={styles.stack}
          size={28}
          avatars={members.slice(0, STACK_AVATAR_COUNT).map((member) => ({
            initials: member.initials,
            tint: member.tint,
            src: member.avatarSrc,
          }))}
        />
      </div>
      <ul id={listId} className={styles.list} aria-labelledby={titleId}>
        {visibleMembers.map((member) => (
          <NewMembersGroupRow
            key={member.slug || `${member.name}-${member.createdAt}`}
            member={member}
          />
        ))}
      </ul>
      {hasCollapsedRows && (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={isExpanded}
          aria-controls={listId}
          onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
        >
          {isExpanded
            ? t("feed:memberCard.group.showFewer")
            : t("feed:memberCard.group.showAll", { count })}
        </button>
      )}
    </FeedCardShell>
  );
}

/** The feed's group: `new_member` items adapted to rows, in live and demo. */
export function LiveNewMembersGroupCard({ items }: { items: FeedItem[] }) {
  return <NewMembersGroupCard members={items.map(feedItemToNewMemberRow)} />;
}
