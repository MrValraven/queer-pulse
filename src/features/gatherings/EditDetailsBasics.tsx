import { useRef } from "react";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { editFieldDomId } from "./editDetailsChanges";
import { EditDetailsCover } from "./EditDetailsCover";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { EditDetailsFormat } from "./EditDetailsFormat";
import { EditDetailsSection } from "./EditDetailsSection";
import { MAX_DESCRIPTION_STORAGE_LENGTH } from "./steps/whatChapter.data";
import { useAutoGrowTextarea } from "./useAutoGrowTextarea";
import fieldStyles from "./EditDetailsFields.module.css";
import fieldEditorStyles from "./FieldEditor.module.css";

/**
 * "The gathering" in the edit-details modal: the title, the family, format
 * and their questions, the description and the cover.
 *
 * Split out of `EditDetailsModal` so the modal stays inside the 200-line rule.
 * The fields share one grid: the family and the format side by side, the
 * format's questions in pairs, everything else across the full width.
 * Cmd/Ctrl + Enter in the description saves through the editor's own key
 * handler, which covers every field in the form. An emptied title says so
 * under the field, by the same rule that holds Save (`canSaveEditDraft`).
 */
export function EditDetailsBasics({
  draft,
  editorId,
  onSetField,
  onChangeFormat,
}: {
  draft: GatheringDetailsDraft;
  /** The modal's own id, the prefix of the field ids "Show the field" uses. */
  editorId: string;
  onSetField: <FieldName extends keyof GatheringDetailsDraft>(
    key: FieldName,
    value: GatheringDetailsDraft[FieldName],
  ) => void;
  /** The modal's format merge, which also drops the themes a new family's
   *  own questions already ask (ruling R6). */
  onChangeFormat: (patch: Partial<GatheringDetailsDraft>) => void;
}) {
  const { t } = useTranslation();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  useAutoGrowTextarea(descriptionRef, draft.description);

  return (
    <EditDetailsSection sectionKey="gathering">
      <div className={fieldStyles.fieldGrid}>
        <FormField
          id={editFieldDomId(editorId, "title")}
          className={fieldStyles.fullRow}
          label={t("gatherings:manage.editModal.fieldTitle")}
          required
          error={
            draft.title.trim() === ""
              ? t("gatherings:manage.editModal.titleRequiredError")
              : undefined
          }
        >
          <input
            type="text"
            value={draft.title}
            onChange={(event) => onSetField("title", event.target.value)}
          />
        </FormField>
        <EditDetailsFormat
          draft={draft}
          onChange={onChangeFormat}
          otherTextFieldId={editFieldDomId(editorId, "otherText")}
        />
        {/* Mentions suggest as in chat, the list on `document.body` so the
          dialog body's scroll edge never cuts it off. With the list open,
          Cmd/Ctrl + Enter closes it unpicked and goes on to the editor's
          save shortcut (`shouldSubmitOnModifierEnter`). */}
        <FormField
          className={fieldStyles.fullRow}
          label={t("gatherings:manage.editModal.fieldDescription")}
        >
          <MentionTextarea
            textareaRef={descriptionRef}
            className={`${fieldEditorStyles.detailsDescriptionInput} ${fieldStyles.descriptionInput}`}
            maxLength={MAX_DESCRIPTION_STORAGE_LENGTH}
            aria-label={t("gatherings:manage.editModal.fieldDescription")}
            value={draft.description}
            onChange={(nextDescription) =>
              onSetField("description", nextDescription)
            }
            shouldPortalMenu
            shouldSubmitOnModifierEnter
          />
        </FormField>
        <EditDetailsCover
          className={fieldStyles.fullRow}
          coverImageUrl={draft.coverImageUrl}
          onChange={(value) => onSetField("coverImageUrl", value)}
        />
      </div>
    </EditDetailsSection>
  );
}
