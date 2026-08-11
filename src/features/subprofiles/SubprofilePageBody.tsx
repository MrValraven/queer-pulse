import type { CSSProperties } from "react";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileHero } from "./SubprofileHero";
import { SubprofileSections } from "./SubprofileSections";
import { SubprofileSpotlight } from "./SubprofileSpotlight";
import { SubprofileSkinExtras } from "./SubprofileSkinExtras";
import { SubprofileAffiliations } from "./SubprofileAffiliations";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import type { PersonaViewMode } from "./personaSkinRender";
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
}: {
  data: PublicSubprofileView;
  skin: SkinFamily;
  mode: PersonaViewMode;
  skinVars: CSSProperties;
  onAction: (action: string) => void;
  onOpenWorkAt: (index: number) => void;
  onOpenWorkItem: (item: SubprofileItemView) => void;
}) {
  const { t } = useTranslation();

  return (
    <article className="pp" data-skin={skin} style={skinVars}>
      <div className="pp-cover" data-has-cover={data.coverUrl ? "" : undefined}>
        <ImageSlot
          src={data.coverUrl || undefined}
          alt=""
          tint="plum"
          radius={0}
          width="100%"
          height="100%"
          className="ph"
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
              <SubprofileSpotlight item={data.featured} skin={skin} mode={mode} />
            ))}

          <SubprofileSections
            persona={data}
            skin={skin}
            mode={mode}
            featuredHidden={Boolean(data.featured)}
            onOpenWork={onOpenWorkItem}
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
