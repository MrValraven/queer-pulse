import type { CSSProperties } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileCoverBand } from "./SubprofileCoverBand";
import { SubprofileHero } from "./SubprofileHero";
import { SubprofileSections } from "./SubprofileSections";
import { SubprofileSpotlight } from "./SubprofileSpotlight";
import { SubprofileSkinExtras } from "./SubprofileSkinExtras";
import { SubprofileAffiliations } from "./SubprofileAffiliations";
import { PersonaRightsFooter } from "./rights/PersonaRightsFooter";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { usePersonaMotion } from "./usePersonaMotion";
import { PracticeBody } from "./skins/PracticeBody";
// The global `.pp*` skin styles for the whole persona tree. Imported here (the
// lazy renderer shared by the public page AND the editor preview) rather than
// globally, so Vite folds ~its weight into the persona route chunk instead of
// the app-wide bundle. Must precede persona-motion.css (which layers on top of
// these same selectors — see that file's load-order note).
import "./persona-skins.css";
import "./persona-motion.css";
import type { PersonaAction, PersonaViewMode } from "./personaSkinRender";
import type { PublicSubprofileView, SubprofileItemView } from "./api/subprofiles.adapters";
import type { SkinFamily } from "./subprofile-skins";

/**
 * The skinned `.pp` tree itself — cover, per-slot `SkinExtras`, hero,
 * spotlight/sections, the foot and the page's single `PersonaRightsFooter`
 * — factored out of `SubprofilePage` so that
 * component stays under the repo's per-component line budget. Purely
 * presentational: all data comes from `data`, all interactivity is
 * delegated back up via `onAction`/`onOpenWorkAt`/`onOpenWorkItem`.
 */
export function SubprofilePageBody({
  data,
  skin,
  mode,
  skinVars,
  onAction,
  onOpenWorkAt,
  onOpenWorkItem,
  onOpenGalleryPhoto,
  onOpenPoem,
  coverRise = false,
}: {
  data: PublicSubprofileView;
  skin: SkinFamily;
  mode: PersonaViewMode;
  skinVars: CSSProperties;
  onAction: (action: PersonaAction) => void;
  onOpenWorkAt: (index: number) => void;
  onOpenWorkItem: (item: SubprofileItemView) => void;
  onOpenGalleryPhoto: (item: SubprofileItemView) => void;
  onOpenPoem: (item: SubprofileItemView) => void;
  /** Let the banner run up THROUGH the page's reserved nav band to the very
   *  top of the page, under the floating pill nav. Only the real persona page
   *  passes this — the editor's docked preview and the mobile preview render
   *  this same tree inside a card, where pulling the cover out of its own box
   *  would just spill it over whatever sits above. Off unless asked. */
  coverRise?: boolean;
}) {
  const { t } = useTranslation();
  const rootRef = usePersonaMotion();

  return (
    <article
      className="pp"
      data-skin={skin}
      data-cover-bleed={data.coverUrl && data.skinData?.coverBleed ? "true" : undefined}
      data-cover-rise={coverRise ? "true" : undefined}
      style={skinVars}
      ref={rootRef}
    >
      <SubprofileCoverBand data={data} mode={mode} />

      <div className="wrap">
        {skin === "practice" ? (
          <PracticeBody
            data={data}
            mode={mode}
            onAction={onAction}
            onOpenWorkItem={onOpenWorkItem}
            onOpenGalleryPhoto={onOpenGalleryPhoto}
            onOpenPoem={onOpenPoem}
          />
        ) : (
          <>
            <SubprofileSkinExtras
              persona={data}
              skin={skin}
              slot="top"
              mode={mode}
              onOpenWork={onOpenWorkAt}
            />

            <div className="pp-runhead">
              <span>{data.displayName}</span>
              <span>{t(KIND_LABEL_KEYS[data.kind])}</span>
            </div>

            <SubprofileHero view={data} mode={mode} onAction={onAction} />
            <SubprofileSkinExtras persona={data} skin={skin} slot="afterBio" mode={mode} />

            <div className="pp-body">
              {data.featured &&
                (skin === "table" &&
                (data.featured.structured?.courses?.length ?? 0) > 0 ? (
                  // Table skin's MenuCard only has markup for `structured.courses`;
                  // a featured item without courses would otherwise render
                  // nowhere (still hidden from its section by `featuredHidden`
                  // below), so fall back to the generic Spotlight for it.
                  <SubprofileSkinExtras
                    persona={data}
                    skin={skin}
                    slot="spotlight"
                    mode={mode}
                    featured={data.featured}
                  />
                ) : (
                  <SubprofileSpotlight
                    item={data.featured}
                    skin={skin}
                    mode={mode}
                    accent={data.accent}
                  />
                ))}

              <SubprofileSections
                persona={data}
                skin={skin}
                mode={mode}
                featuredHidden={Boolean(data.featured)}
                onOpenWork={onOpenWorkItem}
                onOpenGalleryPhoto={onOpenGalleryPhoto}
                onOpenPoem={onOpenPoem}
              />

              <SubprofileSkinExtras
                persona={data}
                skin={skin}
                slot="end"
                mode={mode}
                featured={data.featured}
                onOpenWork={onOpenWorkAt}
              />
            </div>

            <SubprofileAffiliations persona={data} skin={skin} mode={mode} onAction={onAction} />
          </>
        )}

        {/* One copyright + provenance notice for the whole page, after every
            skin branch. Never in the editor's docked preview, mirroring how
            the per-item footer used to gate itself on `interactive`. */}
        {mode !== "preview" && <PersonaRightsFooter persona={data} />}
      </div>
    </article>
  );
}
