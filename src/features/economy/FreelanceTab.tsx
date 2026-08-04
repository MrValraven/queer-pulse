import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CALC_TOOLS,
  COMMUNITY_TOOLS,
  TOOLS,
  type ToolCard,
} from "./economy.data";
import styles from "./EconomyPage.module.css";

/** A grid of launcher cards linking out to the real tool pages. */
function ToolGrid({ tools }: { tools: ToolCard[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.toolsGrid}>
      {tools.map((tool) => (
        <Link className={styles.toolCard} key={tool.titleKey} to={tool.to}>
          <div className={styles.toolIcon}>
            <tool.icon />
          </div>
          <div className={styles.toolTitle}>{t(tool.titleKey)}</div>
          <div className={styles.toolDesc}>{t(tool.descKey)}</div>
          <span className={styles.toolCtaBtn}>
            {t(tool.ctaKey)} <FiArrowRight aria-hidden />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function FreelanceTab() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.secHeader}>
        <div>
          <h2 className={styles.econH}>
            <Translation
              i18nKey="economy:freelance.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.econSub}>{t("economy:freelance.sub")}</p>
        </div>
      </div>

      <h3 className={styles.rateH}>
        <Translation
          i18nKey="economy:freelance.section.documents"
          components={{ em: <em /> }}
        />
      </h3>
      <ToolGrid tools={TOOLS} />

      <h3 className={styles.rateH}>
        <Translation
          i18nKey="economy:freelance.section.numbers"
          components={{ em: <em /> }}
        />
      </h3>
      <ToolGrid tools={CALC_TOOLS} />

      <h3 className={styles.rateH}>
        <Translation
          i18nKey="economy:freelance.section.together"
          components={{ em: <em /> }}
        />
      </h3>
      <ToolGrid tools={COMMUNITY_TOOLS} />
    </>
  );
}
