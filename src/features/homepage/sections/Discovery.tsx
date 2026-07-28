import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  type AvatarTint,
  Button,
  Reveal,
  Tag,
  TagRow,
} from "../../../shared/components/ui";
import { usePrefersReducedMotion, useSwipe } from "../../../shared/hooks";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../../shared/staff/MemberStaffBadge";
import { routes } from "../../../app/routeMap";
import { members } from "../data/members";
import type { Member } from "../data/types";
import { featuredSpotlights, highlightRowKeys } from "./Discovery.data";
import styles from "./Discovery.module.css";

/** Maps a member's avatar tint to the featured face's tint class (photo bg + label). */
const tintClass: Record<AvatarTint, string | undefined> = {
  coral: styles.tCoral,
  jade: styles.tJade,
  plum: styles.tPlum,
  default: styles.tPlum,
  auth: styles.tPlum,
};

type Spotlight = { member: Member; quote: string };

const byKey = new Map(members.map((m) => [m.key, m] as const));

const spotlights: Spotlight[] = featuredSpotlights
  .map((s) => {
    const member = byKey.get(s.key);
    return member ? { member, quote: s.quote } : undefined;
  })
  .filter((s): s is Spotlight => Boolean(s));

const rows = highlightRowKeys
  .map((key) => byKey.get(key))
  .filter((m): m is Member => Boolean(m));

const profilePath = (member: Member) => `${routes.members}/${member.key}`;

/** A tall, face-cropped portrait for the featured card (Unsplash-aware). */
function portraitSrc(src?: string): string | undefined {
  if (!src) return undefined;
  if (!src.includes("unsplash.com")) return src;
  const url = new URL(src);
  url.searchParams.set("w", "640");
  url.searchParams.set("h", "800");
  url.searchParams.set("fit", "crop");
  url.searchParams.set("crop", "faces");
  url.searchParams.set("auto", "format");
  url.searchParams.set("q", "80");
  return url.toString();
}

const ROTATE_MS = 5500;

/** One featured member: big portrait on the left, their story on the right. */
function SpotlightFace({ member, quote }: Spotlight) {
  const { t } = useTranslation();
  const to = profilePath(member);
  const portrait = portraitSrc(member.photo);

  return (
    <div
      className={[styles.face, tintClass[member.tint]]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.featPhoto}>
        {portrait ? (
          <img src={portrait} alt={member.name} referrerPolicy="no-referrer" />
        ) : (
          <span className={styles.photoFallback} aria-hidden>
            {member.initials}
          </span>
        )}
        {member.verified && (
          <span className={styles.photoVerified}>
            <svg
              width={13}
              height={13}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <polyline
                points="20 6 9 17 4 12"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("homepage:discovery.verifiedBadge")}
          </span>
        )}
      </div>

      <div className={styles.featContent}>
        <span className={styles.capMeta}>
          {t("homepage:discovery.featuredMember")}
        </span>
        <span className={styles.nameRow}>
          <Link to={to} className={styles.nameLink}>
            <h3 className={styles.name}>{member.name}</h3>
          </Link>
          <MemberStaffBadge slug={member.key} />
        </span>
        <p className={styles.role}>
          {member.role} · {member.hood}
        </p>
        <p className={styles.quote}>{quote}</p>

        <TagRow className={styles.featTags}>
          {member.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </TagRow>

        <div className={styles.featFoot}>
          {member.verified && (
            <span className={styles.vouch}>
              {t("homepage:discovery.vouchedBy", { name: member.vouchedBy })}
            </span>
          )}
          {/* The card is a teaser: send people to the profile to read the full
              story first. Reaching out happens from there, so the Connect modal
              has one entry point instead of two. */}
          <Link to={to} className={styles.sayHi}>
            {t("homepage:discovery.viewProfile")} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturedSpotlightCard({ items }: { items: Spotlight[] }) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const [view, setView] = useState<{ active: number; prev: number | null }>({
    active: 0,
    prev: null,
  });
  const [paused, setPaused] = useState(false);
  const { active, prev } = view;

  // Swap to `next`, keeping the outgoing member as a fading overlay.
  const select = useCallback(
    (next: number) => {
      setView((v) =>
        next === v.active
          ? v
          : { active: next, prev: reducedMotion ? null : v.active },
      );
    },
    [reducedMotion],
  );

  // Touch-swipe left/right to step between members. Once the visitor takes
  // control by swiping, stop the auto-rotate so it doesn't pull the card away
  // mid-browse (`paused` already gates the rotate effect below).
  const step = useCallback(
    (delta: number) => {
      if (items.length <= 1) return;
      setPaused(true);
      setView((v) => ({
        active: (v.active + delta + items.length) % items.length,
        prev: reducedMotion ? null : v.active,
      }));
    },
    [items.length, reducedMotion],
  );
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => step(1),
    onSwipeRight: () => step(-1),
  });

  useEffect(() => {
    if (reducedMotion || paused || items.length <= 1) return;
    const id = setTimeout(
      () =>
        setView((v) => ({
          active: (v.active + 1) % items.length,
          prev: v.active,
        })),
      ROTATE_MS,
    );
    return () => clearTimeout(id);
  }, [active, paused, reducedMotion, items.length]);

  const current = items[active];
  if (!current) return null;
  const previous = prev !== null ? items[prev] : undefined;

  return (
    <article
      className={styles.feat}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.spot} {...swipeHandlers}>
        <SpotlightFace member={current.member} quote={current.quote} />
        {previous && (
          <div
            key={previous.member.key}
            className={styles.spotOverlay}
            aria-hidden
            inert
            onAnimationEnd={() => setView((v) => ({ ...v, prev: null }))}
          >
            <SpotlightFace member={previous.member} quote={previous.quote} />
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div
          className={styles.dots}
          aria-label={t("homepage:discovery.featuredMembersAria")}
        >
          {items.map((item, index) => (
            <button
              key={item.member.key}
              type="button"
              className={[styles.navDot, index === active && styles.navDotOn]
                .filter(Boolean)
                .join(" ")}
              aria-label={t("homepage:discovery.featureMemberAria", {
                name: item.member.name,
              })}
              aria-current={index === active}
              onClick={() => select(index)}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <Link to={profilePath(member)} className={styles.rowE}>
      <Avatar
        src={member.photo}
        initials={member.initials}
        tint={member.tint}
        size={48}
        verified={member.verified}
        alt={member.name}
      />
      <span className={styles.rowMeta}>
        <span className={styles.nameRow}>
          <span className={styles.rowName}>{member.name}</span>
          <MemberStaffBadge slug={member.key} />
        </span>
        <span className={styles.rowSub}>
          {member.role} · {member.hood}
        </span>
      </span>
      <span className={styles.arrow} aria-hidden>
        →
      </span>
    </Link>
  );
}

export function Discovery() {
  const { t } = useTranslation();

  return (
    <section className={styles.discovery} id="discovery">
      <div className="wrap">
        <Reveal className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden />
          {t("homepage:discovery.eyebrow", { count: 520 })}
        </Reveal>
        <Reveal as="h2" className={styles.display} delay={60}>
          <Translation
            i18nKey="homepage:discovery.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.sub} delay={120}>
          {t("homepage:discovery.sub")}
        </Reveal>

        <div className={styles.eGrid}>
          {spotlights.length > 0 && (
            <Reveal delay={160} className={styles.featCol}>
              <FeaturedSpotlightCard items={spotlights} />
            </Reveal>
          )}
          <div className={styles.stack}>
            {rows.map((member, index) => (
              <Reveal key={member.key} delay={200 + index * 70}>
                <MemberRow member={member} />
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className={styles.frameFoot} delay={280}>
          <Button to={routes.members}>
            {t("homepage:discovery.exploreMembersCta")}
          </Button>
          <span className={styles.footNote}>
            {t("homepage:discovery.footNote")}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
