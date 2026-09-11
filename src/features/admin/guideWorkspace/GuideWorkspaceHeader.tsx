import { useId, type ReactNode } from "react";
import { FiArrowLeft, FiSave } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminSeg } from "../ui";
import { formatGuideTime } from "./guideFormat";
import {
  GUIDE_LANGUAGES,
  GUIDE_VIEW_MODES,
  type GuideLanguage,
  type GuideViewMode,
} from "./guideWorkspace.data";
import styles from "./GuideWorkspace.module.css";

export type GuideSaveStatus = "idle" | "dirty" | "saving" | "saved";

export interface GuideWorkspaceHeaderProps {
  language: GuideLanguage;
  onLanguageChange: (language: GuideLanguage) => void;
  viewMode: GuideViewMode;
  canSplit: boolean;
  onViewModeChange: (viewMode: GuideViewMode) => void;
  saveStatus: GuideSaveStatus;
  lastSavedAt: string | null;
  issueCount: number;
  onShowIssues: () => void;
  isSaving: boolean;
  onSave: () => void;
  links: ReactNode;
}

/** Sticky workspace header: back, language and view switches, save status,
 *  the issue count after a refused save, and Save (also Cmd/Ctrl+S). */
export function GuideWorkspaceHeader({
  language,
  onLanguageChange,
  viewMode,
  canSplit,
  onViewModeChange,
  saveStatus,
  lastSavedAt,
  issueCount,
  onShowIssues,
  isSaving,
  onSave,
  links,
}: GuideWorkspaceHeaderProps) {
  const { t, language: interfaceLanguage } = useTranslation();
  const languageLabelId = useId();
  const viewLabelId = useId();
  const statusText =
    saveStatus === "saving"
      ? t("admin:guideWorkspace.header.status.saving")
      : saveStatus === "dirty"
        ? t("admin:guideWorkspace.header.status.dirty")
        : saveStatus === "saved" && lastSavedAt
          ? t("admin:guideWorkspace.header.status.saved", {
              time: formatGuideTime(lastSavedAt, interfaceLanguage),
            })
          : "";
  const viewOptions = GUIDE_VIEW_MODES.filter(
    (mode) => canSplit || mode !== "split",
  ).map((mode) => ({
    value: mode,
    label: t(`admin:guideWorkspace.header.view.${mode}`),
  }));
  const languageOptions = GUIDE_LANGUAGES.map((code) => ({
    value: code,
    label: t(`admin:guideWorkspace.header.language.${code}`),
  }));

  return (
    <header className={styles.header}>
      <div className={styles.headerRow}>
        <Button variant="ghost" size="sm" to={routes.adminResourceGuides}>
          <FiArrowLeft aria-hidden />{" "}
          {t("admin:guideWorkspace.backToGuidesCta")}
        </Button>
        <div
          className={styles.headerControl}
          role="group"
          aria-labelledby={languageLabelId}
        >
          <span id={languageLabelId} className={styles.headerControlLabel}>
            {t("admin:guideWorkspace.header.languageLabel")}
          </span>
          <AdminSeg
            options={languageOptions}
            value={language}
            onChange={(value) => onLanguageChange(value as GuideLanguage)}
          />
        </div>
        <div
          className={styles.headerControl}
          role="group"
          aria-labelledby={viewLabelId}
        >
          <span id={viewLabelId} className={styles.headerControlLabel}>
            {t("admin:guideWorkspace.header.viewLabel")}
          </span>
          <AdminSeg
            options={viewOptions}
            value={viewMode}
            onChange={(value) => onViewModeChange(value as GuideViewMode)}
          />
        </div>
        <div className={styles.headerSave}>
          <span className={styles.saveStatus} aria-live="polite">
            {statusText}
          </span>
          {issueCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onShowIssues}>
              {t("admin:guideWorkspace.header.issues", { count: issueCount })}
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            disabled={isSaving}
            aria-keyshortcuts="Meta+S Control+S"
            onClick={onSave}
          >
            <FiSave aria-hidden /> {t("admin:guideWorkspace.header.saveCta")}
          </Button>
        </div>
      </div>
      {links}
    </header>
  );
}
