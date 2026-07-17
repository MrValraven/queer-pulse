import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import { APPLY_FOCUS_AREAS } from "./mentorProfile.data";
import styles from "./ApplicationModals.module.css";

const MIN_MESSAGE_LENGTH = 30;

export function MentorApplyModal({
  mentorName,
  onClose,
}: {
  mentorName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [focus, setFocus] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { sending, done, submit } = useSubmitFlow();
  const valid = !!focus && message.trim().length >= MIN_MESSAGE_LENGTH;
  const remaining = MIN_MESSAGE_LENGTH - message.trim().length;
  const firstName = mentorName.split(" ")[0] ?? mentorName;

  const toggle = (area: string) =>
    setFocus((cur) => (cur === area ? null : area));

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:mentorApply.success.title")}
          em={t("economy:mentorApply.success.em")}
          onClose={onClose}
          closeLabel={t("economy:mentorApply.success.closeLabel")}
        >
          <Translation
            i18nKey="economy:mentorApply.success.body"
            values={{ mentorName, focus: focus ?? "" }}
            components={{ strong: <strong /> }}
          />
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>
            {t("economy:mentorApply.eyebrow")}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:mentorApply.title"
              values={{ firstName }}
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.sub}>{t("economy:mentorApply.sub")}</p>

          <div className={styles.field}>
            <label>{t("economy:mentorApply.focusAreaLabel")}</label>
            <div className={styles.levers}>
              {APPLY_FOCUS_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  className={[styles.lever, focus === area && styles.leverOn]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggle(area)}
                  aria-pressed={focus === area}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="ma-msg">
              {t("economy:mentorApply.noteLabel", { firstName })}
            </label>
            <textarea
              id="ma-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("economy:mentorApply.notePlaceholder")}
            />
          </div>
          <p className={styles.note}>
            {remaining > 0
              ? t("economy:mentorApply.charsRemaining", { count: remaining })
              : t("economy:mentorApply.polishedHint")}
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              {t("economy:mentorApply.cancel")}
            </button>
            <Button
              variant="primary"
              size="lg"
              disabled={!valid || sending}
              onClick={() => valid && submit()}
            >
              {sending ? (
                <Sending label={t("economy:mentorApply.sendingLabel")} />
              ) : (
                t("economy:mentorApply.sendCta")
              )}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
