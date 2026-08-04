import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SexualHealthPage.module.css";

/** The "nominate a clinic" anonymous submission box under the testing tab. */
export function TestingNominate() {
  const { t } = useTranslation();
  const [nomination, setNomination] = useState("");
  const [nominated, setNominated] = useState(false);

  return (
    <div className={styles.anonBox}>
      {nominated ? (
        <div className={styles.anonDone}>
          <span className={styles.anonDoneIcon} aria-hidden>
            <FiCheck />
          </span>
          <div className={styles.anonDoneTitle}>
            <Translation
              i18nKey="resources:sexualHealth.testing.nominate.doneTitle"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.anonDoneBody}>
            {t("resources:sexualHealth.testing.nominate.doneBody")}
          </p>
          <Button variant="ghost-dark" onClick={() => setNominated(false)}>
            {t("resources:sexualHealth.testing.nominate.anotherCta")}
          </Button>
        </div>
      ) : (
        <>
          <h3>{t("resources:sexualHealth.testing.nominate.title")}</h3>
          <p>{t("resources:sexualHealth.testing.nominate.body")}</p>
          <textarea
            className={styles.anonInput}
            style={{ minHeight: 52 }}
            value={nomination}
            onChange={(e) => setNomination(e.target.value)}
            placeholder={t(
              "resources:sexualHealth.testing.nominate.placeholder",
            )}
            aria-label={t("resources:sexualHealth.testing.nominate.placeholder")}
          />
          <div style={{ marginTop: 12 }}>
            <Button
              variant="primary"
              disabled={nomination.trim().length < 5}
              onClick={() => {
                setNomination("");
                setNominated(true);
              }}
            >
              {t("resources:sexualHealth.testing.nominate.submitCta")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
