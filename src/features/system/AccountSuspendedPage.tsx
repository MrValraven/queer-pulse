import { useState } from "react";
import { FiAlertCircle, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button, StatusCard } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { APPEAL_DECISION_WINDOW_DAYS } from "./accountWindows";
import styles from "./AccountSuspendedPage.module.css";

/**
 * Fixed demo case data: names, dates, case IDs and the overturn rate stay as
 * data rather than copy.
 *
 * Every one of these is gated on `demoMode`, never on "is this viewer actually
 * suspended". The old gate was `!moderated`, which is also false for anyone
 * viewing `/system/account-suspended` on the LIVE build without being
 * suspended: a signed-in member, a moderator checking the screen, anyone
 * following the link. They were shown a §02·02 misgendering case in
 * #trans-mutual-aid, reviewed by "Sofia C. + one anonymous mod", under case
 * QP-MOD-2026-1184, with an invented appeal overturn rate underneath. None of
 * it exists.
 */
const SUSPENSION_DAYS = 7;
const CHANNEL = "#trans-mutual-aid";
const STARTED_AT = "Tue 9 Jun · 14:08 WET";
const LIFTS_AT = "Tue 16 Jun · 14:08";
const REVIEWER_NAME = "Sofia C.";
const CASE_ID = "QP-MOD-2026-1184";
const OVERTURNED_PERCENT = 11;

const MS_PER_DAY = 86_400_000;

export function AccountSuspendedPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();

  // A real, locked-out suspended member (never in demo mode, where the mock user
  // is always active). Their reason + expiry come from `/auth/me`.
  const moderated = !demoMode && user?.status === "suspended";
  const liftsAt = user?.suspendedUntil ? new Date(user.suspendedUntil) : null;
  const reasonNote = user?.suspension?.note?.trim() || null;

  // Capture the clock once at mount (lazy state initializer) so the render body
  // stays pure — reading `Date.now()` during render is a rules-of-React violation.
  const [now] = useState(() => Date.now());
  // `null` when nothing on record says how long this lasts. Live mode with no
  // `suspendedUntil` prints no number at all rather than the demo's 7.
  const days = liftsAt
    ? Math.max(1, Math.ceil((liftsAt.getTime() - now) / MS_PER_DAY))
    : demoMode
      ? SUSPENSION_DAYS
      : null;
  const liftsLabel = liftsAt
    ? fmt.date(liftsAt, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : LIFTS_AT;

  return (
    <SystemStateShell>
      <StatusCard
        icon={<FiAlertCircle aria-hidden />}
        kicker={t("system:accountSuspended.kicker")}
        heading={
          days === null ? (
            <Translation
              i18nKey="system:accountSuspended.headingLive"
              components={{ em: <em /> }}
            />
          ) : (
            <Translation
              i18nKey="system:accountSuspended.heading"
              values={{ days }}
              components={{ em: <em /> }}
            />
          )
        }
        lead={
          demoMode ? (
            <Translation
              i18nKey="system:accountSuspended.lead"
              values={{ channel: CHANNEL }}
              components={{ b: <b />, em: <em /> }}
            />
          ) : (
            t("system:accountSuspended.leadLive")
          )
        }
        actions={
          <>
            <Button to={routes.appealSubmit}>
              {t("system:accountSuspended.actions.appealCta")}
            </Button>
            <Button variant="ghost" to={routes.codeOfConduct}>
              {t("system:accountSuspended.actions.ladderCta")}
            </Button>
            {demoMode && (
              <Button variant="ghost" to={routes.messages}>
                {t("system:accountSuspended.actions.messageModCta")}
              </Button>
            )}
          </>
        }
        foot={
          demoMode ? (
            <Translation
              i18nKey="system:accountSuspended.foot"
              values={{ percent: OVERTURNED_PERCENT }}
              components={{ a: <Link to={routes.governance} /> }}
            />
          ) : (
            // The overturn rate the demo quotes is invented, and the "2025
            // moderation stats" it links to do not exist. The Transparency
            // Report does, is public, and counts the overturn rate from the
            // moderation tables at request time.
            <Translation
              i18nKey="system:accountSuspended.footLive"
              components={{ a: <Link to={routes.transparencyReport} /> }}
            />
          )
        }
      >
        {moderated && reasonNote && (
          <div className={styles.whatStays}>
            <h4>{t("system:accountSuspended.reason.title")}</h4>
            <p>{reasonNote}</p>
          </div>
        )}

        <div className={styles.detailList}>
          <div className={styles.detailRow}>
            <span>{t("system:accountSuspended.details.action")}</span>
            <b>
              {days === null
                ? t("system:accountSuspended.details.actionValueLive")
                : t("system:accountSuspended.details.actionValue", { days })}
            </b>
          </div>
          {demoMode && (
            <div className={styles.detailRow}>
              <span>{t("system:accountSuspended.details.started")}</span>
              <b>{STARTED_AT}</b>
            </div>
          )}
          {(demoMode || liftsAt) && (
            <div className={styles.detailRow}>
              <span>
                {t("system:accountSuspended.details.liftsAutomatically")}
              </span>
              <span className={styles.detailNum}>
                <em>{liftsLabel}</em>
              </span>
            </div>
          )}
          {demoMode && (
            <div className={styles.detailRow}>
              <span>{t("system:accountSuspended.details.reviewedBy")}</span>
              <b>
                {t("system:accountSuspended.details.reviewedByValue", {
                  name: REVIEWER_NAME,
                })}
              </b>
            </div>
          )}
          {demoMode && (
            <div className={styles.detailRow}>
              <span>{t("system:accountSuspended.details.caseId")}</span>
              <b>{CASE_ID}</b>
            </div>
          )}
        </div>

        <div className={styles.whatStays}>
          <h4>{t("system:accountSuspended.whatStays.title")}</h4>
          <ul>
            <li>
              <FiCheck className={styles.stayMark} aria-hidden />
              {t("system:accountSuspended.whatStays.item1")}
            </li>
            <li>
              <FiCheck className={styles.stayMark} aria-hidden />
              {t("system:accountSuspended.whatStays.item2")}
            </li>
            <li>
              <FiCheck className={styles.stayMark} aria-hidden />
              {t("system:accountSuspended.whatStays.item3")}
            </li>
            <li>
              <FiCheck className={styles.stayMark} aria-hidden />
              {t("system:accountSuspended.whatStays.item4", {
                decisionDays: APPEAL_DECISION_WINDOW_DAYS,
              })}
            </li>
          </ul>
        </div>
      </StatusCard>
    </SystemStateShell>
  );
}
