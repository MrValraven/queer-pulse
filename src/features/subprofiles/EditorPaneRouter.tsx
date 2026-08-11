import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { CONTENT_PANE_LEDE_KEY, PANE_HEADER } from "./editorPaneHeaders.data";
import { sectionPaneKey, type EditorPaneKey } from "./editorRail.data";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
import { SubprofileIdentityFields } from "./SubprofileIdentityFields";
import { SubprofilePresenceFields } from "./SubprofilePresenceFields";
import { SubprofileLinkFields } from "./SubprofileLinkFields";
import { SubprofileSocialLinksEditor } from "./SubprofileSocialLinksEditor";
import { SubprofileSectionEditor } from "./SubprofileSectionEditor";
import { SubprofileAffiliationsEditor } from "./SubprofileAffiliationsEditor";
import { SubprofileOwnersPanel } from "./SubprofileOwnersPanel";
import { SubprofilePublishPanel } from "./SubprofilePublishPanel";
import sharedStyles from "./SubprofileEditor.module.css";

/** The shared Save affordance every "This side" pane (Identity/Presence/
 *  Address) ends with — all three edit the SAME `useSubprofileMetaEditor`
 *  instance and PATCH together in one request, so there is exactly one save
 *  button's worth of behaviour, just rendered at the bottom of whichever
 *  pane happens to be active. */
function MetaPaneSave({
  editor,
  t,
}: {
  editor: SubprofileMetaEditor;
  t: (key: string) => string;
}) {
  return (
    <div className={sharedStyles.formActions}>
      <Button
        variant="primary"
        onClick={() => void editor.save()}
        disabled={editor.saving || editor.nameMissing || editor.handleBlocked}
      >
        {editor.saving ? t("subprofiles:metaForm.saving") : t("subprofiles:metaForm.save")}
      </Button>
    </div>
  );
}

/**
 * The `.ed-main` body: a header (h2 + `.lede`, reflecting whichever rail
 * entry is active) above the routed pane content.
 *
 * Every reparented panel below stays MOUNTED regardless of which pane is
 * active — toggled with the native `hidden` attribute rather than a
 * conditional-render switch. Reason: the meta editor (identity/presence/
 * address) and `SubprofileSocialLinksEditor`/`SubprofileSectionEditor`/
 * `SubprofileAffiliationsEditor` each hold their OWN local `dirty`/`rows`
 * state with no autosave — if switching rail panes unmounted them, an owner
 * who edits a gig, then clicks over to "Portfolio" before hitting Save,
 * would silently lose that edit (the flat old page never had this failure
 * mode, since every section was always mounted at once). `hidden` keeps
 * every pane's in-progress edits alive across rail navigation while only
 * ever painting/exposing-to-the-a11y-tree the active one. The section count
 * is small (2 kind sections + `links`), so this costs nothing meaningful to
 * keep mounted.
 *
 * `identity`/`presence`/`address` are three DISTINCT rail entries that each
 * get their own pane here, but all three read/write the SAME `editor`
 * (`useSubprofileMetaEditor`) instance — created one level up in
 * `SubprofileEditorShell` and passed in as a prop, so the in-progress edits
 * on one pane survive switching to another and the docked preview (which is
 * handed that same instance) reflects them live, while one explicit save
 * still covers all of them together, exactly like the single
 * `SubprofileMetaForm` this replaces used to.
 */
export function EditorPaneRouter({
  pane,
  subprofile,
  editor,
}: {
  pane: EditorPaneKey;
  subprofile: SubprofileView;
  editor: SubprofileMetaEditor;
}) {
  const { t } = useTranslation();
  const header = PANE_HEADER[pane];
  const activeSection = subprofile.sections.find(
    (section) => sectionPaneKey(section.section) === pane,
  );

  return (
    <>
      <h2>{header ? t(header.titleKey) : activeSection ? t(activeSection.labelKey) : ""}</h2>
      <p className="lede">
        {header ? t(header.ledeKey) : t(CONTENT_PANE_LEDE_KEY)}
      </p>

      <div hidden={pane !== "identity"} className="ed-grid">
        <SubprofileIdentityFields
          avatarUrl={editor.avatarUrl}
          onAvatarUrlChange={editor.setAvatarUrl}
          onAvatarPreviewChange={editor.setAvatarPreview}
          displayName={editor.displayName}
          onDisplayNameChange={editor.setDisplayName}
          nameMissing={editor.nameMissing}
          tagline={editor.tagline}
          onTaglineChange={editor.setTagline}
          bio={editor.bio}
          onBioChange={editor.setBio}
        />
        <MetaPaneSave editor={editor} t={t} />
      </div>

      <div hidden={pane !== "presence"}>
        <div className="ed-grid">
          <SubprofilePresenceFields
            coverUrl={editor.coverUrl}
            onCoverUrlChange={editor.setCoverUrl}
            onCoverPreviewChange={editor.setCoverPreview}
            accent={editor.accent}
            onAccentChange={editor.setAccent}
            availability={editor.availability}
            onAvailabilityChange={editor.setAvailability}
            ctaLabel={editor.ctaLabel}
            onCtaLabelChange={editor.setCtaLabel}
            ctaUrl={editor.ctaUrl}
            onCtaUrlChange={editor.setCtaUrl}
          />
          <MetaPaneSave editor={editor} t={t} />
        </div>
        <SubprofileSocialLinksEditor subprofile={subprofile} />
      </div>

      <div hidden={pane !== "address"} className="ed-grid">
        <SubprofileLinkFields editor={editor} subprofile={subprofile} />
        <MetaPaneSave editor={editor} t={t} />
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
        <SubprofileOwnersPanel subprofileId={subprofile.id} />
      </div>

      <div hidden={pane !== "publish"}>
        <SubprofilePublishPanel subprofile={subprofile} />
      </div>
    </>
  );
}
