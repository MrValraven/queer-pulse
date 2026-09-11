import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ChipToggleGroup } from "../CreateGatheringFields";
import {
  CONTENT_NOTE_KEYS,
  CONTENT_NOTE_LABEL_KEYS,
  type ContentNoteKey,
} from "../gatheringExtras";

/**
 * The content-note chips as a value and a toggle.
 *
 * Shared by the create wizard's care chapter and the edit-details modal; each
 * surface draws its own label and hands its id in as `labelledBy`.
 */
export function ContentNoteChips({
  selectedNotes,
  onToggle,
  labelledBy,
}: {
  selectedNotes: readonly ContentNoteKey[];
  onToggle: (note: ContentNoteKey) => void;
  /** The id of the visible label that names the chips. */
  labelledBy: string;
}) {
  const { t } = useTranslation();
  return (
    <ChipToggleGroup
      options={CONTENT_NOTE_KEYS.map((contentNote) => ({
        key: contentNote,
        label: t(CONTENT_NOTE_LABEL_KEYS[contentNote]),
      }))}
      selectedKeys={selectedNotes}
      onToggle={onToggle}
      labelledBy={labelledBy}
    />
  );
}
