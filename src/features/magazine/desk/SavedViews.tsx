import { FiPlus } from "react-icons/fi";
import { cx } from "../../../shared/lib/cx";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SAVED_VIEWS, VIEW_TEST } from "../data/desk.copy";
import type { Piece, SavedViewId } from "../data/desk.data";
import styles from "./SavedViews.module.css";

/**
 * Saved-views strip: one chip per `SAVED_VIEWS` entry showing the live count
 * of pieces matching its predicate, plus a "+ Save this view" chip.
 */
export function SavedViews({
  pieces,
  active,
  onToggle,
  onSave,
}: {
  pieces: Piece[];
  active: SavedViewId | null;
  onToggle: (id: SavedViewId) => void;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.views}>
      {SAVED_VIEWS.map((view) => {
        const count = pieces.filter(VIEW_TEST[view.id]).length;
        return (
          <button
            key={view.id}
            type="button"
            className={cx(styles.chip, active === view.id && styles.chipOn)}
            aria-pressed={active === view.id}
            onClick={() => onToggle(view.id)}
          >
            {t(view.labelKey)}{" "}
            <span>
              <RollingNumber value={fmt.number(count)} numericValue={count} />
            </span>
          </button>
        );
      })}
      <button type="button" className={styles.chip} onClick={onSave}>
        <FiPlus aria-hidden />
        {t("magazine:desk.savedViews.saveThisView")}
      </button>
    </div>
  );
}
