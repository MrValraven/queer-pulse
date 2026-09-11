import { useState } from "react";
import { useLocalStorage, useMediaQuery } from "../../../shared/hooks";
import { mediaMin } from "../../../shared/theme/breakpoints";
import { focusGuideTarget } from "./guideCaret";
import type { GuideValidationIssue } from "./guideValidation";
import {
  GUIDE_SPLIT_MIN_WIDTH,
  GUIDE_VIEW_MODE_STORAGE_KEY,
  guideSectionHeadingId,
  isGuideViewMode,
  type GuideLanguage,
  type GuideViewMode,
} from "./guideWorkspace.data";

/**
 * View mode (remembered per viewer; Split falls back to Edit on narrow
 * screens), the section being worked on, and the jumps that move focus into
 * the document: an outline click, "Edit this section", the issue count.
 */
export function useGuideWorkspaceView({
  language,
  setLanguage,
}: {
  language: GuideLanguage;
  setLanguage: (language: GuideLanguage) => void;
}) {
  const canSplit = useMediaQuery(mediaMin(GUIDE_SPLIT_MIN_WIDTH));
  const [storedViewMode, setViewMode] = useLocalStorage<GuideViewMode>(
    GUIDE_VIEW_MODE_STORAGE_KEY,
    "split",
    isGuideViewMode,
  );
  const [activeSectionKey, setActiveSectionKey] = useState<string | null>(null);
  const viewMode: GuideViewMode =
    !canSplit && storedViewMode === "split" ? "edit" : storedViewMode;

  function revealInEditor(targetId: string, targetLanguage?: GuideLanguage) {
    if (targetLanguage && targetLanguage !== language)
      setLanguage(targetLanguage);
    if (viewMode === "preview") setViewMode("edit");
    // After React has rendered the language or view this may have switched to.
    window.setTimeout(() => focusGuideTarget(targetId, "end"), 0);
  }

  function showIssues(issues: GuideValidationIssue[]) {
    const first =
      issues.find((issue) => !issue.language || issue.language === language) ??
      issues[0];
    if (first) revealInEditor(first.targetId, first.language);
  }

  function jumpToSection(sectionKey: string) {
    setActiveSectionKey(sectionKey);
    revealInEditor(guideSectionHeadingId(sectionKey));
  }

  return {
    canSplit,
    viewMode,
    setViewMode,
    activeSectionKey,
    setActiveSectionKey,
    showIssues,
    jumpToSection,
  };
}
