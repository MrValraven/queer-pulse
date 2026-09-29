import { useState, type FocusEvent } from "react";
import { FormField, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { LinkVisibility, Visibility } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { VISIBILITY_OPTIONS } from "./subprofileEditor.data";
import { UsernameField } from "../settings/UsernameField";
import { FIELD_ANCHOR_ID } from "./publishChecklist.data";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
import { AddressChangeWarningModal } from "./AddressChangeWarningModal";
import { SubprofileLinkChoiceCards } from "./SubprofileLinkChoiceCards";
import {
  usePersonaCreatorSlug,
  usePersonaIsCreator,
} from "./usePersonaCreatorSlug";
import {
  handleNamesOwner,
  linkedPersonaHandleCandidate,
} from "./personaHandle";
import {
  addressChangeKindFor,
  linkChoiceLockState,
  pathFor,
  warningPathsForPending,
  type PendingAddressChange,
} from "./subprofileAddressChange";

/**
 * The "Address" rail pane: whether this persona shows it belongs to its
 * creator (linked) or stands alone (unlinked), its one `/p/<handle>` address,
 * and who can see it. Fed by the SAME `useSubprofileMetaEditor` hook instance
 * the Identity/Presence panes share (lifted in `EditorPaneRouter`), so this
 * pane owns no save of its own: flipping link mode or editing the handle here
 * is more of that one hook's dirty state until the shared Save button
 * PATCHes it.
 *
 * Both kinds claim a handle from the global namespace through the same
 * `UsernameField`. A linked persona may leave it empty: the server then
 * derives `<creatorSlug>-<personaSlug>` and stores it on save, draft or live,
 * which the placeholder and hint preview. An unlinked handle that carries the creator's slug would say
 * who runs the persona, so the field shows it as an error. A link switch
 * always starts from an empty handle.
 *
 * A PUBLISHED persona's address is live: switching link mode, or editing an
 * already-published handle, intercepts the change with
 * `AddressChangeWarningModal` and only applies it on confirm. A draft has
 * nothing live yet, so nothing is intercepted.
 */
export function SubprofileLinkFields({
  editor,
  subprofile,
}: {
  editor: SubprofileMetaEditor;
  subprofile: SubprofileView;
}) {
  const { t } = useTranslation();
  // The derived linked default names the persona's CREATOR even when a
  // co-owner is editing, since the server derives it from the creator's slug.
  // Until it resolves, the placeholder stands in for the address.
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

  // A link switch always starts from a fresh handle: the server releases the
  // old one, and a linked persona with no handle gets the derived default.
  function switchLink(target: LinkVisibility) {
    editor.setLink(target);
    editor.setHandle("");
  }

  function selectLink(target: LinkVisibility) {
    if (target === "linked" && linkChoiceLocked) return;
    if (target === editor.link) return;
    if (isPublished) {
      setPending({ kind: "switchMode", target });
      return;
    }
    switchLink(target);
  }

  function handleHandleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    if (!isPublished || acknowledged) return;
    if (editor.link !== subprofile.linkVisibility) return;
    const previousHandle = subprofile.handle ?? "";
    if (editor.handle === previousHandle) return;
    // Clearing a linked handle that already is the derived default keeps the
    // same address: the server would claim that same default again and the
    // persona stays published. Restoring the field keeps the edit a no-op,
    // so no change is sent and no warning asks about a move with no effect.
    const pathWith = (handle: string) =>
      pathFor(editor.link, ownerSlug, editor.slug, handle);
    if (pathWith(editor.handle) === pathWith(previousHandle)) {
      editor.setHandle(previousHandle);
      return;
    }
    // Clearing a STANDALONE persona's handle to empty is not a rename with a
    // pending new address to warn about: a published standalone persona
    // always needs one, so the server refuses this outright (422
    // `handle_invalid`) and never drafts it. `handleError` below already
    // says so (type a new one, or unpublish) and keeps Save disabled
    // (`useSubprofileMetaEditor`'s `isStandaloneHandleMissing`), so there is
    // nothing left for the confirm modal to add.
    if (editor.link !== "linked" && !editor.handle) return;
    setPending({
      kind: "editField",
      field: "handle",
      value: editor.handle,
      previous: previousHandle,
    });
  }

  function cancelPending() {
    if (pending?.kind === "editField") editor.setHandle(pending.previous);
    setPending(null);
  }

  function confirmPending() {
    if (pending?.kind === "switchMode") switchLink(pending.target);
    else if (pending?.kind === "editField") setAcknowledged(true);
    setPending(null);
  }

  const linkedDefaultHandle = creatorSlug
    ? linkedPersonaHandleCandidate(creatorSlug, editor.slug || "persona")
    : undefined;
  const isLinked = editor.link === "linked";
  // Linked with an empty handle previews the derived default. A draft
  // standalone persona learns that handles go to whoever publishes first.
  let handleHint: string | undefined;
  if (isLinked && !editor.handle && linkedDefaultHandle)
    handleHint = t("subprofiles:metaForm.linkedHandleHint", {
      handle: linkedDefaultHandle,
    });
  else if (!isLinked && !isPublished)
    handleHint = t("subprofiles:newModal.handleStateClaim");
  const namesOwnerError =
    !isLinked && creatorSlug && handleNamesOwner(editor.handle, creatorSlug)
      ? t("subprofiles:metaForm.handleNamesOwner", { creator: creatorSlug })
      : undefined;
  // A standalone persona has no derived default, so an empty address is an
  // error there. A PUBLISHED one needs the sharper version of that error: the
  // server refuses to clear it outright (Finding 1), so the field spells out
  // what to do (type a new one, or unpublish), where the generic "give it a
  // name" message would only imply a save that can never succeed. The bare
  // kind name ("therapist") is refused for both kinds.
  let handleError = namesOwnerError;
  if (!isLinked && editor.isStandaloneHandleMissing)
    handleError = t(
      isPublished
        ? "subprofiles:metaForm.handleRequiredPublished"
        : "subprofiles:metaForm.handleRequired",
    );
  else if (editor.isHandleKindName)
    handleError = t("subprofiles:metaForm.handleIsKind", {
      handle: editor.handle.trim(),
    });
  const warning = pending
    ? warningPathsForPending(pending, {
        link: editor.link,
        ownerSlug,
        slug: editor.slug,
        handle: editor.handle,
      })
    : null;
  const changeKind = pending
    ? addressChangeKindFor(pending, editor.link)
    : "other";

  return (
    <>
      <SubprofileLinkChoiceCards
        editor={editor}
        creatorSlug={creatorSlug}
        linkChoiceLocked={linkChoiceLocked}
        showLinkLockHint={showLinkLockHint}
        onSelect={selectLink}
        t={t}
      />

      <div id={FIELD_ANCHOR_ID.handle} onBlur={handleHandleBlur}>
        <UsernameField
          value={editor.handle}
          onChange={editor.setHandle}
          currentName={subprofile.handle ?? undefined}
          label={t("subprofiles:metaForm.addressFieldLabel")}
          prefix="/p/"
          placeholder={
            isLinked && linkedDefaultHandle
              ? linkedDefaultHandle
              : t("subprofiles:metaForm.standalonePlaceholder")
          }
          hint={handleHint}
          error={handleError}
          onStatusChange={editor.setHandleStatus}
        />
      </div>

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
          changeKind={changeKind}
          followerCount={subprofile.followerCount}
          endorsementCount={subprofile.endorsementCount}
          onConfirm={confirmPending}
          onCancel={cancelPending}
        />
      )}
    </>
  );
}
