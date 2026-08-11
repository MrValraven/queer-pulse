import type { CSSProperties } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileHero } from "./SubprofileHero";
import { SubprofileSections } from "./SubprofileSections";
import { SubprofileSpotlight } from "./SubprofileSpotlight";
import { SubprofileSkinExtras } from "./SubprofileSkinExtras";
import { SubprofileAffiliations } from "./SubprofileAffiliations";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { usePersonaMotion } from "./usePersonaMotion";
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
 * spotlight/sections, and the foot — factored out of `SubprofilePage` so that
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
}: {
  data: PublicSubprofileView;
  skin: SkinFamily;
  mode: PersonaViewMode;
  skinVars: CSSProperties;
  onAction: (action: PersonaAction) => void;
  onOpenWorkAt: (index: number) => void;
  onOpenWorkItem: (item: SubprofileItemView) => void;
  onOpenGalleryPhoto: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();
  const rootRef = usePersonaMotion();

  return (
    <article
      className="pp"
      data-skin={skin}
      data-cover-bleed={data.coverUrl && data.skinData?.coverBleed ? "true" : undefined}
      style={skinVars}
      ref={rootRef}
    >
      <div className="pp-cover" data-has-cover={data.coverUrl ? "" : undefined}>
        <ImageSlot
          src={data.coverUrl || undefined}
          alt=""
          tint="plum"
          radius={0}
          width="100%"
          height="100%"
          className="ph"
          // Skins that always render the cover band (stage/studio/table) must
          // show a plain tinted frame when no image is uploaded, never the
          // literal "Image" placeholder caption. (page/practice hide the band,
          // and workshop hides it unless a cover was uploaded.)
          placeholder=""
          // The single above-the-fold hero image on the page — eager + high
          // priority so it isn't lazy-deferred as the LCP candidate.
          loading="eager"
          fetchPriority="high"
        />
      </div>

      <div className="wrap">
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
              <SubprofileSpotlight item={data.featured} skin={skin} mode={mode} accent={data.accent} />
            ))}

          <SubprofileSections
            persona={data}
            skin={skin}
            mode={mode}
            featuredHidden={Boolean(data.featured)}
            onOpenWork={onOpenWorkItem}
            onOpenGalleryPhoto={onOpenGalleryPhoto}
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
      </div>
    </article>
  );
}
