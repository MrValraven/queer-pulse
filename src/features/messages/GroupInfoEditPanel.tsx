import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GroupAvatarField } from "./GroupAvatarField";
import type { Conversation } from "./data";
import sharedStyles from "./NewMessageModal.module.css";
import styles from "./GroupInfoModal.module.css";

/** Mirrors the backend's PATCH `:id` description cap (section 8, PRD-358). */
const MAX_DESCRIPTION_LENGTH = 500;

interface GroupInfoEditPanelProps {
  active: Conversation;
  managing: boolean;
  onCancel: () => void;
  onSave: (changes: {
    title?: string;
    avatarUrl?: string;
    description?: string;
  }) => void;
}

/**
 * Edit-mode group identity: name, photo, and description (PRD-358), split
 * out of `GroupInfoModal` to keep it under the size cap. Owns its own local
 * draft state; nothing is saved until `onSave`. `avatarUrl` stays `undefined`
 * unless the member actually changed the photo, so an untouched panel never
 * overwrites the stored key with a resolved URL (same contract `saveInfo` in
 * the orchestrator relied on before the split).
 */
export function GroupInfoEditPanel({
  active,
  managing,
  onCancel,
  onSave,
}: GroupInfoEditPanelProps) {
  const { t } = useTranslation();
  const descriptionFieldId = useId();
  const descriptionCounterId = useId();
  const [title, setTitle] = useState(active.name);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState(active.description ?? "");

  function save() {
    onSave({ title: title.trim(), avatarUrl, description: description.trim() });
  }

  return (
    <div className={sharedStyles.renamePanel}>
      <input
        className={sharedStyles.groupNameField}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        aria-label={t("messages:group.nameAria")}
        maxLength={80}
      />
      <GroupAvatarField
        currentAvatarUrl={active.avatarUrl}
        currentAvatarCrop={active.avatarCrop}
        groupName={active.name}
        onChange={setAvatarUrl}
      />
      <label className={styles.fieldLabel} htmlFor={descriptionFieldId}>
        {t("messages:group.descriptionLabel")}
      </label>
      <textarea
        id={descriptionFieldId}
        className={styles.descriptionField}
        value={description}
        maxLength={MAX_DESCRIPTION_LENGTH}
        placeholder={t("messages:group.descriptionPlaceholder")}
        onChange={(event) => setDescription(event.target.value)}
        aria-describedby={descriptionCounterId}
      />
      <span id={descriptionCounterId} className={styles.descriptionCounter}>
        {description.length}/{MAX_DESCRIPTION_LENGTH}
      </span>
      <div className={sharedStyles.renameActions}>
        <Button variant="ghost" onClick={onCancel}>
          {t("messages:actions.editCancel")}
        </Button>
        <Button
          variant="primary"
          disabled={!title.trim() || managing}
          onClick={save}
        >
          {t("messages:actions.editSave")}
        </Button>
      </div>
    </div>
  );
}
