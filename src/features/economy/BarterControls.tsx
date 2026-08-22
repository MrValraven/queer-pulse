import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CATS, MODES, type Mode } from "./barter.data";
import { MY_BARTER_PROPOSALS_PATH } from "./barterProposals.paths";
import styles from "./BarterPage.module.css";

/**
 * The board's three controls (search, offering/seeking tabs, category chips),
 * the running count, and the way in to your own swaps.
 *
 * `total` is the whole board in live mode rather than the pages loaded so far,
 * so the number never shrinks to "what you can currently see" once the board
 * pages.
 */
export function BarterControls({
  query,
  onQueryChange,
  mode,
  onModeChange,
  category,
  onCategoryChange,
  total,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  mode: "all" | Mode;
  onModeChange: (mode: "all" | Mode) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  total: number;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.controls}>
      <div className="wrap">
        <div className={styles.controlsRow}>
          <input
            className={styles.search}
            type="text"
            aria-label={t("economy:barter.search.placeholder")}
            placeholder={t("economy:barter.search.placeholder")}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <div className={styles.modeTabs}>
            {MODES.map((modeOption) => (
              <button
                type="button"
                key={modeOption.value}
                className={[
                  styles.modeTab,
                  mode === modeOption.value && styles.modeTabActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onModeChange(modeOption.value)}
              >
                {t(modeOption.labelKey)}
              </button>
            ))}
          </div>
          <span className={styles.count}>
            <Translation
              i18nKey="economy:barter.count"
              values={{ count: total }}
              components={{ b: <b /> }}
            />
          </span>
          {/* The way in to your own swaps and the proposals waiting on them.
              Without it the inbox is only reachable from a notification. */}
          <Link to={MY_BARTER_PROPOSALS_PATH} className={styles.myProposalsLink}>
            {t("economy:barterProposals.entryLink")}
          </Link>
        </div>
        <div className={styles.cats}>
          {CATS.map((categoryOption) => (
            <button
              type="button"
              key={categoryOption.value}
              className={[
                styles.chip,
                category === categoryOption.value && styles.chipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onCategoryChange(categoryOption.value)}
            >
              {t(categoryOption.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
