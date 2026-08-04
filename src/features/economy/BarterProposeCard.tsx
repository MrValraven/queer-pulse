import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BarterQuestionModal } from "./BarterQuestionModal";
import styles from "./BarterDetailPage.module.css";

export function BarterProposeCard({
  name,
  firstName,
}: {
  name: string;
  firstName: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [asking, setAsking] = useState(false);

  function send() {
    if (!message.trim()) {
      showToast(t("economy:barterDetail.propose.errorEmpty"), "error");
      return;
    }
    setMessage("");
    showToast(t("economy:barterDetail.propose.toastSent", { name }), "success");
  }

  return (
    <div className={`${styles.sideCard} ${styles.proposeCard}`}>
      <div className={styles.proposeHead}>
        <h4>{t("economy:barterDetail.propose.title")}</h4>
        <div className={styles.lead}>
          <Translation
            i18nKey="economy:barterDetail.propose.lead"
            components={{ em: <em /> }}
          />
        </div>
      </div>
      <div className={styles.proposeBody}>
        <textarea
          className={styles.proposeTextarea}
          aria-label={t("economy:barterDetail.propose.placeholder", {
            firstName,
          })}
          placeholder={t("economy:barterDetail.propose.placeholder", {
            firstName,
          })}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className={styles.proposeActions}>
          <Button
            variant="primary"
            onClick={send}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {t("economy:barterDetail.propose.sendCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
          <Button
            variant="ghost"
            onClick={() => setAsking(true)}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {t("economy:barterDetail.propose.askFirst")}
          </Button>
        </div>
        <p className={styles.proposeFoot}>
          {t("economy:barterDetail.propose.footNote")}
        </p>
      </div>

      {asking && (
        <BarterQuestionModal
          name={name}
          firstName={firstName}
          onClose={() => setAsking(false)}
        />
      )}
    </div>
  );
}
