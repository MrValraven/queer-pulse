import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistPersonView } from "./api/studio.adapters";
import { StudioPlaylistPersonAvatar } from "./StudioPlaylistPersonAvatar";
import css from "./StudioPlaylistPage.module.css";

/** Who added an entry, under its artist line. The owner and editors only:
 *  the adapter clears it for everyone else. */
export function StudioPlaylistAddedBy({
  person,
}: {
  person: StudioPlaylistPersonView;
}) {
  const { t } = useTranslation();
  return (
    <div className={css.addedBy}>
      <span className={css.addedByFace} aria-hidden>
        <StudioPlaylistPersonAvatar person={person} size={16} />
      </span>
      <span>{t("studio:playlist.row.addedBy", { name: person.name })}</span>
    </div>
  );
}
