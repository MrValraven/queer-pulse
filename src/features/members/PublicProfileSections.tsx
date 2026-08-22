import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
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

/** Animated public stat (counts up the leading number, respects reduced motion via useCountUp).
 *  `labelKey` is a catalog key — the stat caption is platform chrome (a small,
 *  platform-defined set of stat types), not the fictional member's own words. */
export function Stat({
  value,
  em,
  labelKey,
}: {
  value: string;
  em?: boolean;
  labelKey: string;
}) {
  const { t } = useTranslation();
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
      <span>{t(labelKey)}</span>
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
  const { t } = useTranslation();
  if (owner) {
    return (
      <div className={styles.ownerBar}>
        <span className={styles.ownerLbl}>
          {t("members:publicProfile.preview.ownerLabel")}
          <span className={`${styles.pill} ${enabled ? styles.pillOn : ""}`}>
            {enabled
              ? t("members:publicProfile.pill.live")
              : t("members:publicProfile.pill.off")}
          </span>
          {/* The pill reads "On", not "Live": the preference persists but no
              unauthenticated profile endpoint exists, so nothing is published. */}
          <span className={styles.ownerNote}>
            {t("members:publicProfile.preview.notYet")}
          </span>
        </span>
        <div className={styles.guestActions}>
          <Button variant="ghost-dark" to={routes.accountProfile}>
            <FiArrowLeft aria-hidden />{" "}
            {t("members:publicProfile.preview.backToProfile")}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.guestBar}>
      <span className={styles.guestLbl}>
        <Translation
          i18nKey="members:publicProfile.preview.guestLabel"
          components={{ b: <b /> }}
        />
      </span>
      <div className={styles.guestActions}>
        <Button variant="ghost-dark" to={routes.signIn}>
          {t("common:cta.signIn")}
        </Button>
        <Button variant="primary" to={requestInvitePath("public_profile")}>
          {t("common:cta.requestInvite")}
        </Button>
      </div>
    </div>
  );
}

/**
 * The profile header: avatar, name, pronouns, bio, meta, and a members-only CTA.
 *
 * DEMO-ONLY. It takes the full in-app `Member` and renders the neighbourhood,
 * join year, vouch count and social links, none of which `GET
 * /public/profiles/:slug` serves. Its only caller is
 * `PublicProfileOwnPreviewDemo`; the live preview and the real public page both
 * go through `PublicProfilePublicView`, which is bound to the DTO instead. Do
 * not reach for this on a live path.
 */
export function PublicProfileHead({
  profile,
  contributions,
}: {
  profile: Member;
  contributions: PublicContributions;
}) {
  const { t } = useTranslation();
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
        <div className={styles.eyebrow}>
          {t("members:publicProfile.head.eyebrow", { slug: profile.slug })}
        </div>
        <h1 className={styles.name}>
          {profile.first} <em>{profile.last}</em>
          {profile.verified && (
            <span
              className={styles.verified}
              title={t("members:profile.hero.verifiedBadge")}
            >
              <svg viewBox="0 0 24 24">
                <polyline points="4,12.5 10,18 20,6" />
              </svg>
            </span>
          )}
        </h1>
        <p className={styles.pronouns}>
          <span>
            {profile.pronouns && (
              <span className={styles.pron}>{profile.pronouns}</span>
            )}
            {profile.role}
          </span>
          <MemberStaffBadge slug={profile.slug} size="lg" />
        </p>
        {curatorSlug && (
          <Link
            className={styles.curatorLink}
            to={`${routes.cinemaCurator}/${curatorSlug}`}
          >
            {t("members:profile.hero.curatorLink")}{" "}
            <FiArrowRight aria-hidden />
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
            <Translation
              i18nKey="members:publicProfile.head.location"
              components={{ b: <b /> }}
              values={{ hood: profile.hood }}
            />
          </span>
          <span>
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            <Translation
              i18nKey="members:publicProfile.head.memberSince"
              components={{ b: <b /> }}
              values={{ since: profile.since }}
            />
          </span>
          {profile.vouchers.length > 0 && (
            <span>
              <svg viewBox="0 0 24 24">
                <path d="M12 22s-8-4-8-12V4l8-2 8 2v6c0 8-8 12-8 12z" />
              </svg>
              <Translation
                i18nKey="members:publicProfile.head.vouchedFor"
                components={{ b: <b /> }}
                values={{ count: profile.vouchers.length }}
              />
            </span>
          )}
        </div>

        <div className={styles.ctaRow}>
          <Button variant="primary" to={requestInvitePath("public_profile")}>
            {t("members:publicProfile.head.requestInviteCta")}
          </Button>
          <div className={styles.ctaNote}>
            {t(contributions.ctaNoteKey, { firstName: profile.first })}
          </div>
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
        {cards.map((card) => (
          <Link
            key={`${card.kicker}-${card.meta}`}
            to={to}
            className={styles.card}
          >
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

/**
 * The "join us / vouch for {firstName}" footer.
 *
 * DEMO-ONLY, because of the second button: `routes.vouch` (`VouchPage`) only
 * has a candidate to vouch for in demo mode and renders an `EmptyState`
 * otherwise, so in live mode this invited a visitor to vouch for a named person
 * and then told them there was nothing to vouch for. Its only caller is
 * `PublicProfileOwnPreviewDemo`; the live surfaces use
 * `PublicProfilePublicView`'s request-invite footer instead. Bring the vouch CTA
 * back here once it can route into a real member's vouch flow.
 */
export function BottomCta({ firstName }: { firstName: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.bottomCta}>
      <div>
        <h3>
          <Translation
            i18nKey="members:publicProfile.bottomCta.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p>{t("members:publicProfile.bottomCta.body", { firstName })}</p>
      </div>
      <div className={styles.bottomCtaActions}>
        <Button variant="primary" to={requestInvitePath("public_profile")}>
          {t("common:cta.requestInvite")}
        </Button>
        <Button variant="ghost-dark" to={routes.vouch}>
          {t("members:publicProfile.bottomCta.vouchCta", { firstName })}
        </Button>
      </div>
    </div>
  );
}
