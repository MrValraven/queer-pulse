import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import styles from "./AccountSuspendedPage.module.css";

/**
 * Fixed demo case data — names, dates and case IDs stay as data, not copy. Used
 * only in demo mode; a real suspended member sees their actual reason + expiry
 * from `/auth/me` (see `moderated` below), and the mock-only rows (reviewer,
 * case ID, channel, overturned %) are hidden rather than shown as fake data.
 */
const SUSPENSION_DAYS = 7;
const CHANNEL = "#trans-mutual-aid";
const STARTED_AT = "Mon 9 Jun · 14:08 WET";
const LIFTS_AT = "Mon 16 Jun · 14:08";
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
  const daysLeft = liftsAt
    ? Math.max(1, Math.ceil((liftsAt.getTime() - now) / MS_PER_DAY))
    : SUSPENSION_DAYS;
  const liftsLabel = liftsAt
    ? fmt.date(liftsAt, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : LIFTS_AT;
  const days = moderated ? daysLeft : SUSPENSION_DAYS;

  return (
    <SystemStateShell>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className={styles.kicker}>
          {t("system:accountSuspended.kicker")}
        </div>
        <h1 className={styles.heading}>
          <Translation
            i18nKey="system:accountSuspended.heading"
            values={{ days }}
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          {moderated ? (
            t("system:accountSuspended.leadLive")
          ) : (
            <Translation
              i18nKey="system:accountSuspended.lead"
              values={{ channel: CHANNEL }}
              components={{ b: <b />, em: <em /> }}
            />
          )}
        </p>

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
              {t("system:accountSuspended.details.actionValue", { days })}
            </b>
          </div>
          {!moderated && (
            <div className={styles.detailRow}>
              <span>{t("system:accountSuspended.details.started")}</span>
              <b>{STARTED_AT}</b>
            </div>
          )}
          {(!moderated || liftsAt) && (
            <div className={styles.detailRow}>
              <span>
                {t("system:accountSuspended.details.liftsAutomatically")}
              </span>
              <span className={styles.detailNum}>
                <em>{liftsLabel}</em>
              </span>
            </div>
          )}
          {!moderated && (
            <div className={styles.detailRow}>
              <span>{t("system:accountSuspended.details.reviewedBy")}</span>
              <b>
                {t("system:accountSuspended.details.reviewedByValue", {
                  name: REVIEWER_NAME,
                })}
              </b>
            </div>
          )}
          {!moderated && (
            <div className={styles.detailRow}>
              <span>{t("system:accountSuspended.details.caseId")}</span>
              <b>{CASE_ID}</b>
            </div>
          )}
        </div>

        <div className={styles.whatStays}>
          <h4>{t("system:accountSuspended.whatStays.title")}</h4>
          <ul>
            <li>{t("system:accountSuspended.whatStays.item1")}</li>
            <li>{t("system:accountSuspended.whatStays.item2")}</li>
            <li>{t("system:accountSuspended.whatStays.item3")}</li>
            <li>{t("system:accountSuspended.whatStays.item4")}</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Button to={routes.appealSubmit}>
            {t("system:accountSuspended.actions.appealCta")}
          </Button>
          <Button variant="ghost" to={routes.codeOfConduct}>
            {t("system:accountSuspended.actions.ladderCta")}
          </Button>
          {!moderated && (
            <Button variant="ghost" to={routes.messages}>
              {t("system:accountSuspended.actions.messageModCta")}
            </Button>
          )}
        </div>
        {!moderated && (
          <p className={styles.foot}>
            <Translation
              i18nKey="system:accountSuspended.foot"
              values={{ percent: OVERTURNED_PERCENT }}
              components={{ a: <Link to={routes.transparencyReport} /> }}
            />
          </p>
        )}
      </div>
    </SystemStateShell>
  );
}
