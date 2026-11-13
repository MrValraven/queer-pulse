import { useId, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import type { VjSceneDTO } from "../../../../shared/contracts/vj";
import {
  Button,
  Select,
  type SelectOption,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjPacks } from "../../api/useVjPacks";
import styles from "./VjSetlists.module.css";

export interface VjSetlistAddSceneProps {
  scenes: readonly VjSceneDTO[];
  /** The sequence holds the most steps it may; adding is blocked. */
  isFull: boolean;
  /** A save of the steps is on its way. */
  isPending: boolean;
  onAdd: (sceneId: string) => void;
}

/**
 * Picks a scene and adds it to the end of the sequence as a scene step. Any
 * scene may be picked again, so one scene can play twice in a show. The
 * button stays reachable and says it is blocked (`aria-disabled`) with no
 * choice, while a save runs, or when the sequence is full.
 */
export function VjSetlistAddScene({
  scenes,
  isFull,
  isPending,
  onAdd,
}: VjSetlistAddSceneProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const hintId = useId();
  const packsQuery = useVjPacks();
  const [chosenSceneId, setChosenSceneId] = useState<string | null>(null);

  const packNameById = useMemo(
    () => new Map((packsQuery.data ?? []).map((pack) => [pack.id, pack.name])),
    [packsQuery.data],
  );
  const packLineBySceneId = new Map(
    scenes.map((scene) => [
      scene.id,
      (scene.packId === null ? undefined : packNameById.get(scene.packId)) ??
        t("vj:libraryScenes.packNone"),
    ]),
  );
  const options: SelectOption[] = scenes.map((scene) => ({
    value: scene.id,
    label: scene.name,
    keywords: `${scene.name} ${packLineBySceneId.get(scene.id) ?? ""}`,
  }));

  // A scene deleted in another tab drops out of the choice.
  const shownChoice =
    chosenSceneId !== null && packLineBySceneId.has(chosenSceneId)
      ? chosenSceneId
      : null;
  const isBlocked = shownChoice === null || isPending || isFull;

  const add = () => {
    if (isBlocked) return;
    onAdd(shownChoice);
    setChosenSceneId(null);
  };

  return (
    <div className={styles.addScene}>
      <span id={labelId} className={styles.addLabel}>
        {t("vj:setlistItems.addLabel")}
      </span>
      <div className={styles.addRow}>
        <Select
          className={styles.addSelect}
          labelledBy={labelId}
          options={options}
          value={shownChoice}
          onChange={setChosenSceneId}
          placeholder={t("vj:setlistItems.addPlaceholder")}
          searchable
          searchPlaceholder={t("vj:setlistItems.addSearch")}
          emptyText={t("vj:setlistItems.addEmpty")}
          renderOption={(option) => (
            <span className={styles.option}>
              <span className={styles.optionName}>{option.label}</span>
              <span className={styles.optionPack}>
                {packLineBySceneId.get(option.value)}
              </span>
            </span>
          )}
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
          {t("vj:setlistItems.addSubmit")}
        </Button>
        {/* Why the button is blocked with nothing chosen yet. */}
        <span id={hintId} className="visuallyHidden">
          {t("vj:setlistItems.addSceneHint")}
        </span>
      </div>
    </div>
  );
}
