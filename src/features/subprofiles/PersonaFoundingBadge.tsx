import { FiAward } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioFoundingArtistIds } from "../studio/api/useStudioFoundingArtists";
import styles from "./PersonaFoundingBadge.module.css";

/** The "Founding artist" chip on a persona page and its showcase card. A
 *  public view carries `isFoundingArtist`; the owner's own view does not, so
 *  the founding id set (granted members) fills that gap. */
export function PersonaFoundingBadge({
  subprofileId,
  isFoundingArtist,
}: {
  subprofileId: string;
  isFoundingArtist?: boolean;
}) {
  const { t } = useTranslation();
  const foundingIds = useStudioFoundingArtistIds();
  if (isFoundingArtist !== true && !foundingIds.has(subprofileId)) return null;
  return (
    <span className={`pp-founding ${styles.badge}`}>
      <FiAward aria-hidden="true" fill="none" />
      {t("subprofiles:foundingArtist.badge")}
    </span>
  );
}
