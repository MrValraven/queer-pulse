import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";
import styles from "./studio.module.css";

/** The rail's Create playlist pill. It opens the create dialog and, once the
 *  playlist is saved, goes to it (the Library page does the same). */
export function StudioRailCreatePlaylist() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={styles.railCreate}
        onClick={() => setIsCreating(true)}
      >
        <FiPlus aria-hidden /> {t("studio:libraryLive.newPlaylistCta")}
      </Button>
      <AnimatePresence>
        {isCreating && (
          <StudioPlaylistDialog
            key="create"
            mode="create"
            onClose={() => setIsCreating(false)}
            onSaved={(playlist) => {
              setIsCreating(false);
              void navigate(playlist.href);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
