import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMemberContact } from "../connect/useMemberContact";
import { memberPath } from "../forum/forumAuthor.helpers";
import type { NewMemberRowModel } from "./groupNewMembers";
import { MemberContactButton } from "./MemberContactButton";
import {
  compactJoinedTimeLabel,
  memberContextLabel,
  resolveMemberContext,
} from "./memberCardContext";
import styles from "./NewMembersGroupCard.module.css";

/**
 * One person in the "people joined recently" card: a linked 40px avatar, the
 * name (linked to the same profile) with pronouns inline, one muted line with
 * the strongest context and the compact join time, and the contact button on
 * the right. In a narrow card the button moves under the text (a container
 * query on the list), so the name keeps the full text column.
 */
export function NewMembersGroupRow({ member }: { member: NewMemberRowModel }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { connected } = useMemberContact(member.slug);
  const contextLabel = memberContextLabel(
    resolveMemberContext({
      reason: member.reason,
      reasonSubject: member.reasonSubject,
      mutualConnectionCount: member.mutualConnectionCount,
      sharedInterests: member.sharedInterests,
      isConnected: connected,
    }),
    t,
  );
  const joinedLabel = compactJoinedTimeLabel(member.createdAt, t, fmt);
  // A live actor can be missing (an account removed since it joined): the row
  // then shows the person without a profile link or a contact action.
  const hasProfile = member.slug !== "";
  const profilePath = memberPath(member.slug);

  const avatar = (
    <Avatar
      initials={member.initials}
      tint={member.tint}
      size={40}
      src={member.avatarSrc}
      alt=""
    />
  );

  return (
    <li className={styles.row}>
      {hasProfile ? (
        // A mouse target only: the name link is the row's one tab stop.
        <Link
          to={profilePath}
          className={styles.avatarLink}
          tabIndex={-1}
          aria-hidden="true"
        >
          {avatar}
        </Link>
      ) : (
        avatar
      )}
      <div className={styles.rowText}>
        <p className={styles.rowName}>
          {hasProfile ? (
            <Link to={profilePath} className={styles.nameLink}>
              {member.name}
            </Link>
          ) : (
            member.name
          )}
          {member.pronouns && (
            <>
              {" "}
              <span className={styles.pronouns}>{member.pronouns}</span>
            </>
          )}
        </p>
        <p className={styles.rowMeta}>
          {contextLabel}
          {joinedLabel && (
            // Kept whole so the join time never wraps onto a line alone.
            <span className={styles.joinedTime}>
              {" · "}
              <time dateTime={member.createdAt}>{joinedLabel}</time>
            </span>
          )}
        </p>
      </div>
      {hasProfile && (
        <div className={styles.rowAction}>
          <MemberContactButton
            slug={member.slug}
            name={member.name}
            tone="soft"
          />
        </div>
      )}
    </li>
  );
}
