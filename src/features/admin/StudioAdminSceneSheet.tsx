import { SideSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminStudioSceneDTO } from "./api/studioDiscoveryAdmin.api";
import { StudioAdminSceneEvents } from "./StudioAdminSceneEvents";
import { StudioAdminSceneReleases } from "./StudioAdminSceneReleases";
import css from "./StudioAdminScenes.module.css";

/** A scene's pinned events and its releases, in a side sheet. */
export function StudioAdminSceneSheet({
  scene,
  onClose,
}: {
  scene: AdminStudioSceneDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <SideSheet
      title={t("admin:studioAdmin.sceneSheet.title", { name: scene.name })}
      onClose={onClose}
    >
      <div className={css.sheetBody}>
        <StudioAdminSceneEvents sceneId={scene.id} />
        <StudioAdminSceneReleases sceneId={scene.id} />
      </div>
    </SideSheet>
  );
}
