import { useId, useState } from "react";
import {
  VJ_LIMITS,
  type UpdateVjSceneBody,
  type VjPackDTO,
  type VjSceneDTO,
} from "../../../../shared/contracts/vj";
import { Select, type SelectOption } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjSceneMutations } from "../../api/useVjSceneMutations";
import { VjNameForm } from "./VjNameForm";
import styles from "./VjScenes.module.css";

/** The select's value for No pack; pack ids are uuids, so it never clashes. */
const NO_PACK_VALUE = "none";

/** Only the fields that changed; an empty body means nothing to send. */
function changesOf(
  scene: VjSceneDTO,
  name: string,
  packId: string | null,
): UpdateVjSceneBody {
  const changes: UpdateVjSceneBody = {};
  if (name !== scene.name) changes.name = name;
  if (packId !== scene.packId) changes.packId = packId;
  return changes;
}

/**
 * The scene's name and pack, saved together by "Save scene". It sends only
 * what changed; the look itself is edited on the remote.
 */
export function VjSceneEditForm({
  scene,
  packs,
  onDone,
}: {
  scene: VjSceneDTO;
  packs: readonly VjPackDTO[];
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { updateScene } = useVjSceneMutations();
  const packLabelId = useId();
  // A pack deleted elsewhere reads as No pack until the scene reloads.
  const isPackKnown = packs.some((pack) => pack.id === scene.packId);
  const [packId, setPackId] = useState<string | null>(
    isPackKnown ? scene.packId : null,
  );

  const options: SelectOption[] = [
    { value: NO_PACK_VALUE, label: t("vj:libraryScenes.packNone") },
    ...packs.map((pack) => ({
      value: pack.id,
      label: pack.name,
      keywords: pack.name,
    })),
  ];

  const submit = (name: string) => {
    if (updateScene.isPending) return;
    const changes = changesOf(scene, name, packId);
    if (Object.keys(changes).length === 0) {
      onDone();
      return;
    }
    void updateScene
      .mutateAsync({ sceneId: scene.id, ...changes })
      .then(() => {
        showToast(t("vj:libraryScenes.saved"), "success");
        onDone();
      })
      .catch(() => undefined);
  };

  return (
    <VjNameForm
      label={t("vj:libraryScenes.nameLabel")}
      initialName={scene.name}
      submitLabel={t("vj:libraryScenes.save")}
      maxLength={VJ_LIMITS.sceneNameMax}
      blankCode="VJ_SCENE_NAME_REQUIRED"
      isPending={updateScene.isPending}
      refusal={updateScene.error}
      onSubmit={submit}
      onCancel={onDone}
    >
      <div className={styles.packField}>
        <span id={packLabelId} className={styles.packLabel}>
          {t("vj:libraryScenes.packLabel")}
        </span>
        <Select
          labelledBy={packLabelId}
          options={options}
          value={packId ?? NO_PACK_VALUE}
          onChange={(value) =>
            setPackId(value === null || value === NO_PACK_VALUE ? null : value)
          }
        />
      </div>
    </VjNameForm>
  );
}
