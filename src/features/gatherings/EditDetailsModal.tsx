import { useId, useState } from "react";
import { ConfirmDialog, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { EditDetailsAudience } from "./EditDetailsAudience";
import { EditDetailsBasics } from "./EditDetailsBasics";
import { EditDetailsCare } from "./EditDetailsCare";
import {
  editedSectionKeys,
  editSaveProblem,
  hasAttendeeNotifyingChange,
} from "./editDetailsChanges";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsFooterStatus } from "./EditDetailsFooterStatus";
import { EditDetailsLayout } from "./EditDetailsLayout";
import { EditDetailsRsvp } from "./EditDetailsRsvp";
import {
  EditDetailsSectionsContext,
  type EditDetailsSectionsValue,
} from "./editDetailsSectionsContext";
import { EditDetailsWhenWhere } from "./EditDetailsWhenWhere";
import { FieldEditorFooter } from "./FieldEditorShell";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { canSaveEditDraft } from "./manageGatheringState";
import { useEditDetailsDraft } from "./useEditDetailsDraft";
import { useEditDetailsNavigation } from "./useEditDetailsNavigation";
import layoutStyles from "./EditDetailsLayout.module.css";

// The draft's shape lives in `editDetailsDraft.ts`. Re-exported so the
// sections that read it from the modal keep doing so.
export type { GatheringDetailsDraft };

/**
 * Edit a published gathering in five titled sections: the gathering, when and
 * where, who it is for, taking care, and RSVPs. Each section hands back a
 * partial draft that is merged here, so the modal owns one draft and
 * `buildEditPatch` reads all of it.
 *
 * A wide editor: a rail maps the sections (which one is in view, which hold
 * edits, which holds Save) beside the scrolling form, and the footer says
 * where the edit stands. Closing with edits asks first.
 */
export function EditDetailsModal({
  initial,
  onClose,
  onSave,
}: {
  initial: GatheringDetailsDraft;
  onClose: () => void;
  /** Resolves with how many people the server notified, or `null` when that
   *  is unknown: a repeating gathering sends only once the host picks a
   *  scope, after this modal has closed, or the request failed. It never
   *  rejects; callers catch. */
  onSave: (draft: GatheringDetailsDraft) => Promise<number | null>;
}) {
  const { t } = useTranslation();
  const { draft, openedDraft, setField, merge, mergeFormat, resetSectionKey } =
    useEditDetailsDraft(initial);
  const [isDone, setIsDone] = useState(false);
  const [notifiedCount, setNotifiedCount] = useState<number | null>(null);
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);
  const editorId = useId();
  const navigation = useEditDetailsNavigation(editorId);

  // Lives in `manageGatheringState` beside the patch builder it gates, so the
  // rule that decides whether a draft may be saved and the code that puts it
  // on the wire cannot drift apart. `EditDetailsSchedule` reads the schedule
  // half of the same rule through `editScheduleProblem`, and
  // `EditDetailsAudience` the capacity half through `editCapacityProblem`.
  // `openedDraft` is seeded from the saved gathering, so `openedDraft.capacity`
  // is the capacity the gathering held when the modal opened.
  const canSave = canSaveEditDraft(draft, openedDraft.capacity);
  // Save lights up once something differs from what the modal opened on, the
  // way the one-field editors behave. An edit typed and then undone puts Save
  // back to its quiet "not yet" chip.
  // Every draft field belongs to one section, so the draft differs exactly
  // when some section does, and the discard count can never read zero.
  const editedKeys = editedSectionKeys(draft, openedDraft);
  const hasDraftChanged = editedKeys.length > 0;
  // Where the rule holding Save points, for the rail's marker and the
  // footer's "Show the field". `null` while the draft saves.
  const saveProblem = editSaveProblem(draft, openedDraft.capacity);

  // Save, Cmd/Ctrl + Enter from any field, all through this one gate. It does
  // nothing while Save is off, and the success panel replaces the form once
  // it has saved.
  const save = () => {
    if (!canSave || !hasDraftChanged) return;
    void onSave(draft).then(setNotifiedCount);
    setIsDone(true);
  };

  // The close button, Escape, the scrim and Cancel all come here. With no
  // edits the modal closes at once; with edits a confirm opens on top, and
  // Escape there closes only the confirm (the shared modal stack).
  const requestClose = () => {
    if (hasDraftChanged) setIsDiscardOpen(true);
    else onClose();
  };

  if (isDone) {
    // The server tells attendees only about a new start or place, so the
    // count shows for those edits once it has come back above zero.
    const shouldShowNotifiedCount =
      hasAttendeeNotifyingChange(draft, openedDraft) &&
      notifiedCount !== null &&
      notifiedCount > 0;
    return (
      <GatheringSuccessPanel
        title={
          <Translation
            i18nKey="gatherings:manage.editModal.successTitle"
            components={{ em: <em /> }}
          />
        }
        sub={
          <Translation
            i18nKey="gatherings:manage.editModal.successSub"
            values={{ title: draft.title }}
            components={{ b: <b /> }}
          />
        }
        meta={
          shouldShowNotifiedCount
            ? t("gatherings:manage.editModal.successMeta", {
                count: notifiedCount,
              })
            : t("gatherings:manage.editModal.successMetaSaved")
        }
        onClose={onClose}
      />
    );
  }

  const sectionsValue: EditDetailsSectionsValue = {
    editorId,
    editedKeys,
    needsFixKey: saveProblem?.sectionKey ?? null,
    onReset: resetSectionKey,
    registerSection: navigation.registerSection,
  };

  return (
    <>
      <Modal
        full
        className={layoutStyles.editorDialog}
        bodyClassName={layoutStyles.editorBody}
        subClassName={layoutStyles.editorSub}
        // On a phone with the keyboard up the head and footer tighten and the
        // sheet grows towards the top, so the field being typed in keeps its
        // room (EditDetailsLayout.module.css drops the strip and the status).
        shouldCollapseSubWithKeyboard
        eyebrow={
          openedDraft.title ? (
            <span className={layoutStyles.eyebrowTitle}>
              {openedDraft.title}
            </span>
          ) : undefined
        }
        title={t("gatherings:manage.editModal.title")}
        sub={t("gatherings:manage.editModal.sub")}
        onClose={requestClose}
        // The shared editor footer puts Cancel before Save, the order the
        // focused field editors and most modal footers in the app use.
        footer={
          <FieldEditorFooter
            isSaveEnabled={canSave && hasDraftChanged}
            onSave={save}
            onCancel={requestClose}
            status={
              <EditDetailsFooterStatus
                editedCount={editedKeys.length}
                isNotifyingAttendees={hasAttendeeNotifyingChange(
                  draft,
                  openedDraft,
                )}
                saveProblem={saveProblem}
                onShowField={navigation.showField}
              />
            }
          />
        }
      >
        <EditDetailsSectionsContext.Provider value={sectionsValue}>
          <EditDetailsLayout
            draft={draft}
            activeKey={navigation.activeKey}
            editedKeys={editedKeys}
            needsFixKey={sectionsValue.needsFixKey}
            onSelectSection={navigation.goToSection}
            onSaveShortcut={save}
            columnRef={navigation.columnRef}
            bottomSentinelRef={navigation.bottomSentinelRef}
          >
            <EditDetailsBasics
              draft={draft}
              editorId={editorId}
              onSetField={setField}
              onChangeFormat={mergeFormat}
            />
            <EditDetailsWhenWhere
              draft={draft}
              editorId={editorId}
              onSetField={setField}
              onChange={merge}
            />
            <EditDetailsAudience
              draft={draft}
              openedWithCapacity={openedDraft.capacity}
              savedCommunitySlug={openedDraft.communitySlug}
              onChange={merge}
            />
            <EditDetailsCare draft={draft} onChange={merge} />
            <EditDetailsRsvp draft={draft} onChange={merge} />
          </EditDetailsLayout>
        </EditDetailsSectionsContext.Provider>
      </Modal>
      {/* A sibling of the editor, so its keys and clicks never bubble through
          the editor's own handlers on their way up the React tree. */}
      <ConfirmDialog
        open={isDiscardOpen}
        onClose={() => setIsDiscardOpen(false)}
        onConfirm={onClose}
        title={t("gatherings:manage.editModal.discard.title")}
        description={t("gatherings:manage.editModal.discard.body", {
          count: editedKeys.length,
        })}
        cancelLabel={t("gatherings:manage.editModal.discard.keepCta")}
        confirmLabel={t("gatherings:manage.editModal.discard.discardCta")}
        tone="destructive"
        initialFocus="cancel"
      />
    </>
  );
}
