import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { SideCard } from "./SideCard";
import styles from "./EditorDashboardPage.module.css";

/** Coral quick-actions card. */
export function QuickActionsCard({
  onStub,
}: {
  onStub: (message: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <SideCard
      title={t("magazine:editor.sideCards.quickActions")}
      className={styles.qaCard}
    >
      <div className={styles.qa}>
        <button
          type="button"
          onClick={() => onStub(t("magazine:editor.toast.openingBulkTriage"))}
        >
          <FiArrowRight aria-hidden />{" "}
          {t("magazine:editor.sideCards.sendPitchDecisions")}
        </button>
        <button
          type="button"
          onClick={() =>
            onStub(t("magazine:editor.toast.draftingReminders", { count: 3 }))
          }
        >
          <FiArrowRight aria-hidden />{" "}
          {t("magazine:editor.sideCards.emailContributorsWaiting")}
        </button>
        <Link to={routes.issue}>
          <FiArrowRight aria-hidden />{" "}
          {t("magazine:editor.sideCards.previewIssueLayout")}
        </Link>
        <button
          type="button"
          onClick={() =>
            onStub(t("magazine:editor.toast.contributorListExported"))
          }
        >
          <FiArrowRight aria-hidden />{" "}
          {t("magazine:editor.sideCards.exportContributorList")}
        </button>
      </div>
    </SideCard>
  );
}
