import { Link } from "react-router-dom";
import { FiSlash } from "react-icons/fi";
import {
  Button,
  StatusCard,
  Stepper,
  type StepperStep,
} from "../../shared/components/ui";
import { SystemStateShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  ACCOUNT_ERASURE_GRACE_DAYS,
  APPEAL_DECISION_WINDOW_DAYS,
  APPEAL_FILING_WINDOW_DAYS,
} from "./accountWindows";
import styles from "./AccountBannedPage.module.css";

export function AccountBannedPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();

  // A permanent ban is status "suspended" with no `suspendedUntil`. When a real
  // banned member views this, show their actual reason from `/auth/me`.
  const banned = !demoMode && user?.status === "suspended";
  const reasonNote = banned ? user?.suspension?.note?.trim() || null : null;

  const whatNowSteps: StepperStep[] = [
    {
      key: "row1",
      label: t("system:accountBanned.whatNow.row1.title"),
      description: t("system:accountBanned.whatNow.row1.body", {
        filingDays: APPEAL_FILING_WINDOW_DAYS,
        decisionDays: APPEAL_DECISION_WINDOW_DAYS,
      }),
    },
    {
      key: "row2",
      label: t("system:accountBanned.whatNow.row2.title"),
      description: (
        <Translation
          i18nKey="system:accountBanned.whatNow.row2.body"
          values={{ erasureDays: ACCOUNT_ERASURE_GRACE_DAYS }}
          components={{ a: <Link to={routes.privacy} /> }}
        />
      ),
    },
    {
      key: "row3",
      label: t("system:accountBanned.whatNow.row3.title"),
      description: t("system:accountBanned.whatNow.row3.body"),
    },
    {
      key: "row4",
      label: t("system:accountBanned.whatNow.row4.title"),
      description: (
        <Translation
          i18nKey="system:accountBanned.whatNow.row4.body"
          components={{ wellbeingLink: <Link to={routes.wellbeing} /> }}
        />
      ),
    },
  ];

  return (
    <SystemStateShell orbTone="plum" mutedBrand>
      <StatusCard
        tone="plum"
        icon={<FiSlash aria-hidden />}
        kicker={t("system:accountBanned.kicker")}
        heading={
          <Translation
            i18nKey="system:accountBanned.heading"
            components={{ em: <em /> }}
          />
        }
        lead={
          <Translation
            i18nKey="system:accountBanned.lead1"
            components={{ em: <em /> }}
          />
        }
        actions={
          <>
            <Button to={routes.appealSubmit}>
              {t("system:accountBanned.actions.appealCta")}
            </Button>
            <Button variant="ghost" to={routes.dataExport}>
              {t("system:accountBanned.actions.eraseCta")}
            </Button>
          </>
        }
        foot={
          <Translation
            i18nKey="system:accountBanned.foot"
            components={{ a: <Link to={routes.codeOfConduct} /> }}
          />
        }
      >
        <div className={styles.violation}>
          <h4>{t("system:accountBanned.violation.title")}</h4>
          {/* The §02·06 case file is a demo fixture. Rendering it as the live
              fallback meant a member whose record carries no moderator note
              read an invented case against themselves, complete with an
              incident count and a second reviewer. Live mode with no note on
              record says exactly that instead. */}
          <p>
            {reasonNote ? (
              reasonNote
            ) : demoMode ? (
              <Translation
                i18nKey="system:accountBanned.violation.body"
                components={{ b: <b /> }}
              />
            ) : (
              t("system:accountBanned.violation.bodyLive")
            )}
          </p>
        </div>

        <div className={styles.whatNow}>
          <Stepper
            steps={whatNowSteps}
            current={0}
            orientation="vertical"
            marker="number"
            showFill={false}
            ariaLabel={t("system:accountBanned.kicker")}
          />
        </div>
      </StatusCard>
    </SystemStateShell>
  );
}
