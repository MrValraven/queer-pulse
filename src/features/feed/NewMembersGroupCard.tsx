import { useId } from "react";
import { AvatarStack } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { FeedItem } from "./api/feed.api";
import { FeedCardShell } from "./FeedCard";
import {
  feedItemToNewMemberRow,
  type NewMemberRowModel,
} from "./groupNewMembers";
import { NewMembersGroupRow } from "./NewMembersGroupRow";
import { newMembersWeekTitle } from "./newMembersWeekTitle";
import { useNewMembersFold } from "./useNewMembersFold";
import styles from "./NewMembersGroupCard.module.css";

/** Rows shown before "Show all", and faces in the head's avatar stack. */
const COLLAPSED_ROW_COUNT = 3;
const STACK_AVATAR_COUNT = 5;

/** How many revealed rows get their own step in the fold's fade-in cascade.
 *  Past this they all share the last step, so a week of forty-odd joiners
 *  opens as quickly as a week of ten. */
const FOLD_STAGGER_MAX_STEPS = 6;

/**
 * One calendar week's joiners in one card for the "All" tab (two or more of
 * them), so a wave of sign-ups reads as one piece of news instead of a run of
 * near-identical cards. The title names the week ("This week", "Last week",
 * "The week of 28 Sep"). Shows the first three people with a toggle for the
 * rest, which folds the list open and shut (see `useNewMembersFold`); the
 * list is labelled by the card's title.
 */
export function NewMembersGroupCard({
  members,
  weekStart,
}: {
  members: NewMemberRowModel[];
  /** "YYYY-MM-DD": the local Monday of the week these people joined in. */
  weekStart: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const titleId = useId();
  const listId = useId();
  const { listRef, toggleRef, isExpanded, foldPhase, toggle } =
    useNewMembersFold(COLLAPSED_ROW_COUNT);
  const isFolding = foldPhase !== "idle";
  const count = members.length;
  const hasCollapsedRows = count > COLLAPSED_ROW_COUNT;
  // A closing fold keeps every row until it settles, so the extra rows only
  // unmount once the list is back to its first three and nothing pops.
  const visibleMembers =
    isExpanded || isFolding || !hasCollapsedRows
      ? members
      : members.slice(0, COLLAPSED_ROW_COUNT);

  return (
    <FeedCardShell accent="ink">
      <div className={styles.head}>
        <h2 id={titleId} className={styles.title}>
          {newMembersWeekTitle(weekStart, count, new Date(), t, fmt)}
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
      <ul
        id={listId}
        ref={listRef}
        className={styles.list}
        aria-labelledby={titleId}
        data-folding={isFolding ? foldPhase : undefined}
      >
        {visibleMembers.map((member, memberIndex) => (
          <NewMembersGroupRow
            key={member.slug || `${member.name}-${member.createdAt}`}
            member={member}
            foldStep={
              memberIndex >= COLLAPSED_ROW_COUNT
                ? Math.min(
                    memberIndex - COLLAPSED_ROW_COUNT,
                    FOLD_STAGGER_MAX_STEPS,
                  )
                : undefined
            }
          />
        ))}
      </ul>
      {hasCollapsedRows && (
        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={isExpanded}
          aria-controls={listId}
          onClick={toggle}
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
export function LiveNewMembersGroupCard({
  items,
  weekStart,
}: {
  items: FeedItem[];
  weekStart: string;
}) {
  return (
    <NewMembersGroupCard
      members={items.map(feedItemToNewMemberRow)}
      weekStart={weekStart}
    />
  );
}
