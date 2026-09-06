import { useId, useState } from "react";
import { nestedPersonaPath, routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  PublicSubprofileView,
  SubprofileOwnerMeta,
} from "./api/subprofiles.adapters";
import { SubprofileEditButton } from "./SubprofileEditButton";
import { SubprofileFeatureCard } from "./SubprofileFeatureCard";
import { SubprofileMobileRow } from "./SubprofileMobileRow";
import styles from "./SubprofileShowcase.module.css";

/**
 * The mobile (below 760px) reading of "Also working as": the desktop
 * hero-beside-switch-list split falls apart stacked on a phone (the hero
 * scrolls off-screen the moment a row further down the list is picked), so
 * below the breakpoint this renders a single-column accordion instead — one
 * persona expanded at a time, its full `SubprofileFeatureCard` (real Visit
 * link included) mounted right where the visitor tapped. No off-screen jump,
 * no scrolling back to reach the action.
 *
 * A lone persona skips the accordion chrome entirely — there is nothing to
 * pick between, so it renders as just the expanded card (mirrors the
 * desktop path's single-persona case).
 *
 * `isSelf`/`ownerMetaBySlug` mirror the desktop split path exactly (same
 * props, same source in `SubprofileShowcase`) so a signed-in owner gets the
 * same Edit control, status/visibility badges, disabled Follow/Endorse
 * (`isOwnerViewing`), and "Add another persona" affordance on a phone that they
 * get on desktop — the owner invariant is not viewport-scoped.
 */
export function SubprofileShowcaseMobile({
  personas,
  ownerSlug,
  isSelf = false,
  previewing = false,
  ownerMetaBySlug,
}: {
  personas: PublicSubprofileView[];
  ownerSlug: string;
  isSelf?: boolean;
  /** Owner previewing their own profile as a visitor — suppresses owner
   *  controls even when `viewerIsMember` is true (live mode). Mirrors the
   *  desktop `SubprofileShowcase` prop. */
  previewing?: boolean;
  ownerMetaBySlug?: Map<string, SubprofileOwnerMeta>;
}) {
  const { t } = useTranslation();
  const [expandedSlug, setExpandedSlug] = useState(personas[0]?.slug ?? "");
  const detailIdBase = useId();
  const detailId = (slug: string) => `${detailIdBase}-detail-${slug}`;

  // `.soloAddAnother` (`align-self: flex-start`) keeps this from stretching
  // to the accordion's full width — `.mobileAccordion` doesn't override
  // `align-items`, so a flex column defaults every child to stretch.
  const addAnother = isSelf ? (
    <Button
      variant="ghost"
      size="md"
      to={routes.subprofilesDashboard}
      className={styles.soloAddAnother}
    >
      {t("subprofiles:alsoAs.addAnother")}
    </Button>
  ) : null;

  if (personas.length <= 1) {
    const persona = personas[0];
    if (!persona) return null;
    const meta = ownerMetaBySlug?.get(persona.slug);
    // A co-owner sees Edit here even when viewing a co-owner's profile
    // (`isSelf` false) — `viewerIsMember` on the public DTO is the signal.
    // Suppressed while the owner previews their own profile as a visitor.
    const canEdit = !previewing && (isSelf || persona.viewerIsMember);
    return (
      <div className={styles.mobileAccordion}>
        <SubprofileFeatureCard
          persona={persona}
          // Addressed by the persona's OWN `ownerSlug`, which the server
          // resolves per persona to its CREATOR's profile slug. Same rule as
          // the desktop path in `SubprofileShowcase`: a co-owned persona shows
          // on every co-owner's profile while the nested route resolves
          // `slug` + creator only, so building the link from whichever profile
          // is being viewed 404s, and, where that co-owner has a persona of
          // their own under the same slug, opens the OTHER persona. The
          // `ownerSlug` prop stays as the fallback for the self view, whose
          // owner list carries no per-persona owner.
          href={nestedPersonaPath(persona.ownerSlug ?? ownerSlug, persona.slug)}
          ownerControls={
            canEdit ? (
              <SubprofileEditButton subprofileId={meta?.id ?? persona.id} />
            ) : undefined
          }
          status={meta?.status}
          visibility={meta?.visibility}
          isOwnerViewing={isSelf}
        />
        {addAnother}
      </div>
    );
  }

  return (
    <div className={styles.mobileAccordion}>
      {personas.map((persona) => {
        const isExpanded = persona.slug === expandedSlug;
        const meta = ownerMetaBySlug?.get(persona.slug);
        // A co-owner sees Edit here even when viewing a co-owner's profile
        // (`isSelf` false) — `viewerIsMember` on the public DTO is the signal.
        // Suppressed while the owner previews their own profile as a visitor.
        const canEdit = !previewing && (isSelf || persona.viewerIsMember);
        return (
          <SubprofileMobileRow
            key={persona.slug}
            persona={persona}
            isExpanded={isExpanded}
            detailId={detailId(persona.slug)}
            onExpand={() => setExpandedSlug(persona.slug)}
            status={meta?.status}
            visibility={meta?.visibility}
          >
            <SubprofileFeatureCard
              persona={persona}
              // Per-persona creator slug, same rule as the single-persona
              // branch above and as the desktop hero.
              href={nestedPersonaPath(
                persona.ownerSlug ?? ownerSlug,
                persona.slug,
              )}
              ownerControls={
                canEdit ? (
                  <SubprofileEditButton subprofileId={meta?.id ?? persona.id} />
                ) : undefined
              }
              status={meta?.status}
              visibility={meta?.visibility}
              isOwnerViewing={isSelf}
            />
          </SubprofileMobileRow>
        );
      })}
      {addAnother}
    </div>
  );
}
