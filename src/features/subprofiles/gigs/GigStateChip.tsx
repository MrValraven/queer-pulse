import { FiStar, FiUsers, FiXCircle } from "react-icons/fi";
import type { IconType } from "react-icons";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { GIG_STATE_LABEL } from "../personaSkinRender";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import styles from "./GigStateChip.module.css";

const STATE_ICON: Record<"sold_out" | "cancelled" | "guest", IconType> = {
  sold_out: FiUsers,
  cancelled: FiXCircle,
  guest: FiStar,
};

/**
 * The editor's gig state chip. Icon plus text so the state is never carried by
 * colour alone, styled from tokens so it works outside the `.pp` skin
 * (the public `.gigstate` chip reads variables defined only there). Renders nothing for a standard
 * gig (no state).
 */
export function GigStateChip({
  gigState,
}: {
  gigState: SubprofileItemView["gigState"];
}) {
  const { t } = useTranslation();
  if (!gigState) return null;
  const Icon = STATE_ICON[gigState];
  return (
    <span className={`${styles.chip} ${styles[gigState]}`}>
      <Icon className={styles.icon} aria-hidden />
      {t(GIG_STATE_LABEL[gigState])}
    </span>
  );
}
