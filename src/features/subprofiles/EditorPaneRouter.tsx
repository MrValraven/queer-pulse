import { useEffect, useRef } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  CONTENT_PANE_LEDE_KEY,
  KIND_PANE_LEDE_KEY,
  PANE_HEADER,
} from "./editorPaneHeaders.data";
import {
  sectionPaneKey,
  sectionsInPageBlocks,
  type EditorPaneKey,
} from "./editorRail.data";
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

/** Whether the heading is on screen and uncovered: its first line sits inside
 *  the viewport and the topmost element there is the heading itself, so a
 *  sticky nav or pane switcher over it counts as hidden. Without hit-testing
 *  (jsdom) the viewport check alone decides. */
function isPainted(heading: HTMLElement): boolean {
  const box = heading.getBoundingClientRect();
  const probeY = box.top + Math.min(box.height, 32) / 2;
  if (box.height === 0 || probeY <= 0 || probeY >= window.innerHeight) {
    return false;
  }
  if (typeof document.elementFromPoint !== "function") return true;
  const probeX = box.left + Math.min(box.width, 48) / 2;
  const topmost = document.elementFromPoint(probeX, probeY);
  return topmost !== null && heading.contains(topmost);
}

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
  const { meta, reloadGeneration } = useSubprofileEditorContext();
  const header = PANE_HEADER[pane];
  const ledeKey =
    KIND_PANE_LEDE_KEY[subprofile.kind]?.[pane] ??
    header?.ledeKey ??
    CONTENT_PANE_LEDE_KEY;
  // Every kind edits its sections inside Page blocks chapters, so a section
  // found there gets no pane of its own here.
  const sectionsInBlocks = sectionsInPageBlocks(subprofile.kind);
  const paneSections = subprofile.sections.filter(
    (section) => !sectionsInBlocks.has(sectionPaneKey(section.section)),
  );
  const activeSection = paneSections.find(
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

  // ENG-451: a conflict Reload remounts the whole editor, this pane included,
  // and the Reload button that had focus goes with it. Hand focus to the
  // pane's heading, which names where the member is at every width, and
  // bring it on screen when the member pressed Reload from further down the
  // pane (or it sits under the sticky chrome), so the focus lands somewhere
  // they can see. The generation is fixed for this mount, so this runs once
  // per Reload; the first load (generation 0) leaves focus alone.
  useEffect(() => {
    const heading = headingRef.current;
    if (reloadGeneration === 0 || !heading) return;
    heading.focus({ preventScroll: true });
    if (isPainted(heading)) return;
    heading.scrollIntoView?.({
      // Centred: the nav band, and on phones the pane switcher too, stick
      // over the top of the page, and a start-aligned heading lands under
      // them.
      block: "center",
      // `instant` under reduced motion: `html { scroll-behavior: smooth }` in
      // base.css would otherwise animate the jump.
      behavior: prefersReducedMotionNow() ? "instant" : "smooth",
    });
  }, [reloadGeneration]);

  return (
    <>
      <h2 ref={headingRef} tabIndex={-1}>
        {header
          ? t(header.titleKey)
          : activeSection
            ? t(activeSection.labelKey)
            : ""}
      </h2>
      <p className="lede">{t(ledeKey)}</p>

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

      {/* Page blocks: every kind's chapters, its sections included. The rail
          entry shows while the kind has chapters (`hasSkinBlocks`). Mounted
          like every other pane so its in-progress edits survive rail
          navigation. */}
      <div hidden={pane !== "skinBlocks"}>
        <SubprofileSkinBlocksEditor />
      </div>

      {paneSections.map((section) => (
        <div
          key={section.section}
          hidden={pane !== sectionPaneKey(section.section)}
        >
          <SubprofileSectionEditor
            subprofileId={subprofile.id}
            section={section}
          />
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
