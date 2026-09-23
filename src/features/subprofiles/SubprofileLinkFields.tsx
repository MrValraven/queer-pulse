import { useState, type FocusEvent } from "react";
import { FiLock } from "react-icons/fi";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { LinkVisibility, Visibility } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import {
  LINK_HELP_KEY,
  LINK_TO_LABEL_KEY,
  VISIBILITY_OPTIONS,
} from "./subprofileEditor.data";
import { UsernameField } from "../settings/UsernameField";
import { FIELD_ANCHOR_ID } from "./publishChecklist.data";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
import { AddressChangeWarningModal } from "./AddressChangeWarningModal";
import {
  usePersonaCreatorSlug,
  usePersonaIsCreator,
} from "./usePersonaCreatorSlug";
import {
  handleStateLine,
  linkChoiceLockState,
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
  // The `/members/:ownerSlug/:slug` preview must name the persona's CREATOR,
  // not whoever is editing: a co-owner was shown (and could copy) a path under
  // their OWN profile, which resolves to nothing. Until it resolves, the
  // placeholder stands in rather than a confidently wrong slug.
  const creatorSlug = usePersonaCreatorSlug(
    subprofile.id,
    subprofile.memberCount,
  );
  const ownerSlug = creatorSlug ?? "…";
  const isPublished = subprofile.status === "published";

  // Only the creator may link an unlinked persona, see `linkChoiceLockState`.
  // Reads the same members query opened above, so this costs no extra request.
  const isCreator = usePersonaIsCreator(subprofile.id, subprofile.memberCount);
  const { locked: linkChoiceLocked, showHint: showLinkLockHint } =
    linkChoiceLockState(isCreator, subprofile.linkVisibility === "unlinked");

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
    if (target === "linked" && linkChoiceLocked) return;
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
    setPending({
      kind: "editField",
      field: "slug",
      value: editor.slug,
      previous: subprofile.slug,
    });
  }

  function handleHandleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    if (!isPublished || acknowledged) return;
    if (editor.link !== subprofile.linkVisibility) return;
    const previousHandle = subprofile.handle ?? "";
    if (editor.handle === previousHandle) return;
    setPending({
      kind: "editField",
      field: "handle",
      value: editor.handle,
      previous: previousHandle,
    });
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
      <LinkChoiceCards
        editor={editor}
        ownerSlug={ownerSlug}
        linkChoiceLocked={linkChoiceLocked}
        showLinkLockHint={showLinkLockHint}
        handleNote={handleNote}
        onSelect={selectLink}
        t={t}
      />

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
        <div id={FIELD_ANCHOR_ID.handle} onBlur={handleHandleBlur}>
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
          VISIBILITY_OPTIONS.find(
            (option) => option.value === editor.visibility,
          )?.helpKey ?? VISIBILITY_OPTIONS[0]!.helpKey,
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

/** The linked/unlinked `.choice` card pair. Split out of `SubprofileLinkFields`
 *  to keep that pane under the line cap; `linkChoiceLocked`/`showLinkLockHint`
 *  come from `linkChoiceLockState` (see there for the product rule they
 *  encode). */
function LinkChoiceCards({
  editor,
  ownerSlug,
  linkChoiceLocked,
  showLinkLockHint,
  handleNote,
  onSelect,
  t,
}: {
  editor: SubprofileMetaEditor;
  ownerSlug: string;
  linkChoiceLocked: boolean;
  showLinkLockHint: boolean;
  handleNote: ReturnType<typeof handleStateLine>;
  onSelect: (target: LinkVisibility) => void;
  t: TFunction;
}) {
  return (
    <div className="choices">
      <button
        type="button"
        className="choice"
        aria-pressed={editor.link === "linked"}
        disabled={linkChoiceLocked}
        onClick={() => onSelect("linked")}
      >
        <b>{t(LINK_TO_LABEL_KEY.linked)}</b>
        <p>{t(LINK_HELP_KEY.linked)}</p>
        <code>{pathFor("linked", ownerSlug, editor.slug, editor.handle)}</code>
        <p className="handlestate idle">
          {t("subprofiles:newModal.linkedAddressNote")}
        </p>
        {showLinkLockHint && (
          <p className="choiceLockHint">
            <FiLock aria-hidden />
            {t("subprofiles:link.creatorOnlyHint")}
          </p>
        )}
      </button>
      <button
        type="button"
        className="choice"
        aria-pressed={editor.link === "unlinked"}
        onClick={() => onSelect("unlinked")}
      >
        <b>{t(LINK_TO_LABEL_KEY.unlinked)}</b>
        <p>{t(LINK_HELP_KEY.unlinked)}</p>
        <code>
          {pathFor("unlinked", ownerSlug, editor.slug, editor.handle)}
        </code>
        <p className="handlestate idle">
          {t("subprofiles:newModal.standaloneNote")}
        </p>
        {handleNote && (
          <p className={`handlestate ${handleNote.tone}`}>
            {handleNote.message}
          </p>
        )}
      </button>
    </div>
  );
}
