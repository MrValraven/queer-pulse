import { useState } from "react";
import { Navigate } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useHasStaffRole } from "../auth/api/useMyStaffRoles";
import { MagazineMasthead } from "./MagazineMasthead";
import { WriterApplicationForm } from "./WriterApplicationForm";
import { WriterApplicationStatus } from "./WriterApplicationStatus";
import { useMyWriterApplication } from "./api/useMyWriterApplication";
import styles from "./SubmitStoryPage.module.css";

export function ApplyToWritePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const isWriter = useHasStaffRole("magazine_writer");
  const { application, isLoading } = useMyWriterApplication();
  const [reapplying, setReapplying] = useState(false);

  // Demo mode's `useHasStaffRole` grants every staff role (it's the "show
  // the whole app unlocked" override), so `isWriter` is always true there —
  // if this redirect fired in demo mode too, the apply flow would be
  // permanently invisible in the showcase. Only redirect in LIVE mode, where
  // `isWriter` reflects the signed-in member's real roles; demo mode instead
  // renders based on `useMyWriterApplication`'s own fixture (`null` by
  // default — see `applyToWrite.data.ts`), same as every other demo-mode
  // page in this codebase.
  if (!demoMode && isWriter) {
    return <Navigate to={routes.submitStory} replace />;
  }
  if (isLoading) {
    return null;
  }

  const showForm =
    !application || (application.status === "declined" && reapplying);

  return (
    <PageShell>
      <MagazineMasthead active="write" />
      <section className={styles.page}>
        <div className="wrap">
          {!showForm && application ? (
            <WriterApplicationStatus
              application={application}
              onReapply={() => setReapplying(true)}
            />
          ) : (
            <>
              <div className={styles.hero}>
                <h1>
                  <Translation
                    i18nKey="magazine:applyToWrite.intro.title"
                    components={{ em: <em /> }}
                  />
                </h1>
                <p>{t("magazine:applyToWrite.intro.lead")}</p>
              </div>
              <div className={styles.editorGrid}>
                <WriterApplicationForm
                  onSubmitted={() => setReapplying(false)}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
