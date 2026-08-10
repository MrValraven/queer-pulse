import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { initialsFromName } from "../../shared/lib/initials";
import { Avatar, FeatureHelp } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { DEFAULT_ACCENT } from "./subprofilePresence.data";
import { personaPublicPath } from "./personaLinks.data";
import { SubprofileSocialRow } from "./SubprofileSocialRow";
import { SubprofileHeroActions } from "./SubprofileHeroActions";
import { SubprofileTitleBlock } from "./SubprofileTitleBlock";
import type { PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/** The design ground truth's `.pp-meta` count buttons carry a bare
 *  `class="metabtn"` that isn't in the ported `persona-skins.css` (only the
 *  prototype's separate, un-staged base/buttons stylesheet defined it — see
 *  `phase1-design/README.md`: map to the repo's own primitives, don't invent
 *  undefined classes). `.pp-meta`'s own quiet grey text styling already
 *  applies via inheritance; this only resets browser button chrome. */
const METABTN_STYLE: CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  margin: 0,
  font: "inherit",
  color: "inherit",
  cursor: "pointer",
};

/**
 * The persona page's `.pp-hero` — avatar, name, tagline, social row, actions
 * (delegated to `SubprofileHeroActions`), the endorsement/follower meta line,
 * the workshop-only title block (`SubprofileTitleBlock`, CSS-gated to that
 * one skin), and the bio. The owner tie / standalone address is shown here
 * (not the old `.ownerTie` block) — an unlinked, pseudonymous persona never
 * reveals who is behind it (spec §4).
 *
 * Same markup for every skin family — `data-skin` on the ancestor `.pp`
 * (set by the page host, Task 5) decides how it looks; this component never
 * branches on skin itself. `.pp-cover`/`.pp-runhead`/the article wrapper are
 * owned by the page host too, not this component.
 */
export function SubprofileHero({
  view,
  mode,
  onAction,
}: {
  view: PublicSubprofileView;
  mode: PersonaViewMode;
  onAction: (action: string) => void;
}) {
  const { t } = useTranslation();
  const accent = view.accent ?? DEFAULT_ACCENT;

  const linkedToOwner =
    view.linkVisibility === "linked" &&
    Boolean(view.ownerName) &&
    Boolean(view.ownerSlug);
  const interactive = mode !== "preview";

  return (
    <div className="pp-hero">
      <div className="pp-id">
        <Avatar
          className="pp-av"
          initials={initialsFromName(view.displayName, "?")}
          src={view.avatarUrl ?? undefined}
          tint="plum"
          size={112}
        />

        <div className="pp-text">
          <span className="pp-kind">{t(KIND_LABEL_KEYS[view.kind])}</span>
          <h1 className="pp-name">
            {view.displayName} <FeatureHelp id="subprofiles.detail" />
          </h1>
          {view.tagline && <p className="pp-tagline">{view.tagline}</p>}

          <SubprofileSocialRow
            links={view.socialLinks}
            accent={accent}
            interactive={interactive}
          />

          <SubprofileHeroActions view={view} mode={mode} onAction={onAction} />

          <div className="pp-meta">
            {view.endorsementCount > 0 && (
              <button
                type="button"
                style={METABTN_STYLE}
                disabled={!interactive}
                onClick={
                  interactive ? () => onAction("people:endorsers") : undefined
                }
              >
                {t("subprofiles:hero.endorse.count", {
                  count: view.endorsementCount,
                })}
              </button>
            )}
            <button
              type="button"
              style={METABTN_STYLE}
              disabled={!interactive}
              onClick={
                interactive ? () => onAction("people:followers") : undefined
              }
            >
              {t("subprofiles:hero.follow.count", { count: view.followerCount })}
            </button>
            {linkedToOwner && interactive ? (
              <Link className="pp-owner" to={`${routes.members}/${view.ownerSlug}`}>
                <Translation
                  i18nKey="subprofiles:page.ownerTie"
                  components={{ em: <em /> }}
                  values={{ name: view.ownerName ?? "" }}
                />
              </Link>
            ) : linkedToOwner ? (
              <span className="pp-owner">
                <Translation
                  i18nKey="subprofiles:page.ownerTie"
                  components={{ em: <em /> }}
                  values={{ name: view.ownerName ?? "" }}
                />
              </span>
            ) : (
              <span className="pp-owner">
                {t("subprofiles:hero.standalone", {
                  address: personaPublicPath(view),
                })}
              </span>
            )}
          </div>
        </div>

        <SubprofileTitleBlock view={view} mode={mode} />
      </div>

      {view.bio && <p className="pp-bio">{view.bio}</p>}
    </div>
  );
}
