import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  RoadmapGuideDTO,
  RoadmapGuideStep,
  RoadmapItemUpdateBody,
} from "../../api/roadmapAdmin.types";
import { Button, DatePicker } from "../../../../shared/components/ui";
import { AdminCheckLine } from "../../ui";
import { daysUntil } from "./itemDrawer.data";
import styles from "./ItemDrawer.module.css";

const GUIDE_STEPS: RoadmapGuideStep[] = [
  "research",
  "draft",
  "lived",
  "expert",
  "translate",
  "publish",
];

const RE_VERIFY_WARNING_WINDOW_DAYS = 30;

/**
 * Shown instead of `ProgressSection` when `item.guide` is set — the
 * 6-step review checklist health/legal resource guides need (reviewer,
 * credential, re-verify date, translations) rather than a plain percent.
 * "This is not a guide" clears `guide` back to `null`, which flips the
 * drawer back to the plain progress slider.
 */
export function GuideSection({
  guide,
  onFieldChange,
}: {
  guide: RoadmapGuideDTO;
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
}) {
  const { t } = useTranslation();

  function setGuide(patch: Partial<RoadmapGuideDTO>) {
    onFieldChange({ guide: { ...guide, ...patch } });
  }

  const overdueDays = guide.reVerifyBy ? daysUntil(guide.reVerifyBy) : null;
  // Negative `overdueDays` means the re-verify date already passed — the
  // catalog's `reVerifyWarning` key ("Re-verify due in {days} days") only
  // reads honestly for the not-yet-due case, so an already-overdue guide
  // gets its own message instead of a clamped, false "due in 0 days".
  let reVerifyBanner: string | null = null;
  if (overdueDays !== null && overdueDays <= RE_VERIFY_WARNING_WINDOW_DAYS) {
    if (overdueDays < 0) {
      const days = Math.abs(overdueDays);
      reVerifyBanner = t("admin:roadmap.drawer.guide.reVerifyOverdue", {
        count: days,
      });
    } else {
      reVerifyBanner = t("admin:roadmap.drawer.guide.reVerifyWarning", {
        days: overdueDays,
      });
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>
          {t("admin:roadmap.drawer.guide.title")}
        </h3>
        <p className={styles.sectionNote}>
          {t("admin:roadmap.drawer.guide.note")}
        </p>
      </div>

      <div className={styles.checklist}>
        {GUIDE_STEPS.map((step) => (
          <AdminCheckLine
            key={step}
            checked={guide.steps[step]}
            onChange={(checked) =>
              setGuide({ steps: { ...guide.steps, [step]: checked } })
            }
            title={t(`admin:roadmap.drawer.guide.step.${step}`)}
          />
        ))}
      </div>

      {reVerifyBanner && <p className={styles.warningBanner}>{reVerifyBanner}</p>}

      <label className={styles.fieldLabel} htmlFor="guide-reviewer">
        {t("admin:roadmap.drawer.guide.reviewerLabel")}
      </label>
      <input
        id="guide-reviewer"
        className={styles.textInput}
        value={guide.reviewer}
        placeholder={t("admin:roadmap.drawer.guide.reviewerPlaceholder")}
        onChange={(event) => setGuide({ reviewer: event.target.value })}
      />

      <label className={styles.fieldLabel} htmlFor="guide-credential">
        {t("admin:roadmap.drawer.guide.credentialLabel")}
      </label>
      <input
        id="guide-credential"
        className={styles.textInput}
        value={guide.credential}
        placeholder={t("admin:roadmap.drawer.guide.credentialPlaceholder")}
        onChange={(event) => setGuide({ credential: event.target.value })}
      />

      <label id="guide-reverify-label" className={styles.fieldLabel}>
        {t("admin:roadmap.drawer.guide.reVerifyByLabel")}
      </label>
      <DatePicker
        mode="date"
        id="guide-reverify"
        labelledBy="guide-reverify-label"
        value={guide.reVerifyBy}
        onChange={(value) => setGuide({ reVerifyBy: value })}
      />

      <p className={styles.fieldLabel}>
        {t("admin:roadmap.drawer.guide.languagesLabel")}
      </p>
      <div className={styles.langRow}>
        {(["en", "pt", "br"] as const).map((languageCode) => (
          <label key={languageCode} className={styles.langChip}>
            <input
              type="checkbox"
              checked={guide.languages[languageCode]}
              onChange={(event) =>
                setGuide({
                  languages: {
                    ...guide.languages,
                    [languageCode]: event.target.checked,
                  },
                })
              }
            />
            {languageCode.toUpperCase()}
          </label>
        ))}
      </div>

      <Button variant="ghost" size="md" onClick={() => onFieldChange({ guide: null })}>
        {t("admin:roadmap.drawer.guide.notAGuideCta")}
      </Button>
    </div>
  );
}
