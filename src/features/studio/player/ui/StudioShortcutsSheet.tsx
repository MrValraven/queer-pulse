import { AnimatePresence } from "motion/react";
import { Button, Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { StudioShortcutList } from "./StudioShortcutList";

function StudioShortcutsSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("studio:shortcuts.title")}
      sub={t("studio:shortcuts.dek")}
      onClose={onClose}
      isStudioPlayerSurface
      footer={
        <Button onClick={onClose}>{t("studio:shortcuts.closeCta")}</Button>
      }
    >
      <StudioShortcutList />
    </Modal>
  );
}

/** The `?` help sheet (spec 7.9), mounted with the player bar. */
export function StudioShortcutsSheetHost() {
  const surface = useStudioPlayerSurface();
  return (
    <AnimatePresence>
      {surface.isShortcutsOpen && (
        <StudioShortcutsSheet
          key="shortcuts"
          onClose={surface.closeShortcuts}
        />
      )}
    </AnimatePresence>
  );
}
