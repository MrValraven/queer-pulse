import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  Button,
  StatusCard,
  Stepper,
  type StepperStep,
} from "../../shared/components/ui";
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

  const timelineSteps: StepperStep[] = [
    {
      key: "step1",
      label: t("system:pendingReview.timeline.step1.title", {
        date: fmt.date(REQUEST_RECEIVED_DATE),
      }),
      description: t("system:pendingReview.timeline.step1.desc"),
    },
    {
      key: "step2",
      label: t("system:pendingReview.timeline.step2.title"),
      description: t("system:pendingReview.timeline.step2.desc"),
    },
    {
      key: "step3",
      label: t("system:pendingReview.timeline.step3.title"),
      description: t("system:pendingReview.timeline.step3.desc"),
    },
    {
      key: "step4",
      label: t("system:pendingReview.timeline.step4.title"),
      description: t("system:pendingReview.timeline.step4.desc"),
    },
  ];

  return (
    <SystemStateShell orbTone="jade">
      <StatusCard
        tone="jade"
        icon={
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
        }
        kicker={t("system:pendingReview.kicker")}
        heading={
          <Translation
            i18nKey="system:pendingReview.heading"
            values={{ position: QUEUE_POSITION }}
            components={{ em: <em /> }}
          />
        }
        lead={
          <Translation
            i18nKey="system:pendingReview.lead"
            values={{ email: REQUEST_EMAIL }}
            components={{ b: <b /> }}
          />
        }
        actions={
          <>
            <Button to={routes.magazine}>
              {t("system:pendingReview.actions.magazineCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
            <Button variant="ghost" to={routes.vouch}>
              {t("system:pendingReview.actions.vouchCta")}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(true)}>
              {t("system:pendingReview.actions.updateInterestsCta")}
            </Button>
          </>
        }
        foot={
          <>
            <Translation
              i18nKey="system:pendingReview.foot.knowMember"
              components={{ a: <Link to={routes.vouch} /> }}
            />
            <br />
            <Translation
              i18nKey="system:pendingReview.foot.withdraw"
              components={{ a: <Link to={routes.contact} /> }}
            />
          </>
        }
      >
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
          <Stepper
            steps={timelineSteps}
            current={1}
            orientation="vertical"
            ariaLabel={t("system:pendingReview.kicker")}
          />
        </div>
      </StatusCard>

      {editing && <InterestsEditorModal onClose={() => setEditing(false)} />}
    </SystemStateShell>
  );
}
