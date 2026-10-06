import { useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";
import { FiAlertTriangle, FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { focusGuideTarget } from "./guideCaret";
import type { DraftSection } from "./guideDraft";
import type { GuideValidationIssue } from "./guideValidation";
import {
  guideBlockDomId,
  guideSectionAnchorId,
  guideSectionDomId,
  guideSectionHeadingId,
} from "./guideWorkspace.data";
import { GuideBlockEditor } from "./GuideBlockEditor";
import { GuideSectionMenu } from "./GuideSectionMenu";
import { GuideTranslationReference } from "./GuideTranslationReference";
import type { GuideBlockEditing } from "./useGuideBlockEditing";
import type { GuideStructureEditing } from "./useGuideStructureEditing";
import styles from "./GuideDocument.module.css";

export interface GuideSectionEditorProps {
  section: DraftSection;
  sectionIndex: number;
  sectionCount: number;
  /** The EN section with this anchor while editing PT (null: none); undefined in EN. */
  englishMatch: DraftSection | null | undefined;
  /** Issues whose `sectionKey` is this section. */
  issues: GuideValidationIssue[];
  editing: GuideBlockEditing;
  structure: GuideStructureEditing;
  onFocusSection: () => void;
  onSlashOpen: (blockKey: string, element: HTMLElement) => void;
  /** The anchors a section-composed guide's page reads (sexual health), or
   *  null for a guide whose sections take the whole page over. */
  pageAnchors: readonly string[] | null;
}

export function GuideSectionEditor({
  section,
  sectionIndex,
  sectionCount,
  englishMatch,
  issues,
  editing,
  structure,
  onFocusSection,
  onSlashOpen,
  pageAnchors,
}: GuideSectionEditorProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeadingFocused, setIsHeadingFocused] = useState(false);
  const sectionIssues = issues.filter((issue) => !issue.blockKey);
  const hasAnchorIssue = sectionIssues.some(
    (issue) =>
      issue.code === "anchorInvalid" || issue.code === "anchorDuplicate",
  );
  const headingId = guideSectionHeadingId(section.key);
  const errorId = `${headingId}-error`;
  // A section-composed page renders only the sections at its own anchors, so
  // one anchored anywhere else is saved but reaches no reader. A new section's
  // anchor follows its heading keystroke by keystroke, so the warning waits
  // until the heading loses focus.
  const isAnchorFollowingTypedHeading =
    !section.isAnchorLocked && isHeadingFocused;
  const unreadAnchorList =
    pageAnchors &&
    !pageAnchors.includes(section.id) &&
    !isAnchorFollowingTypedHeading
      ? pageAnchors.join(", ")
      : null;
  const unreadAnchorId = `${headingId}-unread-anchor`;
  const describedBy =
    [
      sectionIssues.length > 0 ? errorId : null,
      unreadAnchorList ? unreadAnchorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  function handleHeadingKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const firstBlock = section.blocks[0];
    if (firstBlock) focusGuideTarget(guideBlockDomId(firstBlock.key), "start");
    else structure.addBlockToSection(section.key);
  }

  function handleChangeAnchor() {
    // The anchor field only exists once the menu panel renders.
    flushSync(() => setIsMenuOpen(true));
    focusGuideTarget(guideSectionAnchorId(section.key));
  }

  return (
    <section
      id={guideSectionDomId(section.key)}
      className={styles.section}
      onFocus={onFocusSection}
    >
      <div className={styles.sectionHead}>
        <input
          id={headingId}
          className={styles.sectionHeading}
          value={section.heading}
          placeholder={t("admin:guideWorkspace.document.headingPlaceholder")}
          aria-label={t("admin:guideWorkspace.document.headingLabel", {
            position: sectionIndex + 1,
          })}
          aria-invalid={sectionIssues.length > 0 || undefined}
          aria-describedby={describedBy}
          onChange={(event) =>
            structure.renameSection(section.key, event.target.value)
          }
          onKeyDown={handleHeadingKeyDown}
          onFocus={() => setIsHeadingFocused(true)}
          onBlur={() => setIsHeadingFocused(false)}
        />
        <GuideSectionMenu
          section={section}
          sectionIndex={sectionIndex}
          sectionCount={sectionCount}
          hasAnchorIssue={hasAnchorIssue}
          structure={structure}
          isOpen={isMenuOpen}
          onToggle={() => setIsMenuOpen((current) => !current)}
        />
      </div>

      {sectionIssues.length > 0 && (
        <div id={errorId} className={styles.issues}>
          {sectionIssues.map((issue, issueIndex) => (
            <p key={`${issue.code}-${issueIndex}`} className={styles.issueText}>
              {t(`admin:guideWorkspace.issue.${issue.code}`)}
            </p>
          ))}
        </div>
      )}

      {unreadAnchorList && (
        <div className={styles.anchorWarning}>
          <p id={unreadAnchorId} className={styles.anchorWarningText}>
            <FiAlertTriangle className={styles.anchorWarningIcon} aria-hidden />
            <span>
              {t("admin:guideWorkspace.section.unreadAnchor", {
                anchor: section.id,
                anchors: unreadAnchorList,
              })}
            </span>
          </p>
          <Button variant="ghost" size="sm" onClick={handleChangeAnchor}>
            {t("admin:guideWorkspace.section.changeAnchor")}
          </Button>
        </div>
      )}

      <div
        className={
          englishMatch !== undefined ? styles.translationRow : undefined
        }
      >
        {englishMatch !== undefined && (
          <GuideTranslationReference section={englishMatch} />
        )}
        <div className={styles.blocks}>
          {section.blocks.map((block, blockIndex) => (
            <GuideBlockEditor
              key={block.key}
              block={block}
              sectionKey={section.key}
              blockIndex={blockIndex}
              blockCount={section.blocks.length}
              hasIssue={issues.some((issue) => issue.blockKey === block.key)}
              editing={editing}
              structure={structure}
              onSlashOpen={(element) => onSlashOpen(block.key, element)}
            />
          ))}
          {section.blocks.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => structure.addBlockToSection(section.key)}
            >
              <FiPlus aria-hidden />{" "}
              {t("admin:guideWorkspace.document.addBlockCta")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
