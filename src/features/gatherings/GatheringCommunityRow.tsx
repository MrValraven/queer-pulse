import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { communityPath } from "../../app/routeMap";
import styles from "./GatheringPage.module.css";
import rowStyles from "./GatheringCommunityRow.module.css";

/** One hosting community in the sidebar's "Hosted with" card: its mark (or
 *  the community icon), its linked name, its role, and an optional action
 *  under the role. */
export function GatheringCommunityRow({
  community,
  roleLabel,
  children,
}: {
  community: { slug: string; name: string; avatarImageUrl?: string | null };
  roleLabel: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`${styles.hostRow} ${children ? styles.hostRowWithAction : ""}`}
    >
      <span className={styles.communityIcon} aria-hidden>
        {community.avatarImageUrl ? (
          <img
            className={styles.communityAvatar}
            src={community.avatarImageUrl}
            alt=""
            width={44}
            height={44}
            referrerPolicy="no-referrer"
          />
        ) : (
          <FiUsers />
        )}
      </span>
      <div>
        <div className={styles.hostName}>
          <Link
            className={styles.communityName}
            to={communityPath(community.slug)}
          >
            {community.name}
          </Link>
        </div>
        <div className={styles.hostRole}>{roleLabel}</div>
        {children && <div className={rowStyles.action}>{children}</div>}
      </div>
    </div>
  );
}
