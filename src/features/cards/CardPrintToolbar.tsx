import { useNavigate } from "react-router-dom";
import { FiPrinter } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { modCardPrint } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CardHoldersPanel.module.css";

/**
 * Select-all and the handoff to the print sheet.
 *
 * The selection travels in router location state rather than in the URL: a
 * roster of two hundred members would produce a query string long enough to
 * be truncated somewhere between here and the print page. Opening that route
 * cold falls back to every active holder, so a lost state object degrades
 * into the sensible batch instead of an error.
 */
export function CardPrintToolbar({
  slug,
  selectedIds,
  activeCount,
  onSelectAll,
  onClearSelection,
}: {
  slug: string;
  selectedIds: readonly string[];
  activeCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const selectedCount = selectedIds.length;
  const isAllSelected = selectedCount > 0 && selectedCount === activeCount;

  return (
    <div className={styles.printToolbar}>
      <Button
        variant="ghost"
        size="sm"
        onClick={isAllSelected ? onClearSelection : onSelectAll}
      >
        {isAllSelected
          ? t("cards:holders.clearSelection")
          : t("cards:holders.selectAllActive")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={selectedCount === 0}
        onClick={() =>
          void navigate(modCardPrint(slug), { state: { selectedIds } })
        }
      >
        <FiPrinter aria-hidden="true" />{" "}
        {t("cards:holders.printSelected", { count: selectedCount })}
      </Button>
    </div>
  );
}
