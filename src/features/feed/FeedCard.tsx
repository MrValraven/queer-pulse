import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { AvatarStack, Tag, type AvatarTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberPath } from "../forum/forumAuthor.helpers";
import styles from "./FeedCard.module.css";

/**
 * Wraps a feed card's author/host avatar in a link to that person's profile
 * (`/members/:slug`), so tapping the photo opens the profile — matching the
 * forum's `ProfileLink` pattern. Renders the avatar inert when there's no
 * `slug` (anonymous/official actors), and stops short of nesting anchors: a
 * feed card's shell is an `<article>`, never a link, so a real `<Link>` here
 * is safe. Place it in `FeedIdentity`'s `lead` slot.
 */
export function FeedAvatarLink({
  slug,
  name,
  children,
}: {
  slug?: string;
  name: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  if (!slug) return <>{children}</>;
  return (
    <Link
      to={memberPath(slug)}
      className={styles.avatarLink}
      aria-label={t("feed:action.viewProfileAria", { name })}
    >
      {children}
    </Link>
  );
}

export type FeedAccent = "coral" | "jade" | "ink";

/** Maps the semantic accent to the CSS custom property the shell exposes as
 *  `--fc-accent`, so the dot, eyebrow, meter, and tinted chip all read one var. */
const ACCENT_VAR: Record<FeedAccent, string> = {
  coral: "var(--accent)",
  jade: "var(--jade)",
  ink: "var(--ink)",
};

/** Parallel AA-safe TEXT tokens for `--fc-accent-ink`. `--accent`/`--jade` are
 *  brand fill colours that fail WCAG AA 4.5:1 as small text on `--paper`; use
 *  this var for text (eyebrow, text-link, tinted-tag label) and keep
 *  `--fc-accent` for non-text fills (dot, meter fill, tinted-tag background). */
const ACCENT_INK_VAR: Record<FeedAccent, string> = {
  coral: "var(--accent-ink)",
  jade: "var(--jade-ink)",
  ink: "var(--ink)",
};

export function FeedCardShell({
  accent,
  children,
  className,
}: {
  accent: FeedAccent;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={[styles.shell, className].filter(Boolean).join(" ")}
      style={{
        ["--fc-accent" as string]: ACCENT_VAR[accent],
        ["--fc-accent-ink" as string]: ACCENT_INK_VAR[accent],
      }}
    >
      {children}
    </article>
  );
}

export function FeedCardHead({
  label,
  timestamp,
}: {
  label: string;
  timestamp?: string;
}) {
  return (
    <div className={styles.head}>
      <span className={styles.eyebrow}>
        <span className={styles.dot} aria-hidden />
        {label}
      </span>
      {timestamp && <span className={styles.time}>{timestamp}</span>}
    </div>
  );
}

export function FeedIdentity({
  lead,
  name,
  meta,
}: {
  lead: ReactNode;
  name: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className={styles.identity}>
      <div className={styles.lead}>{lead}</div>
      <div className={styles.identityText}>
        <div className={styles.name}>{name}</div>
        {meta && <div className={styles.meta}>{meta}</div>}
      </div>
    </div>
  );
}

export function FeedDateBlock({ day, month }: { day: string; month: string }) {
  return (
    <div className={styles.dateBlock}>
      <span className={styles.dateDay}>{day}</span>
      <span className={styles.dateMonth}>{month}</span>
    </div>
  );
}

export function FeedQuote({ children }: { children: ReactNode }) {
  return <p className={styles.quote}>{children}</p>;
}

export function FeedTagRow({
  tags,
}: {
  tags: { label: string; accent?: boolean }[];
}) {
  if (tags.length === 0) return null;
  return (
    <div className={styles.tagRow}>
      {tags.map((tag) => (
        <Tag
          key={tag.label}
          className={tag.accent ? styles.tagAccent : undefined}
        >
          {tag.label}
        </Tag>
      ))}
    </div>
  );
}

export function FeedProofStack({
  avatars,
  label,
}: {
  avatars: { initials: string; tint?: AvatarTint; src?: string }[];
  label: string;
}) {
  return (
    <div className={styles.proof}>
      <AvatarStack avatars={avatars} size={22} />
      <span className={styles.proofLabel}>{label}</span>
    </div>
  );
}

export function FeedMeter({
  ratio,
  label,
  trailing,
}: {
  ratio: number;
  label: ReactNode;
  trailing?: ReactNode;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return (
    <div className={styles.meterBlock}>
      <div className={styles.meterTop}>
        <span className={styles.meterLabel}>{label}</span>
        {trailing && <span className={styles.meterTrailing}>{trailing}</span>}
      </div>
      <div className={styles.meterTrack} aria-hidden>
        <div className={styles.meterFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function FeedStat({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon} aria-hidden>
        {icon}
      </span>
      {children}
    </div>
  );
}

export function FeedActions({
  primary,
  secondary,
  link,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  link?: ReactNode;
}) {
  return (
    <>
      <div className={styles.divider} />
      <div className={styles.actions}>
        <div className={styles.actionButtons}>
          {primary}
          {secondary}
        </div>
        {link && <div>{link}</div>}
      </div>
    </>
  );
}

/** Trailing coral text-link used in the action row's `link` slot. Uses the
 *  router `Link` (not `<a href>`) so navigating within the app never forces
 *  a full page reload. */
export function FeedActionLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link className={styles.textLink} to={to}>
      {children} <FiArrowRight aria-hidden />
    </Link>
  );
}
