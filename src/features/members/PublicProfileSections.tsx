import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button } from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { curatorSlugForName } from "../cinema/cinemaCurator.data";
import { SocialLinksRow } from "./SocialLinksRow";
import type { Member } from "./data/members";
import type { PublicCard } from "./publicProfile.data";
import type { PublicContributions } from "./currentUserPublic.data";
import styles from "./PublicProfilePage.module.css";

/** Splits e.g. "1.4k" → { num: 1.4, suffix: "k" } for animating the leading number. */
function parseStat(value: string): {
  num: number;
  suffix: string;
  decimals: number;
} {
  const match = value.match(/^([\d.]+)(.*)$/);
  if (!match) return { num: NaN, suffix: value, decimals: 0 };
  const decimals = match[1]!.includes(".")
    ? match[1]!.split(".")[1]!.length
    : 0;
  return { num: parseFloat(match[1]!), suffix: match[2]!, decimals };
}

/** Animated public stat (counts up the leading number, respects reduced motion via useCountUp). */
export function Stat({
  value,
  em,
  label,
}: {
  value: string;
  em?: boolean;
  label: string;
}) {
  const { num, suffix, decimals } = parseStat(value);
  const animatable = Number.isFinite(num);
  const scale = Math.pow(10, decimals);
  const counted = useCountUp(animatable ? Math.round(num * scale) : 0);
  const display = animatable
    ? `${(counted / scale).toFixed(decimals)}${suffix}`
    : value;
  return (
    <div className={styles.stat}>
      <b>{em ? <em>{display}</em> : display}</b>
      <span>{label}</span>
    </div>
  );
}

/** Top bar: owner sees a preview banner with a live/off pill; guests see the sign-in bar. */
export function PublicPreviewBar({
  owner,
  enabled,
}: {
  owner: boolean;
  enabled: boolean;
}) {
  if (owner) {
    return (
      <div className={styles.ownerBar}>
        <span className={styles.ownerLbl}>
          Preview of your public profile · this is how non-members see you
          <span className={`${styles.pill} ${enabled ? styles.pillOn : ""}`}>
            {enabled ? "Live" : "Off"}
          </span>
        </span>
        <div className={styles.guestActions}>
          <Button variant="ghost-dark" to={routes.accountProfile}>
            ← Back to your profile
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.guestBar}>
      <span className={styles.guestLbl}>
        You're not signed in · viewing the <b>public version</b> of this profile
      </span>
      <div className={styles.guestActions}>
        <Button variant="ghost-dark" to={routes.signIn}>
          Sign in
        </Button>
        <Button variant="primary" to={routes.requestInvite}>
          Request an invite
        </Button>
      </div>
    </div>
  );
}

/** The profile header — avatar, name, pronouns, bio, meta, and a members-only CTA. */
export function PublicProfileHead({
  profile,
  contributions,
}: {
  profile: Member;
  contributions: PublicContributions;
}) {
  const curatorSlug = curatorSlugForName(`${profile.first} ${profile.last}`);
  return (
    <header className={styles.head}>
      <Avatar
        initials={profile.initials}
        tint={profile.tint}
        src={profile.photo}
        size={160}
      />
      <div>
        <div className={styles.eyebrow}>Public profile · @{profile.slug}</div>
        <h1 className={styles.name}>
          {profile.first} <em>{profile.last}</em>
          {profile.verified && (
            <span className={styles.verified} title="Verified member">
              <svg viewBox="0 0 24 24">
                <polyline points="4,12.5 10,18 20,6" />
              </svg>
            </span>
          )}
        </h1>
        <p className={styles.pronouns}>
          {profile.pronouns && (
            <span className={styles.pron}>{profile.pronouns}</span>
          )}
          {profile.role}
        </p>
        {curatorSlug && (
          <Link
            className={styles.curatorLink}
            to={`${routes.cinemaCurator}/${curatorSlug}`}
          >
            ● Cinema curator — view programming profile →
          </Link>
        )}
        <p className={styles.bio}>{profile.bio}</p>
        <SocialLinksRow links={profile.socials} />

        <div className={styles.meta}>
          <span>
            <svg viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <b>{profile.hood}</b>, Lisbon
          </span>
          <span>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            Member since <b>{profile.since}</b>
          </span>
          {profile.vouchers.length > 0 && (
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M12 22s-8-4-8-12V4l8-2 8 2v6c0 8-8 12-8 12z" />
              </svg>
              <b>Vouched-for</b> by {profile.vouchers.length} members
            </span>
          )}
        </div>

        <div className={styles.ctaRow}>
          <Button variant="primary" to={routes.requestInvite}>
            Request an invite to connect
          </Button>
          <div className={styles.ctaNote}>{contributions.ctaNote}</div>
        </div>
      </div>
    </header>
  );
}

export function PublicList({
  heading,
  meta,
  cards,
  to,
}: {
  heading: ReactNode;
  meta: string;
  cards: PublicCard[];
  to: string;
}) {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>{heading}</h2>
        <span className={styles.secMeta}>{meta}</span>
      </div>
      <div className={styles.list}>
        {cards.map((card, i) => (
          <Link key={i} to={to} className={styles.card}>
            <div className={styles.cardKicker}>{card.kicker}</div>
            <div className={styles.cardTitle}>{card.title}</div>
            <div className={styles.cardMeta}>{card.meta}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function LockedSection({
  heading,
  meta,
  icon,
  title,
  body,
  action,
}: {
  heading: ReactNode;
  meta: string;
  icon: ReactNode;
  title: ReactNode;
  body: string;
  action: ReactNode;
}) {
  return (
    <section className={styles.sec}>
      <div className={styles.secH}>
        <h2>{heading}</h2>
        <span className={styles.secMeta}>{meta}</span>
      </div>
      <div className={styles.locked}>
        <div className={styles.lockedIc}>{icon}</div>
        <h3>{title}</h3>
        <p>{body}</p>
        {action}
      </div>
    </section>
  );
}

export function BottomCta({ firstName }: { firstName: string }) {
  return (
    <div className={styles.bottomCta}>
      <div>
        <h3>
          Want the <em>full picture?</em>
        </h3>
        <p>
          QueerPulse is invite-based — {firstName} can vouch for you if you've
          met in person. Or request an invite from us directly.
        </p>
      </div>
      <div className={styles.bottomCtaActions}>
        <Button variant="primary" to={routes.requestInvite}>
          Request an invite
        </Button>
        <Button variant="ghost-dark" to={routes.vouch}>
          Ask {firstName} to vouch
        </Button>
      </div>
    </div>
  );
}
