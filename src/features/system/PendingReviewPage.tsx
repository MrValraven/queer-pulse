import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { InterestsEditorModal } from "./InterestsEditorModal";
import styles from "./PendingReviewPage.module.css";

/** Fixed demo queue data. */
const QUEUE_POSITION = 184;
const QUEUE_TOTAL = 1247;
const ADMITTED_PER_MONTH = 60;
const REQUEST_EMAIL = "tomas@example.com";
const REQUEST_RECEIVED_DATE = new Date(2026, 5, 4);

export function PendingReviewPage() {
  const [editing, setEditing] = useState(false);
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <SystemStateShell orbTone="jade">
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
        </div>

        <div className={styles.kicker}>{t("system:pendingReview.kicker")}</div>
        <h1 className={styles.heading}>
          <Translation
            i18nKey="system:pendingReview.heading"
            values={{ position: QUEUE_POSITION }}
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="system:pendingReview.lead"
            values={{ email: REQUEST_EMAIL }}
            components={{ b: <b /> }}
          />
        </p>

        <div className={styles.posCard}>
          <div className={styles.posRow}>
            <div className={styles.posNum}>
              <em>{QUEUE_POSITION}</em>
            </div>
            <div className={styles.posInfo}>
              <b>{t("system:pendingReview.position.title")}</b>
              <p>
                <Translation
                  i18nKey="system:pendingReview.position.body"
                  values={{
                    total: fmt.number(QUEUE_TOTAL),
                    perMonth: ADMITTED_PER_MONTH,
                    eta: t("system:pendingReview.position.etaValue"),
                  }}
                  components={{ b: <b /> }}
                />
              </p>
            </div>
          </div>
        </div>

        <div className={styles.timeline}>
          <div className={styles.tlStep}>
            <div className={`${styles.dot} ${styles.dotDone}`} />
            <div>
              <b>
                {t("system:pendingReview.timeline.step1.title", {
                  date: fmt.date(REQUEST_RECEIVED_DATE),
                })}
              </b>
              <span>{t("system:pendingReview.timeline.step1.desc")}</span>
            </div>
          </div>
          <div className={styles.tlStep}>
            <div className={`${styles.dot} ${styles.dotActive}`} />
            <div>
              <b>{t("system:pendingReview.timeline.step2.title")}</b>
              <span>{t("system:pendingReview.timeline.step2.desc")}</span>
            </div>
          </div>
          <div className={`${styles.tlStep} ${styles.tlStepPending}`}>
            <div className={`${styles.dot} ${styles.dotPending}`} />
            <div>
              <b>{t("system:pendingReview.timeline.step3.title")}</b>
              <span>{t("system:pendingReview.timeline.step3.desc")}</span>
            </div>
          </div>
          <div className={`${styles.tlStep} ${styles.tlStepPending}`}>
            <div className={`${styles.dot} ${styles.dotPending}`} />
            <div>
              <b>{t("system:pendingReview.timeline.step4.title")}</b>
              <span>{t("system:pendingReview.timeline.step4.desc")}</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button to={routes.magazine}>
            {t("system:pendingReview.actions.magazineCta")}
          </Button>
          <Button variant="ghost" to={routes.vouch}>
            {t("system:pendingReview.actions.vouchCta")}
          </Button>
          <Button variant="ghost" onClick={() => setEditing(true)}>
            {t("system:pendingReview.actions.updateInterestsCta")}
          </Button>
        </div>
        <p className={styles.foot}>
          <Translation
            i18nKey="system:pendingReview.foot.knowMember"
            components={{ a: <Link to={routes.vouch} /> }}
          />
          <br />
          <Translation
            i18nKey="system:pendingReview.foot.withdraw"
            components={{ a: <Link to={routes.contact} /> }}
          />
        </p>
      </div>

      {editing && <InterestsEditorModal onClose={() => setEditing(false)} />}
    </SystemStateShell>
  );
}
