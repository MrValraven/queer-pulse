import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from "./ModalKit";
import {
  type Application,
  submittedDraftPatch,
} from "./applicationStatus.data";
import styles from "./ApplicationModals.module.css";

/** Finish and submit a draft application — moves the card to Active. */
export function ResumeModal({
  app,
  onClose,
  onPatch,
}: {
  app: Application;
  onClose: () => void;
  onPatch: (id: string, patch: Partial<Application>) => void;
}) {
  const { t } = useTranslation();
  const d = app.draft;
  const { submit, sending, done } = useSubmitFlow();

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel
          title={t("economy:resume.success.title")}
          em={t("economy:resume.success.em")}
          onClose={onClose}
        >
          {t("economy:resume.success.body", { company: app.companyName })}
        </SuccessPanel>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(() => onPatch(app.id, submittedDraftPatch()));
          }}
        >
          <div className={styles.eyebrow}>
            {t("economy:resume.eyebrowPrefix", { deadline: d?.deadline })}
          </div>
          <h2 className={styles.title}>
            <Translation
              i18nKey="economy:resume.title"
              components={{ em: <em /> }}
            />
          </h2>
          <div className={styles.progress}>
            <div
              className={styles.progressFill}
              style={{ transform: `scaleX(${(d?.percent ?? 0) / 100})` }}
            />
          </div>
          <p className={styles.progressL}>
            {t("economy:resume.progress", {
              percent: d?.percent ?? 0,
              count: d?.remaining.length ?? 0,
            })}
          </p>
          <div className={styles.field}>
            <label htmlFor="rs-cover">
              {t("economy:resume.coverLetterLabel")}
            </label>
            <textarea
              id="rs-cover"
              placeholder={t("economy:resume.coverLetterPlaceholder")}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="rs-avail">
              {t("economy:resume.availabilityLabel")}
            </label>
            <input
              id="rs-avail"
              type="text"
              placeholder={t("economy:resume.availabilityPlaceholder")}
              required
            />
          </div>
          <div className={styles.foot}>
            <button
              type="button"
              className={styles.back}
              onClick={onClose}
              disabled={sending}
            >
              {t("economy:resume.saveClose")}
            </button>
            <Button size="lg" type="submit" disabled={sending}>
              {sending ? (
                <Sending label={t("economy:resume.submittingLabel")} />
              ) : (
                t("economy:resume.submitCta")
              )}
            </Button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
