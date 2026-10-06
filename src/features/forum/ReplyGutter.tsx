import type { Ref } from "react";
import { FiMinus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Reply } from "./forum.data";
import { ForumAvatar, ProfileLink } from "./ForumAuthor";
import { authorHref } from "./forumAuthor.helpers";
import styles from "./ThreadPage.module.css";

/** The collapse controls a reply with nested replies carries in its gutter.
 *  ThreadReplyNode owns the show/hide itself; the gutter only renders the
 *  rail and the circled toggle that drive it. */
export interface ReplyGutterCollapse {
  isCollapsed: boolean;
  /** Every reply under this one, named in the toggle's accessible label. */
  descendantCount: number;
  /** The circled minus: collapses the branch. */
  onToggle: () => void;
  /** A click anywhere on the thread line: collapses (or re-opens) the branch. */
  onRailToggle: () => void;
}

/**
 * The left column of a reply row: the avatar, then the thread rail running
 * down from it to whatever hangs below (nested replies, a collapsed-branch
 * row, "continue this thread", or the inline composer).
 *
 * The rail is a mouse shortcut, the way it is on Reddit: clicking the line
 * collapses the branch. It stays out of the tab order and the accessibility
 * tree because the circled toggle is the same action with a proper name and
 * `aria-expanded`. With only the composer below there is nothing to collapse,
 * so the rail is a plain decorative line.
 *
 * The toggle itself renders after the reply's content (ReplyCollapseButton),
 * so Tab reaches the author and the actions first. The gutter keeps an empty
 * slot at its foot where the grid places it, and the slot carries the line
 * on above and below the circle. Collapsed, the circle fades out and the slot
 * fades in a line straight through, so the rail never jumps.
 */
export function ReplyGutter({
  reply,
  hasBranchBelow,
  collapse,
}: {
  reply: Reply;
  hasBranchBelow: boolean;
  collapse?: ReplyGutterCollapse;
}) {
  return (
    <div className={styles.replyGutter}>
      <ProfileLink
        to={authorHref(reply)}
        name={reply.name}
        official={reply.official}
        className={styles.avLink}
      >
        <ForumAvatar
          className={styles.replyAv}
          style={{ background: reply.background, color: reply.color }}
          person={{
            slug: reply.slug,
            photo: reply.photo,
            initials: reply.avatar,
            name: reply.name,
            official: reply.official,
          }}
        />
      </ProfileLink>
      {hasBranchBelow &&
        (collapse ? (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className={styles.replyRail}
            // A mouse click never moves focus onto this aria-hidden button.
            onMouseDown={(event) => event.preventDefault()}
            onClick={collapse.onRailToggle}
          />
        ) : (
          <span aria-hidden="true" className={styles.replyRailStatic} />
        ))}
      {collapse && (
        <span
          aria-hidden="true"
          className={[
            styles.gutterToggleSlot,
            collapse.isCollapsed && styles.gutterToggleSlotCollapsed,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}
    </div>
  );
}

/** The circled minus that collapses a reply's branch. Placed in the gutter by
 *  the grid, on the thread line, level with the actions row. It stays mounted
 *  while the branch is collapsed so it can fade and scale out and back in;
 *  `inert` keeps it out of reach meanwhile, and the "N hidden replies" row
 *  below is the control then. */
export function ReplyCollapseButton({
  authorName,
  descendantCount,
  isHidden,
  onToggle,
  buttonRef,
}: {
  authorName: string;
  descendantCount: number;
  isHidden: boolean;
  onToggle: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
}) {
  const { t } = useTranslation();
  return (
    <button
      ref={buttonRef}
      type="button"
      className={[styles.gutterToggle, isHidden && styles.gutterToggleHidden]
        .filter(Boolean)
        .join(" ")}
      inert={isHidden}
      aria-expanded={true}
      aria-label={t("forum:replies.collapseAria", {
        name: authorName,
        count: descendantCount,
      })}
      onClick={onToggle}
    >
      <FiMinus aria-hidden="true" />
    </button>
  );
}
