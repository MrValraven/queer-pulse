import type { KeyboardEvent } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { focusGuideTarget } from "./guideCaret";
import type { DraftSection } from "./guideDraft";
import type { GuideValidationIssue } from "./guideValidation";
import {
  guideBlockDomId,
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
}: GuideSectionEditorProps) {
  const { t } = useTranslation();
  const sectionIssues = issues.filter((issue) => !issue.blockKey);
  const hasAnchorIssue = sectionIssues.some(
    (issue) =>
      issue.code === "anchorInvalid" || issue.code === "anchorDuplicate",
  );
  const headingId = guideSectionHeadingId(section.key);
  const errorId = `${headingId}-error`;

  function handleHeadingKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const firstBlock = section.blocks[0];
    if (firstBlock) focusGuideTarget(guideBlockDomId(firstBlock.key), "start");
    else structure.addBlockToSection(section.key);
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
          aria-describedby={sectionIssues.length > 0 ? errorId : undefined}
          onChange={(event) =>
            structure.renameSection(section.key, event.target.value)
          }
          onKeyDown={handleHeadingKeyDown}
        />
        <GuideSectionMenu
          section={section}
          sectionIndex={sectionIndex}
          sectionCount={sectionCount}
          hasAnchorIssue={hasAnchorIssue}
          structure={structure}
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
