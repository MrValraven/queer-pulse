import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { cx } from "../../../shared/lib/cx";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import styles from "./PoemReaderPager.module.css";

export interface PoemReaderPagerProps {
  poems: SubprofileItemView[];
  /** Where the open poem sits in `poems`; -1 renders nothing. */
  poemIndex: number;
  onGoTo: (index: number) => void;
}

/**
 * The foot of the poem: "Previous poem" and "Next poem", each naming its
 * target, then "3 of 9". At either end only the link that leads somewhere
 * shows. The buttons stay mounted while the reader moves, so a keyboard
 * user who pressed Next keeps focus on it; only the titles inside fade over.
 */
export function PoemReaderPager({
  poems,
  poemIndex,
  onGoTo,
}: PoemReaderPagerProps) {
  const { t } = useTranslation();
  if (poemIndex < 0 || poems.length < 2) return null;
  const previousPoem = poems[poemIndex - 1];
  const nextPoem = poems[poemIndex + 1];

  return (
    <div className={styles.pager}>
      {previousPoem && (
        <button
          type="button"
          className={styles.link}
          onClick={() => onGoTo(poemIndex - 1)}
        >
          <span className={styles.label}>
            <FiArrowLeft aria-hidden /> {t("subprofiles:poem.reader.previous")}
          </span>
          <span key={previousPoem.id} className={styles.title}>
            {previousPoem.title}
          </span>
        </button>
      )}
      {nextPoem && (
        <button
          type="button"
          className={cx(styles.link, styles.linkNext)}
          onClick={() => onGoTo(poemIndex + 1)}
        >
          <span className={styles.label}>
            {t("subprofiles:poem.reader.next")} <FiArrowRight aria-hidden />
          </span>
          <span key={nextPoem.id} className={styles.title}>
            {nextPoem.title}
          </span>
        </button>
      )}
      <p className={styles.position}>
        {t("subprofiles:poem.reader.position", {
          index: poemIndex + 1,
          total: poems.length,
        })}
      </p>
    </div>
  );
}
