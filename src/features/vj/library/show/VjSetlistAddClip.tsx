import { useId, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import type { VjClipDTO } from "../../../../shared/contracts/vj";
import {
  Button,
  Select,
  type SelectOption,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjPacks } from "../../api/useVjPacks";
import styles from "./VjSetlists.module.css";

const THUMB_SIZE = 32;

export interface VjSetlistAddClipProps {
  /** The library's clips, newest first. A clip in the list has finished
   *  uploading, so every one can play. */
  clips: readonly VjClipDTO[];
  /** The sequence holds the most steps it may; adding is blocked. */
  isFull: boolean;
  /** A save of the steps is on its way. */
  isPending: boolean;
  onAdd: (clipId: string) => void;
}

/**
 * Picks a clip and adds it to the end of the sequence as a clip step. The
 * search matches the clip title and the packs it sits in; each option shows
 * the clip's thumbnail and its packs. Any clip may be picked again. The
 * button stays reachable and says it is blocked (`aria-disabled`) with no
 * choice, while a save runs, or when the sequence is full.
 */
export function VjSetlistAddClip({
  clips,
  isFull,
  isPending,
  onAdd,
}: VjSetlistAddClipProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  const packsQuery = useVjPacks();
  const [chosenClipId, setChosenClipId] = useState<string | null>(null);

  const packNameById = useMemo(
    () => new Map((packsQuery.data ?? []).map((pack) => [pack.id, pack.name])),
    [packsQuery.data],
  );
  const clipById = new Map(clips.map((clip) => [clip.id, clip]));
  const packLineOf = (clip: VjClipDTO): string => {
    const packNames = clip.packIds.flatMap((packId) => {
      const packName = packNameById.get(packId);
      return packName === undefined ? [] : [packName];
    });
    return packNames.length === 0
      ? t("vj:libraryScenes.packNone")
      : packNames.join(", ");
  };
  const options: SelectOption[] = clips.map((clip) => ({
    value: clip.id,
    label: clip.title,
    keywords: `${clip.title} ${packLineOf(clip)}`,
  }));

  // A clip deleted in another tab drops out of the choice.
  const shownChoice =
    chosenClipId !== null && clipById.has(chosenClipId) ? chosenClipId : null;
  const isBlocked = shownChoice === null || isPending || isFull;

  const add = () => {
    if (isBlocked) return;
    onAdd(shownChoice);
    setChosenClipId(null);
  };

  return (
    <div className={styles.addScene}>
      <span id={labelId} className={styles.addLabel}>
        {t("vj:setlistItems.addClipLabel")}
      </span>
      <div className={styles.addRow}>
        <Select
          className={styles.addSelect}
          labelledBy={labelId}
          options={options}
          value={shownChoice}
          onChange={setChosenClipId}
          placeholder={t("vj:setlistItems.addClipPlaceholder")}
          searchable
          searchPlaceholder={t("vj:setlistItems.addClipSearch")}
          emptyText={t("vj:setlistItems.addClipEmpty")}
          renderOption={(option) => {
            const clip = clipById.get(option.value);
            return (
              <span className={styles.clipOption}>
                <span className={styles.thumb} aria-hidden="true">
                  {clip !== undefined && (
                    <img
                      src={clip.thumbnailUrl}
                      width={THUMB_SIZE}
                      height={THUMB_SIZE}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </span>
                <span className={styles.option}>
                  <span className={styles.optionName}>{option.label}</span>
                  <span className={styles.optionPack}>
                    {clip === undefined ? "" : packLineOf(clip)}
                  </span>
                </span>
              </span>
            );
          }}
        />
        <Button
          variant="soft"
          size="sm"
          className={styles.addSubmit}
          aria-disabled={isBlocked ? "true" : undefined}
          aria-describedby={shownChoice === null ? hintId : undefined}
          onClick={add}
        >
          <FiPlus aria-hidden="true" fill="none" focusable="false" />
          {t("vj:setlistItems.addClipSubmit")}
        </Button>
        {/* Why the button is blocked with nothing chosen yet. */}
        <span id={hintId} className="visuallyHidden">
          {t("vj:setlistItems.addClipHint")}
        </span>
      </div>
    </div>
  );
}
