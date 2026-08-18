import { FiCheck, FiClock, FiX } from "react-icons/fi";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { WriterApplicationDTO } from "./api/writerApplications.api";
import styles from "./SubmitStoryPage.module.css";

export function WriterApplicationStatus({
  application,
  onReapply,
}: {
  application: WriterApplicationDTO;
  onReapply: () => void;
}) {
  const { t } = useTranslation();

  if (application.status === "pending") {
    return (
      <Reveal className={styles.panel}>
        <div className={styles.panelIcon}>
          <FiClock />
        </div>
        <h1 className={styles.panelTitle}>
          <Translation
            i18nKey="magazine:applyToWrite.pending.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.panelSub}>{t("magazine:applyToWrite.pending.body")}</p>
      </Reveal>
    );
  }

  if (application.status === "approved") {
    return (
      <Reveal className={styles.panel}>
        <div className={styles.panelIcon}>
          <FiCheck />
        </div>
        <h1 className={styles.panelTitle}>
          {t("magazine:applyToWrite.approved.title")}
        </h1>
        <p className={styles.panelSub}>
          {t("magazine:applyToWrite.approved.body")}
        </p>
        <div className={styles.panelActions}>
          <Button variant="jade" size="lg" to={routes.submitStory}>
            {t("magazine:applyToWrite.approved.cta")}
          </Button>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal className={styles.panel}>
      <div className={styles.panelIcon}>
        <FiX />
      </div>
      <h1 className={styles.panelTitle}>
        {t("magazine:applyToWrite.declined.title")}
      </h1>
      <p className={styles.panelSub}>{t("magazine:applyToWrite.declined.body")}</p>
      {application.reviewNote && (
        <p className={styles.panelSub}>
          <strong>{t("magazine:applyToWrite.declined.reviewNoteLabel")}</strong>{" "}
          {application.reviewNote}
        </p>
      )}
      <div className={styles.panelActions}>
        <Button variant="jade" size="lg" onClick={onReapply}>
          {t("magazine:applyToWrite.declined.reapplyCta")}
        </Button>
      </div>
    </Reveal>
  );
}
