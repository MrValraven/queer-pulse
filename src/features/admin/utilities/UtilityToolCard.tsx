import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { UtilityTool } from "./utilityTools.data";
import styles from "./UtilitiesHubPage.module.css";

/** One tool on the hub. The whole card is the link. */
export function UtilityToolCard({ tool }: { tool: UtilityTool }) {
  const { t } = useTranslation();
  const ToolIcon = tool.icon;
  return (
    <Link to={tool.to} className={styles.card}>
      <span className={styles.iconCircle} aria-hidden="true">
        <ToolIcon />
      </span>
      <h2 className={styles.cardName}>{t(tool.nameKey)}</h2>
      <p className={styles.cardDescription}>{t(tool.descriptionKey)}</p>
      <span className={styles.arrow} aria-hidden="true">
        <FiArrowRight />
      </span>
    </Link>
  );
}
