import { Link } from "react-router-dom";
import { initialsFromName } from "../../shared/lib/initials";
import { Avatar, Eyebrow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { AffiliationDTO } from "./api/subprofiles.api";
import { useEndorsers } from "./api/useEndorsers";
import { AFFILIATION_ROLE_KEYS, affiliationHref } from "./affiliations.data";
import { PracticeReferrals } from "./skins/PracticeBlocks";
import type { PersonaAction, PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import type { SkinFamily } from "./subprofile-skins";
import styles from "./SubprofileAffiliations.module.css";

/** Up to this many endorser quotes preview in the foot before "See all N"
 *  hands off to the full list (`SubprofilePeopleModal`). */
const MAX_QUOTES = 2;

/** In `mode="preview"` this renders as a `<div>` look-alike instead of a
 *  `Link` — same content, no `to` — so a click in the Phase-3 editor's
 *  docked preview never leaves for the affiliated member/community/venue.
 *  `.partof>*` (persona-skins.css) styles either tag identically. */
function AffiliationRow({
  affiliation,
  interactive,
}: {
  affiliation: AffiliationDTO;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  const roleKey = AFFILIATION_ROLE_KEYS[affiliation.role];
  const content = (
    <>
      <Avatar
        initials={initialsFromName(affiliation.name, "?")}
        src={affiliation.imageUrl ?? undefined}
        alt=""
        tint="plum"
        size={30}
      />
      {affiliation.name}
      <span>{roleKey ? t(roleKey) : affiliation.role}</span>
    </>
  );
  if (!interactive) return <div>{content}</div>;
  return <Link to={affiliationHref(affiliation)}>{content}</Link>;
}

/**
 * The skin-aware persona-page foot (`.pp-foot`, per the Phase-1 design tree).
 * The practice skin swaps in `PracticeReferrals` (its fixed "we don't collect
 * public testimonials" boundary note) where every other skin shows up to two
 * endorser quotes (`.endo`) with a "See all N" trigger that opens the people
 * modal; the owner-chosen "Part of" affiliations (`.partof`) always render
 * alongside when present. Renders nothing when there's no content at all —
 * the practice skin always has content (its disclaimer is fixed), so it
 * never hits that early return.
 */
export function SubprofileAffiliations({
  persona,
  skin,
  mode,
  onAction,
}: {
  persona: PublicSubprofileView;
  skin: SkinFamily;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
}) {
  const { t } = useTranslation();
  const interactive = mode !== "preview";
  const showEndo = skin !== "practice";

  const { data: endorsersResult } = useEndorsers(
    persona.id,
    showEndo && persona.endorsementCount > 0,
  );
  const endorsers = endorsersResult?.endorsers ?? [];
  const hasEndo = showEndo && endorsers.length > 0;
  const hasAffiliations = persona.affiliations.length > 0;

  if (skin !== "practice" && !hasEndo && !hasAffiliations) return null;

  return (
    <div className="pp-foot">
      {skin === "practice" ? (
        <PracticeReferrals persona={persona} />
      ) : hasEndo ? (
        <div className="endo">
          {endorsers.slice(0, MAX_QUOTES).map((endorser) => {
            const who = (
              <>
                <Avatar
                  initials={initialsFromName(endorser.name, "?")}
                  src={endorser.avatarUrl ?? undefined}
                  alt=""
                  tint="plum"
                  size={26}
                />
                {endorser.name}
              </>
            );
            return (
              <div key={endorser.slug}>
                <p className="endo-q">
                  “{endorser.note || t("subprofiles:peopleModal.noNote")}”
                </p>
                {interactive ? (
                  <Link
                    className="endo-who"
                    to={`${routes.members}/${endorser.slug}`}
                  >
                    {who}
                  </Link>
                ) : (
                  <span className="endo-who">{who}</span>
                )}
              </div>
            );
          })}
          {persona.endorsementCount > MAX_QUOTES && (
            <button
              type="button"
              className={styles.seeAll}
              disabled={!interactive}
              onClick={
                interactive ? () => onAction("people:endorsers") : undefined
              }
            >
              {t("subprofiles:foot.seeAllEndorsements", {
                count: persona.endorsementCount,
              })}
            </button>
          )}
        </div>
      ) : null}

      {hasAffiliations && (
        <div className={styles.affiliations}>
          <Eyebrow>{t("subprofiles:affiliation.heading")}</Eyebrow>
          <div className="partof">
            {persona.affiliations.map((affiliation) => (
              <AffiliationRow
                key={`${affiliation.targetType}::${affiliation.targetSlug}`}
                affiliation={affiliation}
                interactive={interactive}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
