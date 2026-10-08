import type { ReactNode } from "react";
import { FiMapPin } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import type { DirectoryPlace } from "../marketing/directoryPlaces";
import styles from "./VenuePickerInline.module.css";

/**
 * The square tile that fronts a venue in the inline picker. A directory
 * listing shows its initials on its own tint, drawn by the shared `Avatar`
 * so the colours match the listing everywhere else in the app (the wrapper
 * only squares the corners). A venue with no listing behind it, or a row
 * that is an action, gets a neutral tile carrying an icon instead.
 */
export function VenuePlaceTile({
  place,
  icon,
  size = 40,
}: {
  place?: Pick<DirectoryPlace, "av" | "tint"> | null;
  /** The neutral tile's icon. Defaults to a map pin. */
  icon?: ReactNode;
  size?: number;
}) {
  if (place) {
    return (
      <span className={styles.tile} aria-hidden>
        <Avatar initials={place.av} tint={place.tint} size={size} />
      </span>
    );
  }
  return (
    <span
      className={styles.neutralTile}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {icon ?? <FiMapPin />}
    </span>
  );
}
