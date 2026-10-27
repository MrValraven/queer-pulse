import { useMemo } from "react";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { PublicSubprofileView } from "../../../../subprofiles/api/subprofiles.adapters";
import type {
  SubprofileKind,
  SubprofilePublicDTO,
} from "../../../../subprofiles/api/subprofiles.api";
import { sectionShape } from "../../../../subprofiles/personaSkinRender";
import { TattooBody } from "../../../../subprofiles/skins/tattoo/TattooBody";
import { SubprofileHero } from "../../../../subprofiles/SubprofileHero";
import { SectionBody } from "../../../../subprofiles/SubprofileSections";
import { SubprofileSkinExtras } from "../../../../subprofiles/SubprofileSkinExtras";
import { SubprofileSpotlight } from "../../../../subprofiles/SubprofileSpotlight";
import {
  KIND_LABEL_KEYS,
  personaNameBesideCraft,
} from "../../../../subprofiles/subprofile-kinds";
import {
  skinFor,
  type SkinFamily,
} from "../../../../subprofiles/subprofile-skins";
import { SamplePersonaArticle } from "./SamplePersonaArticle";
import { toSamplePersonaView } from "./samplePersonaView";

/** Showcase frames are inert, so every persona callback goes nowhere. */
function ignorePersonaEvent() {}

/**
 * Whether this adapter can draw a kind. The practice family (the therapist
 * above all) has its own layouts that read live directories, so the
 * practitioners page composes those from their own leaf parts. Exported
 * beside the component on purpose: pages pick their sample kinds with it.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function isSamplePersonaPageKind(kind: SubprofileKind): boolean {
  return kind !== "therapist" && skinFor(kind) !== "practice";
}

/** The sections of a persona page, each in its `.pp-sec` with the real
 *  section renderer, minus the item the Spotlight already shows. */
function SampleSections({
  view,
  skin,
}: {
  view: PublicSubprofileView;
  skin: SkinFamily;
}) {
  const { t } = useTranslation();
  const featuredId = view.featured?.id ?? null;
  return view.sections.map((section) => {
    const items =
      featuredId !== null
        ? section.items.filter(
            (item) => !(item.isFeatured && item.id === featuredId),
          )
        : section.items;
    if (items.length === 0) return null;
    return (
      <section
        key={section.section}
        className="pp-sec"
        aria-labelledby={`pp-sec-${section.section}`}
      >
        <header>
          <h2 id={`pp-sec-${section.section}`}>{t(section.labelKey)}</h2>
          {items.length > 1 && (
            <span
              className="count"
              aria-label={t("subprofiles:section.countLabel", {
                count: items.length,
              })}
            >
              {items.length}
            </span>
          )}
        </header>
        <SectionBody
          shape={sectionShape(section.section, skin, items)}
          items={items}
          skin={skin}
          interactive={false}
          displayName={view.displayName}
          accent={view.accent ?? undefined}
          kind={view.kind}
        />
      </section>
    );
  });
}

/** The skinned page body for every non-tattoo kind this adapter draws. */
function SamplePersonaBody({
  view,
  skin,
}: {
  view: PublicSubprofileView;
  skin: SkinFamily;
}) {
  const { t } = useTranslation();
  const runheadName = personaNameBesideCraft({
    displayName: view.displayName,
    kind: view.kind,
    ownerName: view.ownerName,
  });
  return (
    <>
      <SubprofileSkinExtras
        persona={view}
        skin={skin}
        slot="top"
        mode="preview"
      />
      <div className="pp-runhead">
        <span>{runheadName}</span>
        <span>{t(KIND_LABEL_KEYS[view.kind])}</span>
      </div>
      <SubprofileHero
        view={view}
        mode="preview"
        onAction={ignorePersonaEvent}
      />
      <SubprofileSkinExtras
        persona={view}
        skin={skin}
        slot="afterBio"
        mode="preview"
      />
      <div className="pp-body">
        {view.featured && (
          <SubprofileSpotlight
            item={view.featured}
            skin={skin}
            mode="preview"
            accent={view.accent}
          />
        )}
        <SampleSections view={view} skin={skin} />
        <SubprofileSkinExtras
          persona={view}
          skin={skin}
          slot="end"
          mode="preview"
          featured={view.featured}
        />
      </div>
    </>
  );
}

/**
 * A persona page drawn from a sample DTO with the product's own parts, in
 * preview mode. It leaves out every part that reads the server (updates,
 * Studio releases, endorsers, the rights footer), and its view pins the
 * endorsement count to 0 and strips mention tokens from the bio and tagline
 * (`toSamplePersonaView`), so it fires no request whatever the sample says.
 * Renders nothing for a kind it cannot draw (`isSamplePersonaPageKind`).
 */
export function SamplePersonaPage({
  dto,
  className,
}: {
  dto: SubprofilePublicDTO;
  className?: string;
}) {
  const view = useMemo(() => toSamplePersonaView(dto), [dto]);
  const skin = skinFor(view.kind);
  if (!isSamplePersonaPageKind(view.kind)) return null;
  return (
    <SamplePersonaArticle view={view} className={className}>
      {view.kind === "tattoo_artist" ? (
        <TattooBody
          data={view}
          mode="preview"
          onAction={ignorePersonaEvent}
          onOpenWorkItem={ignorePersonaEvent}
          onOpenGalleryPhoto={ignorePersonaEvent}
        />
      ) : (
        <SamplePersonaBody view={view} skin={skin} />
      )}
    </SamplePersonaArticle>
  );
}
