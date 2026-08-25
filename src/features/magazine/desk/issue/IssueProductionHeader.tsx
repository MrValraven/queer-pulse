import { FiArrowLeft } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import styles from "../../IssueProductionPage.module.css";

export interface IssueProductionHeaderProps {
  number: string;
  theme: string;
  readyCount: number;
  totalCount: number;
  onShip: () => void;
}

/**
 * The issue-production top bar: back to the desk, the issue's number and
 * theme, how many pieces are laid out, and the proof/ship actions. Extracted
 * from `IssueProductionPage` to keep that route component inside the
 * 200-line budget.
 */
export function IssueProductionHeader({
  number,
  theme,
  readyCount,
  totalCount,
  onShip,
}: IssueProductionHeaderProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();

  return (
    <div className={styles.ebar}>
      <Button
        variant="ghost"
        size="sm"
        to={routes.magazineEditor}
        aria-label={t("magazine:issue.header.backToDesk")}
      >
        <FiArrowLeft aria-hidden />
      </Button>
      <div className={styles.title}>
        <b>{t("magazine:issue.header.title", { number, theme })}</b>
        <span className={styles.titleSub}>
          {t("magazine:issue.header.laidOut", {
            ready: readyCount,
            total: totalCount,
          })}
        </span>
      </div>
      <div className={styles.right}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => showToast(t("magazine:issue.header.proofToast"))}
        >
          {t("magazine:issue.header.proof")}
        </Button>
        <Button variant="plum" size="sm" onClick={onShip}>
          {t("magazine:issue.ship.cta")}
        </Button>
      </div>
    </div>
  );
}
