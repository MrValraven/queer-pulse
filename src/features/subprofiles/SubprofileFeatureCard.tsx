import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, ImageSlot, Tag, TagRow } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { safeHref } from "../../shared/lib/safeHref";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { accentStyle, DEFAULT_ACCENT } from "./subprofilePresence.data";
import { SubprofileFeaturedStrip } from "./SubprofileFeaturedStrip";
import { SubprofileAvailability } from "./SubprofileAvailability";
import { SubprofileSocialRow } from "./SubprofileSocialRow";
import { SubprofileOwnerBadges } from "./SubprofileOwnerBadges";
import { SubprofileCardFooter } from "./SubprofileCardFooter";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileStatus, Visibility } from "./api/subprofiles.api";
import styles from "./SubprofileShowcase.module.css";

interface SubprofileFeatureCardProps {
  persona: PublicSubprofileView;
  href: string;
  /** Cross-fade direction relative to the previously active persona — set by
   *  `SubprofileShowcase` when the visitor picks a different row. Applied as
   *  `data-direction` on `.featureInner`, which selects the matching
   *  `qpPersonaInDown`/`qpPersonaInUp` entrance keyframe (or a plain fade for
   *  `"none"`, e.g. first render). */
  direction?: "up" | "down" | "none";
  /** Owner-only controls (edit / reorder), rendered inline when the viewer is
   *  the persona's owner. `undefined` on the public path (the default) — this
   *  card never fetches or infers ownership itself. */
  ownerControls?: ReactNode;
  /** DOM id for the hero root, set by `SubprofileShowcase` so the switch
   *  list's tabs can `aria-controls` this element. `undefined` when there's
   *  no switch list (a lone persona) — a `tabpanel` role without an owning
   *  `tablist` would be invalid ARIA, so `role`/`ariaLabelledby` are omitted
   *  together with it in that case. */
  id?: string;
  /** `"tabpanel"` when a switch list owns this hero; omitted otherwise. */
  role?: "tabpanel";
  /** Id of the currently-selected tab in the switch list, mirrored here as
   *  `aria-labelledby` so assistive tech announces which persona this panel
   *  belongs to. */
  ariaLabelledby?: string;
  /** Owner-only status (draft/published), rendered as a badge near the kind
   *  badge. `undefined` on the public path — a visitor never sees drafts. */
  status?: SubprofileStatus;
  /** Owner-only visibility (open/network/private), rendered alongside `status`. */
  visibility?: Visibility;
  /** Whether the signed-in viewer owns this persona — passed through to
   *  Follow/Endorse so an owner can't follow/endorse their own persona.
   *  Defaults to `false` (the public path never sets this itself). */
  isOwnerViewing?: boolean;
  /** `"wide"` lays the card out landscape — the cover becomes a full-height
   *  side panel beside the details instead of a strip on top — so a lone
   *  persona with a cover fills the section width rather than sitting in a
   *  half-empty capped column. Only ever passed for a single, cover-bearing
   *  persona on desktop (≥760px); everywhere else stays `"compact"`. When there
   *  is no cover this has no effect (the layout falls back to compact). */
  variant?: "compact" | "wide";
}

/**
 * The switcher's detail pane: the selected persona shown large, accent-tinted
 * so it reads as this persona's own identity, with every action independently
 * reachable — no single control speaks for the whole card. The persona name
 * is a plain link to the full persona page; the explicit "Visit" button below
 * repeats that same destination as a clearly-labelled, easy-to-hit control
 * (a stretched card-wide link would otherwise swallow the follow/endorse/CTA
 * controls beneath it into one unfocusable, unannounced hit target).
 *
 * Re-keyed on `persona.slug` so switching cross-fades the content in
 * (motion-gated in CSS).
 */
export function SubprofileFeatureCard({
  persona,
  href,
  direction = "none",
  ownerControls,
  id,
  role,
  ariaLabelledby,
  status,
  visibility,
  isOwnerViewing = false,
  variant = "compact",
}: SubprofileFeatureCardProps) {
  const { t } = useTranslation();
  const accent = persona.accent ?? DEFAULT_ACCENT;
  // Guard every member-supplied URL before it lands in an href — cover, CTA,
  // and (inside the child components) social links and the featured item.
  const coverHref = safeHref(persona.coverUrl);
  const ctaHref = safeHref(persona.ctaUrl);
  // The landscape layout only makes sense with a cover to anchor the side
  // panel — a "wide" persona with no cover quietly reads as compact.
  const isWide = variant === "wide" && Boolean(coverHref);

  return (
    <article
      id={id}
      role={role}
      aria-labelledby={ariaLabelledby}
      className={styles.feature}
      style={accentStyle(accent)}
    >
      <div
        key={persona.slug}
        className={styles.featureInner}
        data-direction={direction}
        data-layout={isWide ? "wide" : "compact"}
      >
        {coverHref && (
          <ImageSlot
            src={coverHref}
            alt=""
            tint="plum"
            radius={14}
            // Wide: fill the grid cell's height as a side panel (the details
            // column sets the height, the stretched cell matches it). Compact:
            // the original fixed strip on top.
            height={isWide ? "100%" : 110}
            className={styles.cover}
          />
        )}

        <div className={styles.featureBody}>
        <div className={styles.featureTop}>
          <Avatar
            initials={initialsFromName(persona.displayName, "?")}
            src={persona.avatarUrl ?? undefined}
            tint="plum"
            size={56}
            className={styles.featureAvatar}
          />
          <div className={styles.featureTopMeta}>
            <span className={styles.kindBadge}>
              {t(KIND_LABEL_KEYS[persona.kind])}
            </span>
            <SubprofileOwnerBadges
              status={status}
              visibility={visibility}
              className={styles.ownerBadges}
            />
            {persona.handle && (
              <span className={styles.handle}>@{persona.handle}</span>
            )}
          </div>
          {ownerControls && (
            <div className={styles.ownerControlsRow}>{ownerControls}</div>
          )}
        </div>

        <h3 className={styles.featureName}>
          <Link className={styles.featureLink} to={href}>
            {persona.displayName}
          </Link>
        </h3>

        {persona.tagline && (
          <p className={styles.featureTagline}>{persona.tagline}</p>
        )}

        {persona.featured && (
          <SubprofileFeaturedStrip item={persona.featured} accent={accent} />
        )}

        {persona.affiliations.length > 0 && (
          <TagRow className={styles.affiliations}>
            {persona.affiliations.map((affiliation) => (
              <Tag key={`${affiliation.targetType}-${affiliation.targetSlug}`}>
                {affiliation.role
                  ? `${affiliation.role} · ${affiliation.name}`
                  : affiliation.name}
              </Tag>
            ))}
          </TagRow>
        )}

        <SubprofileAvailability value={persona.availability} accent={accent} />

        <SubprofileSocialRow links={persona.socialLinks} accent={accent} />

        <SubprofileCardFooter
          persona={persona}
          href={href}
          ctaHref={ctaHref}
          isOwnerViewing={isOwnerViewing}
        />
        </div>
      </div>
    </article>
  );
}
