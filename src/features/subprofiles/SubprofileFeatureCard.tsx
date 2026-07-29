import { Link } from "react-router-dom";
import { FiArrowRight, FiLink2 } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { ACCENT_TOKENS, DEFAULT_ACCENT } from "./subprofilePresence.data";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import styles from "./SubprofileShowcase.module.css";

/**
 * The switcher's detail pane: the selected persona shown large, accent-tinted so
 * it reads as this persona's own identity. It is the module's single opener —
 * the switch rows only preview into here; this card is what links out.
 *
 * Accessible block-link technique (Adrian Roselli / Inclusive Components): the
 * real <a> is on the persona name only, and its ::after (in CSS) stretches the
 * hitbox across the whole card. A screen reader announces one concise link (the
 * persona name), not the card's whole text. The visible "View persona →" is a
 * cue, not a second control, so there is only ever one link here.
 *
 * Re-keyed on `persona.slug` so switching cross-fades the content in
 * (motion-gated in CSS).
 */
export function SubprofileFeatureCard({
  persona,
  href,
}: {
  persona: PublicSubprofileView;
  href: string;
}) {
  const { t } = useTranslation();
  const accent = persona.accent ?? DEFAULT_ACCENT;
  const { tint, on } = ACCENT_TOKENS[accent];
  const linkCount = persona.socialLinks?.length ?? 0;
  const isOpenToCollabs = persona.availability === "open_to_collabs";

  return (
    <article
      className={styles.feature}
      style={{
        ["--accent-tint" as string]: tint,
        ["--accent-on" as string]: on,
      }}
    >
      <div key={persona.slug} className={styles.featureInner}>
        <div className={styles.featureTop}>
          <Avatar
            initials={initialsFromName(persona.displayName, "?")}
            src={persona.avatarUrl ?? undefined}
            tint="plum"
            size={56}
            className={styles.featureAvatar}
          />
          <span className={styles.kindBadge}>
            {t(KIND_LABEL_KEYS[persona.kind])}
          </span>
        </div>

        <h3 className={styles.featureName}>
          <Link className={styles.featureLink} to={href}>
            {persona.displayName}
          </Link>
        </h3>

        {persona.tagline && (
          <p className={styles.featureTagline}>{persona.tagline}</p>
        )}

        <div className={styles.featureFoot}>
          <div className={styles.metaGroup}>
            {isOpenToCollabs && (
              <span className={styles.metaChip}>
                <span className={styles.dot} aria-hidden />
                {t("subprofiles:card.openToCollabs")}
              </span>
            )}
            {linkCount > 0 && (
              <span className={styles.metaChip}>
                <FiLink2 aria-hidden />
                {t("subprofiles:card.linkCount", { count: linkCount })}
              </span>
            )}
          </div>
          <span className={styles.viewCue}>
            {t("subprofiles:alsoAs.viewPersona")}
            <FiArrowRight aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );
}
