import type { CSSProperties, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ForumAuthor.module.css";

/** Profile path for a member slug (canonical member page). */
export const memberPath = (slug: string) => `/members/${slug}`;

/** The minimal identity a forum avatar/name needs to render and link. */
export interface ForumPerson {
  slug?: string;
  photo?: string;
  initials: string;
  name: string;
  /** Institutional QueerPulse account — links to governance, not a profile. */
  official?: boolean;
}

/** Where an author's name/avatar should link, or undefined if it shouldn't.
 * Official posts point at the governance page (who runs QueerPulse and how);
 * real members point at their profile. */
export function authorHref(person: {
  slug?: string;
  official?: boolean;
}): string | undefined {
  if (person.official) return routes.governance;
  if (person.slug) return memberPath(person.slug);
  return undefined;
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

/** Like ProfileLink, but for use INSIDE another router link (e.g. a thread card):
 * a span with role="link" that navigates on click without nesting anchors. */
export function ProfileSpanLink({
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  if (!to) return <>{children}</>;
  const go = () => navigate(to);
  const label = official
    ? t("forum:author.aboutTeamAria")
    : t("forum:author.viewProfileAria", { name });
  return (
    <span
      role="link"
      tabIndex={0}
      aria-label={label}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        go();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          go();
        }
      }}
    >
      {children}
    </span>
  );
}
