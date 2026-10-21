import {
  FormField,
  Select,
  type SelectOption,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioScenes } from "./api/useStudioScenes";
import s from "./creator.module.css";
import fieldStyles from "./StudioTrackFields.module.css";

/** The optional scene select: active scenes in staff order, plus the
 *  release's current scene when it was archived since (the link stays until
 *  the artist changes it). */
export function StudioUploadSceneField({
  value,
  onChange,
}: {
  value: string;
  onChange: (sceneId: string) => void;
}) {
  const { t } = useTranslation();
  const { scenes, loadState } = useStudioScenes();
  const isCurrentListed =
    value === "" || scenes.some((scene) => scene.id === value);
  let currentOption: SelectOption[] = [];
  if (!isCurrentListed) {
    currentOption = [
      {
        value,
        label: loadState.isLoading
          ? t("studio:uploadFlow.release.sceneLoading")
          : loadState.isError
            ? t("studio:uploadFlow.release.sceneUnavailable")
            : t("studio:uploadFlow.release.sceneArchived"),
      },
    ];
  }
  const options: SelectOption[] = [
    { value: "", label: t("studio:uploadFlow.release.sceneNone") },
    ...currentOption,
    ...scenes.map((scene) => ({
      value: scene.id,
      label: t("studio:uploadFlow.release.sceneOption", {
        name: scene.name,
        city: scene.city,
      }),
    })),
  ];
  return (
    <FormField
      className={`${s.field} ${fieldStyles.studioField}`}
      label={t("studio:uploadFlow.release.sceneLabel")}
      helper={t("studio:uploadFlow.release.sceneHint")}
    >
      <Select
        options={options}
        value={value}
        loading={loadState.isLoading}
        onChange={(next) => onChange(next ?? "")}
      />
    </FormField>
  );
}
