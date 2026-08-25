import { useEffect, useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { CONTENT_PANE_LEDE_KEY, PANE_HEADER } from "./editorPaneHeaders.data";
import { sectionPaneKey, type EditorPaneKey } from "./editorRail.data";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { SubprofileIdentityFields } from "./SubprofileIdentityFields";
import { SubprofilePresenceFields } from "./SubprofilePresenceFields";
import { SubprofileLinkFields } from "./SubprofileLinkFields";
import { SubprofileSkinBlocksEditor } from "./SubprofileSkinBlocksEditor";
import { SubprofileSocialLinksEditor } from "./SubprofileSocialLinksEditor";
import { SubprofileSectionEditor } from "./SubprofileSectionEditor";
import { SubprofileAffiliationsEditor } from "./SubprofileAffiliationsEditor";
import { SubprofileOwnersPanel } from "./SubprofileOwnersPanel";
import { SubprofilePublishPanel } from "./SubprofilePublishPanel";

/**
 * The `.ed-main` body: a header (h2 + `.lede`, reflecting whichever rail
 * entry is active) above the routed pane content.
 *
 * Every reparented panel below stays MOUNTED regardless of which pane is
 * active — toggled with the native `hidden` attribute rather than a
 * conditional-render switch. Reason: the meta editor (identity/presence/
 * address) and `SubprofileSocialLinksEditor`/`SubprofileSectionEditor`/
 * `SubprofileAffiliationsEditor` are all CONTROLLED by
 * `SubprofileEditorContext` with no autosave — if switching rail panes
 * unmounted them, an owner who edits a gig, then clicks over to "Portfolio"
 * before hitting the global Save, would silently lose that edit (the flat
 * old page never had this failure mode, since every section was always
 * mounted at once). `hidden` keeps every pane's in-progress edits alive
 * across rail navigation while only ever painting/exposing-to-the-a11y-tree
 * the active one. The section count is small (2 kind sections + `links`), so
 * this costs nothing meaningful to keep mounted.
 *
 * `identity`/`presence`/`address` are three DISTINCT rail entries that each
 * get their own pane here, but all three read/write the SAME `meta`
 * (`useSubprofileMetaEditor`) instance off `SubprofileEditorContext`, so the
 * in-progress edits on one pane survive switching to another and the docked
 * preview (which reads that same context) reflects them live. There is no
 * per-pane save anymore — one global savebar (owned by
 * `SubprofileEditorProvider`) commits every area, meta included, together.
 */
export function EditorPaneRouter({
  pane,
  subprofile,
}: {
  pane: EditorPaneKey;
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { meta } = useSubprofileEditorContext();
  const header = PANE_HEADER[pane];
  const activeSection = subprofile.sections.find(
    (section) => sectionPaneKey(section.section) === pane,
  );

  // Switching rail panes only swaps `hidden` on already-mounted panels, so a
  // screen-reader user gets no signal that the content changed. Move focus to
  // the new pane's heading on each switch (but not the initial mount, which
  // would otherwise steal focus + scroll on page load and flash the focus ring).
  //
  // We compare against the PREVIOUS pane value rather than a "did mount" flag:
  // the flag guard is defeated by StrictMode's double-invoked effects (the ref
  // survives the simulated remount, so the replay focuses on first load). Seeding
  // the ref with the initial pane means the first run — and its StrictMode replay
  // — both see an unchanged pane and skip; focus only moves on a real switch.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const prevPaneRef = useRef(pane);
  useEffect(() => {
    if (prevPaneRef.current === pane) return;
    prevPaneRef.current = pane;
    headingRef.current?.focus({ preventScroll: true });
  }, [pane]);

  return (
    <>
      <h2 ref={headingRef} tabIndex={-1}>
        {header ? t(header.titleKey) : activeSection ? t(activeSection.labelKey) : ""}
      </h2>
      <p className="lede">
        {header ? t(header.ledeKey) : t(CONTENT_PANE_LEDE_KEY)}
      </p>

      <div hidden={pane !== "identity"} className="ed-grid">
        <SubprofileIdentityFields
          avatarUrl={meta.avatarUrl}
          avatarCrop={meta.avatarCrop}
          onAvatarUrlChange={meta.setAvatarUrl}
          onAvatarPreviewChange={meta.setAvatarPreview}
          displayName={meta.displayName}
          onDisplayNameChange={meta.setDisplayName}
          nameMissing={meta.nameMissing}
          tagline={meta.tagline}
          onTaglineChange={meta.setTagline}
          bio={meta.bio}
          onBioChange={meta.setBio}
        />
      </div>

      <div hidden={pane !== "presence"}>
        <div className="ed-grid">
          <SubprofilePresenceFields
            coverUrl={meta.coverUrl}
            coverCrop={meta.coverPreviewCrop ?? meta.coverCrop}
            onCoverUrlChange={meta.setCoverUrl}
            onCoverPreviewChange={meta.setCoverPreview}
            coverBleed={meta.coverBleed}
            onCoverBleedChange={meta.setCoverBleed}
            accent={meta.accent}
            onAccentChange={meta.setAccent}
            availability={meta.availability}
            onAvailabilityChange={meta.setAvailability}
            ctaLabel={meta.ctaLabel}
            onCtaLabelChange={meta.setCtaLabel}
            ctaUrl={meta.ctaUrl}
            onCtaUrlChange={meta.setCtaUrl}
            ctaMismatch={meta.ctaMismatch}
          />
        </div>
        <SubprofileSocialLinksEditor subprofile={subprofile} />
      </div>

      <div hidden={pane !== "address"} className="ed-grid">
        <SubprofileLinkFields editor={meta} subprofile={subprofile} />
      </div>

      {/* Only rendered when the persona's skin has editable SkinData blocks —
          the rail entry is likewise skin-gated (`hasSkinBlocks`). Mounted like
          every other pane so its in-progress edits survive rail navigation. */}
      <div hidden={pane !== "skinBlocks"}>
        <SubprofileSkinBlocksEditor />
      </div>

      {subprofile.sections.map((section) => (
        <div key={section.section} hidden={pane !== sectionPaneKey(section.section)}>
          <SubprofileSectionEditor subprofileId={subprofile.id} section={section} />
        </div>
      ))}

      <div hidden={pane !== "affiliations"}>
        <SubprofileAffiliationsEditor subprofile={subprofile} />
      </div>

      <div hidden={pane !== "owners"}>
        <SubprofileOwnersPanel subprofile={subprofile} />
      </div>

      <div hidden={pane !== "publish"}>
        <SubprofilePublishPanel subprofile={subprofile} />
      </div>
    </>
  );
}
