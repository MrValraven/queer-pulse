import { FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";
import { RichText } from "../../../shared/components/richText/RichText";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GuideBlockKind } from "../api/adminResourceGuides.api";
import { guideBlockMoveButtonId } from "./guideCaret";
import { isFormattedKind, type DraftBlock } from "./guideDraft";
import { guideBlockDomId } from "./guideWorkspace.data";
import type { GuideBlockEditing } from "./useGuideBlockEditing";
import type { GuideStructureEditing } from "./useGuideStructureEditing";
import styles from "./GuideDocument.module.css";

const KIND_CLASS: Record<GuideBlockKind, string | undefined> = {
  paragraph: styles.kindParagraph,
  subheading: styles.kindSubheading,
  listItem: styles.kindListItem,
  note: styles.kindNote,
};

export interface GuideBlockEditorProps {
  block: DraftBlock;
  sectionKey: string;
  blockIndex: number;
  blockCount: number;
  hasIssue: boolean;
  editing: GuideBlockEditing;
  structure: GuideStructureEditing;
  onSlashOpen: (element: HTMLElement) => void;
}

/**
 * One block: a `RichText` surface (formatted, or plain text for a
 * subheading) styled close to the public page, plus a gutter with its kind
 * and move/remove controls that shows on hover and keyboard focus.
 *
 * The `RichText` is uncontrolled and seeds its content once, so it is keyed
 * by `block.key` through the parent list: a kind change or a restored draft
 * arrives with a new key and remounts it.
 */
export function GuideBlockEditor({
  block,
  sectionKey,
  blockIndex,
  blockCount,
  hasIssue,
  editing,
  structure,
  onSlashOpen,
}: GuideBlockEditorProps) {
  const { t } = useTranslation();
  const isFormatted = isFormattedKind(block.kind);
  const kindLabel = t(`admin:adminResourceGuides.blockKind.${block.kind}`);

  return (
    <div
      id={guideBlockDomId(block.key)}
      className={styles.block}
      data-section-key={sectionKey}
      data-block-key={block.key}
      data-invalid={hasIssue ? "true" : undefined}
    >
      <div className={`${styles.textWrap} ${KIND_CLASS[block.kind]}`}>
        <RichText
          html={isFormatted ? block.html : block.text}
          plainText={!isFormatted}
          className={styles.blockText}
          placeholder={t(
            `admin:guideWorkspace.block.placeholder.${block.kind}`,
          )}
          ariaLabel={t("admin:guideWorkspace.block.ariaLabel", {
            kind: kindLabel,
            position: blockIndex + 1,
          })}
          onChange={(value) =>
            editing.handleBlockChange(sectionKey, block, value)
          }
          onKeyDown={(event) =>
            editing.handleBlockKeyDown(sectionKey, block, event)
          }
          onSlash={onSlashOpen}
        />
        {hasIssue && (
          <p className={styles.issueText}>
            {t("admin:guideWorkspace.issue.blockTooLong")}
          </p>
        )}
      </div>
      <div className={styles.gutter}>
        <span className={styles.kindTag} aria-hidden>
          {kindLabel}
        </span>
        <Button
          id={guideBlockMoveButtonId(block.key, "up")}
          variant="icon"
          size="sm"
          aria-label={t("admin:guideWorkspace.block.moveUp")}
          disabled={blockIndex === 0}
          onClick={() => structure.moveBlock(sectionKey, block.key, "up")}
        >
          <FiChevronUp aria-hidden />
        </Button>
        <Button
          id={guideBlockMoveButtonId(block.key, "down")}
          variant="icon"
          size="sm"
          aria-label={t("admin:guideWorkspace.block.moveDown")}
          disabled={blockIndex === blockCount - 1}
          onClick={() => structure.moveBlock(sectionKey, block.key, "down")}
        >
          <FiChevronDown aria-hidden />
        </Button>
        <Button
          variant="icon"
          size="sm"
          aria-label={t("admin:guideWorkspace.block.remove")}
          onClick={() => structure.removeBlock(sectionKey, block.key)}
        >
          <FiTrash2 aria-hidden />
        </Button>
      </div>
    </div>
  );
}
