import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ForumAuthor.module.css";

/** The minimal identity a forum avatar/name needs to render and link. */
export interface ForumPerson {
  slug?: string;
  photo?: string;
  initials: string;
  name: string;
  /** Institutional QueerPulse account — links to governance, not a profile. */
  official?: boolean;
}

/** A circular forum avatar: the member's photo when available, initials otherwise. */
export function ForumAvatar({
  className,
  style,
  person,
}: {
  className?: string;
  style?: CSSProperties;
  person: ForumPerson;
}) {
  return (
    <span className={className} style={style}>
      {person.photo ? (
        <img
          src={resolveAvatarSrc(person.photo)}
          alt={person.name}
          referrerPolicy="no-referrer"
        />
      ) : (
        person.initials
      )}
    </span>
  );
}

/** The "Official" pill shown beside the QueerPulse account's name.
 *  Uses the QP monogram, NOT the shield — the shield marks staff *humans*
 *  (`shared/staff/MemberStaffBadge`), and this is an institutional account. */
export function OfficialBadge() {
  const { t } = useTranslation();
  return (
    <span className={styles.official} title={t("forum:author.officialTitle")}>
      <span className={styles.officialMark} aria-hidden>
        QP
      </span>
      {t("forum:author.officialBadge")}
    </span>
  );
}

/** Wraps children in a link to `to` when present; otherwise renders them inert.
 * Use where the surrounding markup is NOT already a link. */
export function ProfileLink({
  to,
  className,
  name,
  official,
  children,
}: {
  to?: string;
  className?: string;
  name: string;
  official?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  if (!to) return <>{children}</>;
  const label = official
    ? t("forum:author.aboutTeamAria")
    : t("forum:author.viewProfileAria", { name });
  return (
    <Link to={to} className={className} aria-label={label}>
      {children}
    </Link>
  );
}
