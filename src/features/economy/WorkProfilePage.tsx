import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useWorkProfile } from "../../app/providers/WorkProfileProvider";
import {
  IdentitySection,
  ShowUpAtWorkSection,
  SkillsFocusSection,
} from "./WorkProfileSections";
import styles from "./WorkProfilePage.module.css";

/** The Work Profile — identity & safety controls at the heart of the workspace. */
export function WorkProfilePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    outAtWork,
    setOutAtWork,
    transSupport,
    toggleTransSupport,
    safeOnly,
    setSafeOnly,
    loading,
    saving,
    save: persist,
  } = useWorkProfile();
  const [saved, setSaved] = useState(false);

  // These are outness-disclosure settings: the success panel may only appear
  // once the write is confirmed. A failed save rolls the editor back to what the
  // server still holds (see WorkProfileProvider) and says so plainly, so nobody
  // walks away believing they're set to "private" when nothing was written.
  async function save() {
    const ok = await persist();
    if (!ok) {
      showToast(t("economy:workProfile.saveFailedToast"), "error", 7000);
      return;
    }
    setSaved(true);
    showToast(t("economy:workProfile.savedToast"), "success");
  }

  if (saved) {
    return (
      <PageShell>
        <div className={styles.successWrap}>
          <div className={styles.success}>
            <div className={styles.successIcon} aria-hidden>
              <FiCheck />
            </div>
            <h1 className={styles.successTitle}>
              <Translation
                i18nKey="economy:workProfile.success.title"
                components={{ em: <em /> }}
              />
            </h1>
            <p className={styles.successSub}>
              {t("economy:workProfile.success.sub")}
            </p>
            <div className={styles.successActions}>
              <Button variant="ghost-dark" to={routes.work}>
                {t("economy:workProfile.success.backCta")}
              </Button>
              <Button variant="ghost-dark" onClick={() => setSaved(false)}>
                {t("economy:workProfile.success.editCta")}
              </Button>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>
            {t("economy:workProfile.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="economy:workProfile.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("economy:workProfile.sub")}</p>
        </header>

        <IdentitySection />
        {/* Never paint the defaults over someone's stored disclosure settings:
            until the read resolves we don't know whether they're "private". */}
        {loading ? (
          <div className={styles.loadingSection}>
            <SkeletonLine height={18} width="40%" />
            <SkeletonLine height={64} style={{ marginTop: 16 }} />
            <SkeletonLine height={64} style={{ marginTop: 12 }} />
          </div>
        ) : (
          <ShowUpAtWorkSection
            outChoice={outAtWork}
            onOut={setOutAtWork}
            trans={transSupport}
            onToggleTrans={toggleTransSupport}
            safeOnly={safeOnly}
            onSafeOnly={setSafeOnly}
          />
        )}
        <SkillsFocusSection />

        <div className={styles.saveBar}>
          <Button
            variant="primary"
            size="lg"
            disabled={saving || loading}
            onClick={() => void save()}
          >
            {saving
              ? t("economy:workProfile.savingLabel")
              : t("economy:workProfile.saveCta")}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
