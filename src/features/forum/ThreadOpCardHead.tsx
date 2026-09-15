import { Link } from "react-router-dom";
import { FiEyeOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { CATS, CAT_STYLE, type Thread } from "./forum.data";
import { ForumAvatar, ProfileLink, OfficialBadge } from "./ForumAuthor";
import { authorHref, isMaskedByline, memberPath } from "./forumAuthor.helpers";
import { ModeratorByline } from "./ThreadReplies";
import { PostActionsMenu } from "./PostActionsMenu";
import styles from "./ThreadPage.module.css";

/**
 * Who wrote the opening post, and when: the avatar, the byline, the category
 * and time line, and the ⋯ menu.
 *
 * ## The byline renders what the response gives it
 *
 * An anonymous thread reaches an ordinary reader with its author block ALREADY
 * masked by the server: an empty handle, which is what makes the name link
 * nowhere. A MODERATOR receives the real author instead, with `isAnonymous`
 * still true beside it, because anonymity is a rendering decision for the room
 * rather than a gap in the record. Both of those are drawn exactly as they
 * arrive. Nothing here re-derives who is allowed to see whom: a second copy of
 * that rule is a second thing to keep in step with the first.
 *
 * Lifted out of `ThreadOpCard` so that component keeps room under the 200-line
 * budget as the card grew a poll, a gallery and a warning.
 */
export function ThreadOpCardHead({
  thread,
  editedAt,
  canEdit,
  canDelete,
  canRestore,
  canViewHistory,
  onEdit,
  onDelete,
  onRestore,
  onHistory,
  onMoveCategory,
}: {
  thread: Thread;
  editedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
  onMoveCategory?: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const categoryMeta = CATS.find(
    (candidate) => candidate.id === thread.category,
  );
  // `--plum` does NOT flip in dark mode, so an unknown category printed its
  // name in near-black on the dark card. `--text-strong` is the plum-for-text
  // token and flips, and it is what `CAT_STYLE.general` already resolves to.
  const categoryColor =
    CAT_STYLE[thread.category]?.color ?? "var(--text-strong)";

  // The server masked this byline: no handle came back, so there is nobody to
  // link to and the name it did send is a placeholder rather than a person.
  const isMasked = isMaskedByline(thread);
  const anonymousName = t("forum:composePage.preview.anonymousName");
  const displayName = isMasked ? anonymousName : thread.author.name;

  return (
    <div className={styles.opHead}>
      <ProfileLink
        to={authorHref(thread.author)}
        name={displayName}
        official={thread.author.official}
        className={styles.avLink}
      >
        <ForumAvatar
          className={styles.opAv}
          style={{
            background: thread.author.background,
            color: thread.author.color,
          }}
          person={{
            slug: thread.author.slug,
            photo: isMasked ? undefined : thread.author.photo,
            // The same single letter the composer's preview draws for an
            // anonymous byline, so the two look like one thing.
            initials: isMasked
              ? anonymousName.slice(0, 1)
              : thread.author.initials,
            name: displayName,
            official: thread.author.official,
          }}
        />
      </ProfileLink>
      <div>
        <div className={styles.opName}>
          <ProfileLink
            to={authorHref(thread.author)}
            name={displayName}
            official={thread.author.official}
            className={styles.authorLink}
          >
            {displayName}
          </ProfileLink>
          {!isMasked && <MemberStaffBadge slug={thread.author.slug} />}
          {thread.author.official && <OfficialBadge />}
          <OpCoAuthor coAuthor={thread.coAuthor} />
          {/* A moderator reading an anonymous thread sees the real author AND
              the fact that the room does not. Saying so is what stops that
              view from looking like the byline everybody else gets. */}
          {thread.isAnonymous && !isMasked && (
            <span className={styles.anonMark}>
              <FiEyeOff aria-hidden="true" />
              {t("forum:byline.postedAnonymously")}
            </span>
          )}
        </div>
        {!isMasked && <ModeratorByline mod={thread.author.mod} />}
        <div className={styles.opSub}>
          <span className={styles.opCat} style={{ color: categoryColor }}>
            {categoryMeta && t(categoryMeta.nameKey)}
          </span>
          <span>·</span>
          <span>
            {t("forum:threadOp.postedPrefix", { time: thread.posted })}
          </span>
          {/* Live threads carry no view count (the DTO has none), so the stat
              is omitted entirely rather than printing "0 views". */}
          {thread.views != null && (
            <>
              <span>·</span>
              <span>
                {t("forum:threadOp.viewsCount", {
                  count: thread.views,
                  formatted: format.number(thread.views),
                })}
              </span>
            </>
          )}
          {editedAt && (
            <>
              <span>·</span>
              <span className={styles.editedMark}>
                {t("forum:edited.mark")}
              </span>
            </>
          )}
        </div>
      </div>
      <div className={styles.opMenu}>
        <PostActionsMenu
          canEdit={canEdit}
          canDelete={canDelete}
          canRestore={canRestore}
          canViewHistory={canViewHistory}
          // Adds Mute / Block for the thread's author (self-aware no-op). A
          // masked byline carries no handle, so those items have no subject and
          // the menu leaves them out on its own.
          author={{
            slug: thread.author.slug,
            name: displayName,
            official: thread.author.official,
          }}
          canMoveCategory={!!onMoveCategory}
          onMoveCategory={onMoveCategory}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onHistory={onHistory}
        />
      </div>
    </div>
  );
}

/** The second name on a co-authored thread, linked when it carries a slug.
 *  Absent on a masked byline, which the server already guarantees: an
 *  "anonymous" thread credited to a named member is not anonymous. */
function OpCoAuthor({ coAuthor }: { coAuthor: Thread["coAuthor"] }) {
  const { t } = useTranslation();
  if (!coAuthor) return null;
  const label = t("forum:composePage.preview.withCoAuthor", {
    name: coAuthor.name,
  });
  if (!coAuthor.slug) return <span className={styles.coAuthor}>{label}</span>;
  return (
    <Link to={memberPath(coAuthor.slug)} className={styles.coAuthor}>
      {label}
    </Link>
  );
}
