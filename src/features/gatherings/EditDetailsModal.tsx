import { useRef, useState, type KeyboardEvent } from "react";
import { FormField, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { EditDetailsAudience } from "./EditDetailsAudience";
import { EditDetailsCare } from "./EditDetailsCare";
import { EditDetailsCost } from "./EditDetailsCost";
import { EditDetailsCover } from "./EditDetailsCover";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsFormat } from "./EditDetailsFormat";
import { EditDetailsRsvp } from "./EditDetailsRsvp";
import { EditDetailsSchedule } from "./EditDetailsSchedule";
import { EditDetailsSection } from "./EditDetailsSection";
import { FieldEditorFooter } from "./FieldEditorShell";
import { sanitizeThemes } from "./gatheringExtras";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { canSaveEditDraft } from "./manageGatheringState";
import { ATTENDEE_COUNT } from "./manageGathering.data";
import { MAX_DESCRIPTION_STORAGE_LENGTH } from "./steps/whatChapter.data";
import { useAutoGrowTextarea } from "./useAutoGrowTextarea";
import fieldEditorStyles from "./FieldEditor.module.css";
import styles from "./GatheringModals.module.css";

// The draft's shape lives in `editDetailsDraft.ts`. Re-exported so the
// sections that read it from the modal keep doing so.
export type { GatheringDetailsDraft };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

/** Whether two draft values hold the same answer: equal primitives, or
 *  arrays and plain objects (themes, content notes, format details, RSVP
 *  questions) with equal entries all the way down. A key missing on one side
 *  reads as `undefined`, so `{ a: undefined }` and `{}` count as the same. */
function isSameDraftValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((item, index) => isSameDraftValue(item, right[index]))
    );
  }
  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    return [...keys].every((key) => isSameDraftValue(left[key], right[key]));
  }
  return false;
}

/**
 * Edit a published gathering in five titled sections: the gathering, when and
 * where, who it is for, taking care, and RSVPs. Each section hands back a
 * partial draft that is merged here, so the modal owns one draft and
 * `buildEditPatch` reads all of it.
 */
export function EditDetailsModal({
  initial,
  onClose,
  onSave,
}: {
  initial: GatheringDetailsDraft;
  onClose: () => void;
  onSave: (draft: GatheringDetailsDraft) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<GatheringDetailsDraft>(initial);
  // The baseline the modal opened on, frozen for its whole life. Parents
  // rebuild `initial` on every render, and one re-seeded while the modal is
  // open would otherwise light Save with no edit made.
  const [openedDraft] = useState<GatheringDetailsDraft>(initial);
  const [done, setDone] = useState(false);

  const set = <FieldName extends keyof GatheringDetailsDraft>(
    key: FieldName,
    value: GatheringDetailsDraft[FieldName],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const merge = (patch: Partial<GatheringDetailsDraft>) =>
    setDraft((current) => ({ ...current, ...patch }));
  // Family, format, the host's own words and the family's own questions move
  // together when the family changes. A new family also drops the themes its
  // own questions already ask (ruling R6), the rule the wizard applies.
  const mergeFormat = (patch: Partial<GatheringDetailsDraft>) =>
    setDraft((current) => {
      const next = { ...current, ...patch };
      return patch.gatheringFamily === undefined
        ? next
        : {
            ...next,
            themes: sanitizeThemes(next.themes, next.gatheringFamily),
          };
    });
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
  const hasDraftChanged = !isSameDraftValue(draft, openedDraft);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  useAutoGrowTextarea(descriptionRef, draft.description);

  const save = () => {
    if (!canSave || !hasDraftChanged) return;
    onSave(draft);
    setDone(true);
  };

  // Cmd/Ctrl + Enter in the description saves the modal, as in the one-field
  // description editor. It goes through `save`, so it does nothing while Save
  // is off, and the success panel replaces the field once it has saved.
  const handleDescriptionKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // An Enter that confirms an IME composition (Japanese, Chinese, Korean
    // input) belongs to the composition, so it never saves.
    if (event.nativeEvent.isComposing) return;
    if (event.key !== "Enter" || !(event.metaKey || event.ctrlKey)) return;
    event.preventDefault();
    save();
  };

  if (done) {
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
        meta={t("gatherings:manage.editModal.successMeta", {
          count: ATTENDEE_COUNT,
        })}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      title={t("gatherings:manage.editModal.title")}
      sub={t("gatherings:manage.editModal.sub")}
      onClose={onClose}
      // The shared editor footer puts Cancel before Save, the order the
      // focused field editors and most modal footers in the app use.
      footer={
        <FieldEditorFooter
          isSaveEnabled={canSave && hasDraftChanged}
          onSave={save}
          onCancel={onClose}
        />
      }
    >
      <div className={styles.fields}>
        <EditDetailsSection
          title={t("gatherings:manage.editModal.section.gathering")}
        >
          <FormField
            label={t("gatherings:manage.editModal.fieldTitle")}
            required
          >
            <input
              type="text"
              value={draft.title}
              onChange={(event) => set("title", event.target.value)}
            />
          </FormField>
          <EditDetailsFormat draft={draft} onChange={mergeFormat} />
          {/* Mentions suggest as in chat, the list on `document.body` so the
              dialog body's scroll edge never cuts it off. */}
          <FormField label={t("gatherings:manage.editModal.fieldDescription")}>
            <MentionTextarea
              textareaRef={descriptionRef}
              className={fieldEditorStyles.detailsDescriptionInput}
              maxLength={MAX_DESCRIPTION_STORAGE_LENGTH}
              aria-label={t("gatherings:manage.editModal.fieldDescription")}
              value={draft.description}
              onChange={(nextDescription) =>
                set("description", nextDescription)
              }
              onKeyDown={handleDescriptionKeyDown}
              shouldPortalMenu
              shouldSubmitOnModifierEnter
            />
          </FormField>
          <EditDetailsCover
            coverImageUrl={draft.coverImageUrl}
            onChange={(value) => set("coverImageUrl", value)}
          />
        </EditDetailsSection>
        <EditDetailsSection
          title={t("gatherings:manage.editModal.section.whenWhere")}
        >
          <EditDetailsSchedule
            draft={draft}
            onChangeStartAt={(value) => set("startAt", value)}
            onChangeEndAt={(value) => set("endAt", value)}
          />
          <FormField
            label={t("gatherings:manage.editModal.fieldLocation")}
            required
          >
            <input
              type="text"
              value={draft.location}
              onChange={(event) => set("location", event.target.value)}
            />
          </FormField>
          <EditDetailsCost
            costKind={draft.costKind}
            cost={draft.cost}
            onChange={merge}
          />
        </EditDetailsSection>
        <EditDetailsAudience
          draft={draft}
          openedWithCapacity={openedDraft.capacity}
          savedCommunitySlug={openedDraft.communitySlug}
          onChange={merge}
        />
        <EditDetailsCare draft={draft} onChange={merge} />
        <EditDetailsRsvp draft={draft} onChange={merge} />
      </div>
    </Modal>
  );
}
