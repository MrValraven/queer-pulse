import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import styles from "./ApplicationModals.module.css";

const MIN_QUESTION_LENGTH = 10;

export function BarterQuestionModal({
  name,
  firstName,
  onClose,
}: {
  name: string;
  firstName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [question, setQuestion] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid = question.trim().length >= MIN_QUESTION_LENGTH;
  const remaining = MIN_QUESTION_LENGTH - question.trim().length;

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:barterQuestion.success.title")}
          em={t("economy:barterQuestion.success.em")}
          onClose={onClose}
          closeLabel={t("economy:barterQuestion.success.closeLabel")}
        >
          <Translation
            i18nKey="economy:barterQuestion.success.body"
            values={{ name }}
            components={{ strong: <strong /> }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("economy:barterQuestion.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:barterQuestion.title"
              values={{ firstName }}
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:barterQuestion.sub")}</p>

          <div className={styles.field}>
            <label htmlFor="bq-msg">
              {t("economy:barterQuestion.fieldLabel")}
            </label>
            <textarea
              id="bq-msg"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("economy:barterQuestion.placeholder", {
                firstName,
              })}
            />
          </div>
          <p className={styles.note}>
            {remaining > 0
              ? t("economy:barterQuestion.charsRemaining", {
                  count: remaining,
                })
              : t("economy:barterQuestion.keepOnPlatform")}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:barterQuestion.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
            >
              {sending ? (
                <Sending label={t("economy:barterQuestion.sendingLabel")} />
              ) : (
                t("economy:barterQuestion.sendCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
