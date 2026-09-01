import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, ImageSlot, Tag, TagRow } from "../../shared/components/ui";
import { initialsFromName } from "../../shared/lib/initials";
import { safeHref } from "../../shared/lib/safeHref";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { KIND_LABEL_KEYS, personaNameBesideCraft } from "./subprofile-kinds";
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
  /** Owner-only controls (edit / reorder), handed to the card footer so they
   *  sit on the same action line as Visit rather than floating up beside the
   *  name. `undefined` on the public path (the default) — this card never
   *  fetches or infers ownership itself. */
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
  /** Owner-only status (draft/published), rendered as a badge in the identity
   *  block's meta row, beside the handle. `undefined` on the public path — a
   *  visitor never sees drafts. */
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
  // The compact hero's cover always runs edge-to-edge, cancelling the card
  // padding and squaring its corners (clipped back into the card's rounded top
  // by `.feature`'s overflow) — the same full-bleed band as the persona page.
  // Only the wide/landscape layout opts out, where the cover is a full-height
  // side panel rather than a top band.
  const coverBleed = !isWide;
  // Cancel exactly `.feature`'s padding on three sides so the band reaches the
  // card edge. `align-self: stretch` + `width: auto` (below) lets the cover
  // fill the padding box; the shared `--feature-pad` var keeps this in lockstep
  // with the card's actual inset.
  const bleedStyle: CSSProperties | undefined = coverBleed
    ? {
        alignSelf: "stretch",
        marginTop: "calc(-1 * var(--feature-pad))",
        marginInline: "calc(-1 * var(--feature-pad))",
      }
    : undefined;

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
            // Same reason as the persona page's own banner: the crop was framed
            // at 3:1 and this strip is nowhere near it (a bled band is ~4.7:1,
            // the wide layout's side panel is portrait), so the rect is
            // honoured as a focal point instead of being reproduced exactly.
            focus={persona.coverCrop}
            // Bleed squares the corners (the card's rounded top re-clips it);
            // contained keeps the inset rounded strip.
            radius={coverBleed ? 0 : 14}
            // Bleed drops `width: 100%` (which negative margins would only
            // offset, not widen) in favour of `align-self: stretch` + auto,
            // set together in `bleedStyle`.
            width={coverBleed ? "auto" : "100%"}
            // Wide: fill the grid cell's height as a side panel (the details
            // column sets the height, the stretched cell matches it). A bled
            // band gets a touch more height for presence; contained keeps the
            // original fixed strip.
            height={isWide ? "100%" : coverBleed ? 150 : 110}
            style={bleedStyle}
            className={styles.cover}
          />
        )}

        <div className={styles.featureBody}>
          {/* Name and tagline live in a column beside the avatar (the same
              identity-block shape as a switch-list row), so the avatar anchors
              them rather than floating above a second, further-left text edge.
              The craft leads the tagline instead of wearing its own badge, and
              `.featureKind` gives it back the weight the pill used to carry —
              without it the craft would sink into muted secondary text. */}
          <div className={styles.featureTop}>
            <Avatar
              initials={initialsFromName(persona.displayName, "?")}
              src={persona.avatarUrl ?? undefined}
              tint="plum"
              size={64}
              className={styles.featureAvatar}
            />
            <div className={styles.featureIdentity}>
              <h3 className={styles.featureName}>
                <Link className={styles.featureLink} to={href}>
                  {personaNameBesideCraft({
                    displayName: persona.displayName,
                    kind: persona.kind,
                    ownerName: persona.ownerName,
                  })}
                </Link>
              </h3>

              <p className={styles.featureTagline}>
                <span className={styles.featureKind}>
                  {t(KIND_LABEL_KEYS[persona.kind])}
                </span>
                {persona.tagline && (
                  <>
                    {" \u00b7 "}
                    {persona.tagline}
                  </>
                )}
              </p>

              {/* SubprofileOwnerBadges renders nothing on the public path, so
                  the row is gated on having real content — otherwise every
                  visitor gets an empty flex row taking up the gap. */}
              {(persona.handle || status || visibility) && (
                <div className={styles.featureIdentityMeta}>
                  <SubprofileOwnerBadges
                    status={status}
                    visibility={visibility}
                    className={styles.ownerBadges}
                  />
                  {persona.handle && (
                    <span className={styles.handle}>@{persona.handle}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {persona.featured && (
            <SubprofileFeaturedStrip item={persona.featured} accent={accent} />
          )}

          {persona.affiliations.length > 0 && (
            <TagRow className={styles.affiliations}>
              {persona.affiliations.map((affiliation) => (
                <Tag
                  key={`${affiliation.targetType}-${affiliation.targetSlug}`}
                >
                  {affiliation.role
                    ? `${affiliation.role} · ${affiliation.name}`
                    : affiliation.name}
                </Tag>
              ))}
            </TagRow>
          )}

          <SubprofileAvailability
            value={persona.availability}
            accent={accent}
          />

          <SubprofileSocialRow links={persona.socialLinks} accent={accent} />

          <SubprofileCardFooter
            persona={persona}
            href={href}
            ctaHref={ctaHref}
            isOwnerViewing={isOwnerViewing}
            ownerControls={ownerControls}
          />
        </div>
      </div>
    </article>
  );
}
