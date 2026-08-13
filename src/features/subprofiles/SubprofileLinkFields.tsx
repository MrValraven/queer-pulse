import { useState, type FocusEvent } from "react";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileData } from "../../app/providers/useProfile";
import type { LinkVisibility, Visibility } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { LINK_HELP_KEY, LINK_TO_LABEL_KEY, VISIBILITY_OPTIONS } from "./subprofileEditor.data";
import { UsernameField } from "../settings/UsernameField";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
import { AddressChangeWarningModal } from "./AddressChangeWarningModal";
import {
  handleStateLine,
  pathFor,
  warningPathsForPending,
  type PendingAddressChange,
} from "./subprofileAddressChange";

/**
 * The "Address" rail pane: how this persona is found (linked to the owner's
 * profile vs. standing alone with a global handle) plus who can see it. Fed
 * by the SAME `useSubprofileMetaEditor` hook instance the Identity/Presence
 * panes share (lifted in `EditorPaneRouter`), so this pane never owns its
 * own save — flipping link mode or editing the value here is just more of
 * that one hook's dirty state until the shared Save button PATCHes it.
 *
 * Restyled to the design's `.choices`/`.choice` card toggle (each card
 * carries its own `<code>` path preview + a live `.handlestate` line) in
 * place of the old `SegmentedControl`. A PUBLISHED persona's address is
 * live — switching link mode, or editing an already-published slug/handle,
 * intercepts the change with `AddressChangeWarningModal` and only applies it
 * on confirm; a draft has nothing live yet, so nothing is intercepted.
 */
export function SubprofileLinkFields({
  editor,
  subprofile,
}: {
  editor: SubprofileMetaEditor;
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  const { profile } = useProfileData();
  const ownerSlug = profile.slug;
  const isPublished = subprofile.status === "published";

  const [pending, setPending] = useState<PendingAddressChange | null>(null);
  // Once an already-published edit is confirmed, further keystrokes in the
  // same field don't re-prompt on every blur until the next save moves the
  // baseline (`subprofile.slug`/`.handle`/`.linkVisibility`) forward again.
  // Reset via the React-endorsed "adjust state while rendering" pattern
  // (comparing against a baseline snapshotted in state) rather than an
  // effect, which would cascade an extra render on every baseline change.
  const baselineKey = `${subprofile.slug}|${subprofile.handle ?? ""}|${subprofile.linkVisibility}`;
  const [acknowledged, setAcknowledged] = useState(false);
  const [acknowledgedBaseline, setAcknowledgedBaseline] = useState(baselineKey);
  if (acknowledgedBaseline !== baselineKey) {
    setAcknowledgedBaseline(baselineKey);
    setAcknowledged(false);
  }

  function selectLink(target: LinkVisibility) {
    if (target === editor.link) return;
    if (isPublished) {
      setPending({ kind: "switchMode", target });
      return;
    }
    editor.setLink(target);
  }

  function handleSlugBlur() {
    if (!isPublished || acknowledged) return;
    if (editor.link !== subprofile.linkVisibility) return; // a mode switch is already gated above
    if (editor.slug === subprofile.slug) return;
    setPending({ kind: "editField", field: "slug", value: editor.slug, previous: subprofile.slug });
  }

  function handleHandleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    if (!isPublished || acknowledged) return;
    if (editor.link !== subprofile.linkVisibility) return;
    const previousHandle = subprofile.handle ?? "";
    if (editor.handle === previousHandle) return;
    setPending({ kind: "editField", field: "handle", value: editor.handle, previous: previousHandle });
  }

  function cancelPending() {
    if (pending?.kind === "editField") {
      if (pending.field === "slug") editor.setSlug(pending.previous);
      else editor.setHandle(pending.previous);
    }
    setPending(null);
  }

  function confirmPending() {
    if (pending?.kind === "switchMode") editor.setLink(pending.target);
    else if (pending?.kind === "editField") setAcknowledged(true);
    setPending(null);
  }

  const handleNote = handleStateLine(editor.handleStatus, t);
  const warning = pending
    ? warningPathsForPending(pending, {
        link: editor.link,
        ownerSlug,
        slug: editor.slug,
        handle: editor.handle,
      })
    : null;

  return (
    <>
      <div className="choices">
        <button
          type="button"
          className="choice"
          aria-pressed={editor.link === "linked"}
          onClick={() => selectLink("linked")}
        >
          <b>{t(LINK_TO_LABEL_KEY.linked)}</b>
          <p>{t(LINK_HELP_KEY.linked)}</p>
          <code>{pathFor("linked", ownerSlug, editor.slug, editor.handle)}</code>
          <p className="handlestate idle">{t("subprofiles:newModal.linkedAddressNote")}</p>
        </button>
        <button
          type="button"
          className="choice"
          aria-pressed={editor.link === "unlinked"}
          onClick={() => selectLink("unlinked")}
        >
          <b>{t(LINK_TO_LABEL_KEY.unlinked)}</b>
          <p>{t(LINK_HELP_KEY.unlinked)}</p>
          <code>{pathFor("unlinked", ownerSlug, editor.slug, editor.handle)}</code>
          <p className="handlestate idle">{t("subprofiles:newModal.standaloneNote")}</p>
          {handleNote && <p className={`handlestate ${handleNote.tone}`}>{handleNote.message}</p>}
        </button>
      </div>

      {editor.link === "linked" ? (
        <FormField label={t("subprofiles:metaForm.addressLabel")}>
          <input
            value={editor.slug}
            placeholder={t("subprofiles:metaForm.addressPlaceholder")}
            onChange={(event) => editor.setSlug(event.target.value)}
            onBlur={handleSlugBlur}
            // A URL slug: never auto-capitalise / auto-correct / spell-check it,
            // and give the URL keyboard (with `/` + `.`). enterKeyHint "done"
            // since it's the last edited field before the global save.
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="url"
            enterKeyHint="done"
          />
        </FormField>
      ) : (
        <div onBlur={handleHandleBlur}>
          <UsernameField
            value={editor.handle}
            onChange={editor.setHandle}
            currentName={subprofile.handle ?? undefined}
            label={t("subprofiles:metaForm.handleLabel")}
            onStatusChange={editor.setHandleStatus}
          />
        </div>
      )}

      <FormField
        label={t("subprofiles:metaForm.visibilityLabel")}
        helper={t(
          VISIBILITY_OPTIONS.find((option) => option.value === editor.visibility)?.helpKey ??
            VISIBILITY_OPTIONS[0]!.helpKey,
        )}
      >
        <Select
          options={VISIBILITY_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
          value={editor.visibility}
          onChange={(value) => editor.setVisibility(value as Visibility)}
        />
      </FormField>

      {pending && warning && (
        <AddressChangeWarningModal
          title={t(
            pending.kind === "switchMode"
              ? "subprofiles:addressWarning.switchTitle"
              : "subprofiles:addressWarning.editTitle",
          )}
          oldPath={warning.oldPath}
          newPath={warning.newPath}
          releasesHandle={warning.releasesHandle}
          onConfirm={confirmPending}
          onCancel={cancelPending}
        />
      )}
    </>
  );
}
