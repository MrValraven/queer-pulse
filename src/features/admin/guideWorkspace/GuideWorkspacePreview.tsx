import { useEffect, useRef } from "react";
import { FiEdit2 } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { usePrefersReducedMotion } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { GuideBody } from "../../resources/GuideBody";
import { ResourceHero } from "../../resources/ResourceHero";
import type { GuideDraft } from "./guideDraft";
import { previewSections } from "./guideTranslation";
import type { GuideLanguage } from "./guideWorkspace.data";
import styles from "./GuideWorkspace.module.css";

/**
 * The public guide page, rendered from the draft with the same hero and body
 * components readers get and the same language fallback as
 * `ManagedGuideBody`. Follows the section being edited, and each section
 * offers "Edit this section" to jump back into the document.
 */
export function GuideWorkspacePreview({
  draft,
  language,
  activeSectionKey,
  onEditSection,
}: {
  draft: GuideDraft;
  language: GuideLanguage;
  activeSectionKey: string | null;
  onEditSection: (sectionKey: string) => void;
}) {
  const { t } = useTranslation();
  const paneRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPortuguese = language === "pt";
  const { sections, isEnglishFallback } = previewSections(draft, language);
  const draftSections =
    isPortuguese && !isEnglishFallback ? draft.sectionsPt : draft.sections;
  const title =
    (isPortuguese && draft.titlePt) ||
    draft.title ||
    t("admin:guideWorkspace.untitled");
  const description =
    (isPortuguese && draft.descriptionPt) || draft.description;
  const anchors = sections
    .filter((section) => section.heading)
    .map((section) => ({ label: section.heading, href: `#${section.id}` }));
  const activeAnchor =
    draftSections.find((section) => section.key === activeSectionKey)?.id ??
    null;

  // Scrolls the pane only; scrollIntoView would also move the page and pull
  // the editor out of view in Split.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane || !activeAnchor) return;
    const target = Array.from(
      pane.querySelectorAll<HTMLElement>("section[id]"),
    ).find((element) => element.id === activeAnchor);
    if (!target) return;
    pane.scrollTo({
      top: target.offsetTop,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  }, [activeAnchor, prefersReducedMotion]);

  // Hero anchors scroll the pane as well; a native hash jump would move the
  // whole page. A native listener keeps the section free of click props.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    const handleAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!anchor) return;
      event.preventDefault();
      const anchorId = anchor.getAttribute("href")?.slice(1) ?? "";
      const target = Array.from(
        pane.querySelectorAll<HTMLElement>("section[id]"),
      ).find((element) => element.id === anchorId);
      if (!target) return;
      pane.scrollTo({
        top: target.offsetTop,
        behavior: prefersReducedMotion ? "instant" : "smooth",
      });
    };
    pane.addEventListener("click", handleAnchorClick);
    return () => pane.removeEventListener("click", handleAnchorClick);
  }, [prefersReducedMotion]);

  return (
    <section
      ref={paneRef}
      className={styles.preview}
      aria-label={t("admin:guideWorkspace.preview.label")}
      lang={language}
    >
      {isEnglishFallback && (
        <p className={styles.previewNotice}>
          {t("admin:guideWorkspace.preview.englishFallback")}
        </p>
      )}
      <ResourceHero
        eyebrow={t("resources:guide.managedEyebrow")}
        eyebrowDotColor="var(--jade)"
        title={title}
        lead={description}
        anchors={anchors}
      />
      {sections.length === 0 ? (
        <p className={styles.previewEmpty}>
          {t("admin:guideWorkspace.preview.empty")}
        </p>
      ) : (
        <GuideBody
          sections={sections}
          isStatic
          sectionAction={(section) => {
            const draftSection = draftSections.find(
              (candidate) => candidate.id === section.id,
            );
            if (!draftSection) return null;
            return (
              <div className={styles.previewAction}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSection(draftSection.key)}
                >
                  <FiEdit2 aria-hidden />{" "}
                  {t("admin:guideWorkspace.preview.editSection")}
                </Button>
              </div>
            );
          }}
        />
      )}
    </section>
  );
}
