import { Link } from "react-router-dom";
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
import styles from "./AccountBannedPage.module.css";

export function AccountBannedPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();

  // A permanent ban is status "suspended" with no `suspendedUntil`. When a real
  // banned member views this, show their actual reason from `/auth/me` instead
  // of the demo case-file copy; fall back to the generic copy if none is on
  // record.
  const banned = !demoMode && user?.status === "suspended";
  const reasonNote = banned ? user?.suspension?.note?.trim() || null : null;

  const whatNowSteps: StepperStep[] = [
    {
      key: "row1",
      label: t("system:accountBanned.whatNow.row1.title"),
      description: t("system:accountBanned.whatNow.row1.body"),
    },
    {
      key: "row2",
      label: t("system:accountBanned.whatNow.row2.title"),
      description: (
        <Translation
          i18nKey="system:accountBanned.whatNow.row2.body"
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
        icon={
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        }
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
        <p className={styles.lead}>
          <Translation
            i18nKey="system:accountBanned.lead2"
            components={{ b: <b /> }}
          />
        </p>

        <div className={styles.violation}>
          <h4>{t("system:accountBanned.violation.title")}</h4>
          <p>
            {reasonNote ? (
              reasonNote
            ) : (
              <Translation
                i18nKey="system:accountBanned.violation.body"
                components={{ b: <b /> }}
              />
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
