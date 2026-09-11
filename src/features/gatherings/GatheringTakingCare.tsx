import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiAlertTriangle, FiBookOpen, FiTag } from "react-icons/fi";
import { Tag } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CONTENT_NOTE_LABEL_KEYS,
  THEME_ICONS,
  THEME_LABEL_KEYS,
} from "./gatheringExtras";
import type { GatheringDetail } from "./data";
import styles from "./GatheringDetailPanels.module.css";

/** One labelled fact in the row shape "Good to know" and "Where" use, so the
 *  three panels read as one surface. */
function CareRow({
  icon: Icon,
  label,
  children,
}: {
  icon: IconType;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowIcon} aria-hidden>
        <Icon />
      </span>
      <div className={styles.rowText}>
        <span className={styles.rowLabel}>{label}</span>
        {children}
      </div>
    </div>
  );
}

/**
 * "Taking care": what the host asked of everyone who comes, what the gathering
 * contains, and the themes pinned to its card (Create Gathering v2).
 *
 * House rules are the host's own words and render untranslated. Content notes
 * and themes are catalog keys, already narrowed to the vocabulary by the
 * adapter, so each one reads in the reader's language. Content notes carry the
 * alert icon because they are the line a reader checks before deciding to
 * come.
 *
 * Renders nothing when the host set none of it, which also covers every demo
 * gathering: the demo registry carries none of these fields.
 */
export function GatheringTakingCare({
  gathering,
}: {
  gathering: GatheringDetail;
}) {
  const { t } = useTranslation();
  const houseRules = gathering.houseRules?.trim();
  const contentNotes = gathering.contentNotes ?? [];
  const themes = gathering.themes ?? [];
  if (!houseRules && contentNotes.length === 0 && themes.length === 0) {
    return null;
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>{t("gatherings:detail.care.title")}</h2>
      <div className={styles.rows}>
        {houseRules && (
          <CareRow
            icon={FiBookOpen}
            label={t("gatherings:detail.care.houseRulesLabel")}
          >
            <p className={`${styles.rowValue} ${styles.careRules}`}>
              {houseRules}
            </p>
          </CareRow>
        )}
        {contentNotes.length > 0 && (
          <CareRow
            icon={FiAlertTriangle}
            label={t("gatherings:detail.care.contentNotesLabel")}
          >
            <ul className={styles.careTags}>
              {contentNotes.map((note) => (
                <li key={note}>
                  <Tag>{t(CONTENT_NOTE_LABEL_KEYS[note])}</Tag>
                </li>
              ))}
            </ul>
          </CareRow>
        )}
        {themes.length > 0 && (
          <CareRow icon={FiTag} label={t("gatherings:detail.care.themesLabel")}>
            <ul className={styles.careTags}>
              {themes.map((theme) => {
                const ThemeIcon = THEME_ICONS[theme];
                return (
                  <li key={theme}>
                    <Tag className={styles.careTag}>
                      <ThemeIcon aria-hidden />
                      {t(THEME_LABEL_KEYS[theme])}
                    </Tag>
                  </li>
                );
              })}
            </ul>
          </CareRow>
        )}
      </div>
    </section>
  );
}
