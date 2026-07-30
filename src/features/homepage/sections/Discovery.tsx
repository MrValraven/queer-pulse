import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  type AvatarTint,
  Button,
  Reveal,
  Tag,
  TagRow,
} from "../../../shared/components/ui";
import { usePrefersReducedMotion } from "../../../shared/hooks";
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
          <img
            src={portrait}
            alt={member.name}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
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
  const scrollRef = useRef<HTMLDivElement>(null);
  // Distinguishes our own scrollTo/scrollBy from a genuine finger scroll, so the
  // former neither pauses auto-rotate nor is mistaken for the user browsing.
  const programmaticRef = useRef(false);
  const settleTimerRef = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  const looping = items.length > 1 && !!firstItem && !!lastItem;
  // Clone the last slide before the first and the first after the last. A swipe
  // (or auto-advance) past either end lands on an identical-looking clone, then
  // we teleport back to the real slide once the scroll settles — a seamless
  // infinite loop that native scroll-snap can't do on its own.
  const slides =
    looping && firstItem && lastItem
      ? [lastItem, ...items, firstItem]
      : items;
  const firstRealOffset = looping ? 1 : 0;

  // Preload every featured portrait so a slide never loads (and flickers) as it
  // scrolls into view.
  useEffect(() => {
    for (const item of items) {
      const source = portraitSrc(item.member.photo);
      if (!source) continue;
      const image = new Image();
      image.src = source;
    }
  }, [items]);

  // Start parked on the first real slide (past the leading clone).
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element || !looping) return;
    programmaticRef.current = true;
    element.scrollTo({ left: element.clientWidth, behavior: "auto" });
  }, [looping]);

  const scrollToIndex = useCallback(
    (index: number, smooth: boolean) => {
      const element = scrollRef.current;
      if (!element) return;
      programmaticRef.current = true;
      element.scrollTo({
        left: (index + firstRealOffset) * element.clientWidth,
        behavior: smooth && !reducedMotion ? "smooth" : "auto",
      });
    },
    [firstRealOffset, reducedMotion],
  );

  // Auto-rotate always steps forward by one slide; the clone + teleport below
  // turns the last→first wrap into a short seamless scroll instead of a rewind.
  const advance = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    programmaticRef.current = true;
    element.scrollBy({
      left: element.clientWidth,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [reducedMotion]);

  // A genuine finger scroll stops the auto-rotate; once any scroll settles,
  // sync the active dot and teleport off either clone for the infinite loop.
  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    if (!programmaticRef.current) setPaused(true);
    if (settleTimerRef.current !== null) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = window.setTimeout(() => {
      const width = element.clientWidth || 1;
      const slot = Math.round(element.scrollLeft / width);
      // On a clone, teleport to the matching real slide. Keep `programmatic`
      // set through the teleport so its own scroll event isn't mistaken for the
      // user browsing (which would pause auto-rotate); the teleport's settle,
      // landing on a real slot, is what finally clears the flag.
      if (looping && slot === 0) {
        setActive(items.length - 1);
        programmaticRef.current = true;
        element.scrollTo({ left: items.length * width, behavior: "auto" });
        return;
      }
      if (looping && slot === items.length + 1) {
        setActive(0);
        programmaticRef.current = true;
        element.scrollTo({ left: width, behavior: "auto" });
        return;
      }
      setActive(slot - firstRealOffset);
      programmaticRef.current = false;
    }, 120);
  }, [looping, items.length, firstRealOffset]);

  // Keep the active slide aligned across a resize / orientation change.
  useEffect(() => {
    const onResize = () => scrollToIndex(active, false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, scrollToIndex]);

  useEffect(() => {
    if (reducedMotion || paused || items.length <= 1) return;
    const id = setTimeout(advance, ROTATE_MS);
    return () => clearTimeout(id);
  }, [active, paused, reducedMotion, items.length, advance]);

  if (items.length === 0) return null;

  return (
    <article
      className={styles.feat}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Native horizontal scroll-snap: the finger-follow + snap runs on the
          browser's compositor. Every member is a real, in-flow, equal-height
          slide, so nothing is recreated or resized mid-swipe. */}
      <div className={styles.spot} ref={scrollRef} onScroll={handleScroll}>
        {slides.map((slide, slideIndex) => {
          const isClone =
            looping &&
            (slideIndex === 0 || slideIndex === slides.length - 1);
          const isActive = !isClone && slideIndex - firstRealOffset === active;
          return (
            <div
              className={styles.slide}
              key={slideIndex}
              aria-hidden={!isActive}
              inert={!isActive}
            >
              <SpotlightFace member={slide.member} quote={slide.quote} />
            </div>
          );
        })}
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
              onClick={() => scrollToIndex(index, true)}
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
