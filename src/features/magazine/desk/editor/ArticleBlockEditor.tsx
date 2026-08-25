import {
  FiChevronDown,
  FiChevronUp,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import { IconButton } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleBlock } from "../../api/pieces.api";
import { RichText } from "./RichText";
import {
  ImageBlockFields,
  QaBlockFields,
  QuoteBlockFields,
  StatsBlockFields,
} from "./ArticleBlockKindFields";
import styles from "./ArticleBlockEditor.module.css";

export interface ArticleBlockEditorProps {
  block: ArticleBlock;
  /** This block's position in the parent list — drives the disabled state
   * of the move-up/move-down tools (0 disables "up", `total - 1` disables
   * "down") and is threaded through to `onSlash` so the caller knows which
   * block to insert the new one after. */
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
  /** Always the FULL next block — callers must spread the previous block
   * (`{ ...block, ...patch }`), never mutate it. Every field handler below
   * follows that rule. */
  onChange: (next: ArticleBlock) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
  /** Fired when "/" is typed in an empty RichText belonging to this block,
   * so the caller can open the slash menu positioned at `element` and know
   * (via `index`) which block to insert the new one after. */
  onSlash: (element: HTMLElement, index: number) => void;
}

/**
 * One editable article block, dispatching on `block.kind` to the right
 * editing surface (ported from the design prototype's `Block`). Always
 * renders the block chrome — move up/down, remove, a drag-handle affordance,
 * and the block-type tag — around the per-kind content. See
 * `ArticleBlockKindFields.tsx` for the heavier kinds (quote/qa/stats/image)
 * and `ImageBlockControls.tsx` for the image-specific fields.
 */
export function ArticleBlockEditor({
  block,
  index,
  total,
  selected,
  onSelect,
  onChange,
  onMove,
  onRemove,
  onSlash,
}: ArticleBlockEditorProps) {
  const { t } = useTranslation();
  const blockClassName = selected ? `${styles.blk} ${styles.sel}` : styles.blk;

  return (
    <div className={blockClassName}>
      <div className={styles.blkTools}>
        <span className={styles.grip} aria-hidden="true">
          <FiMoreVertical />
        </span>
        <IconButton
          size="sm"
          onClick={() => onMove("up")}
          disabled={index === 0}
          aria-label={t("magazine:write.block.moveUpAria")}
        >
          <FiChevronUp aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          onClick={() => onMove("down")}
          disabled={index === total - 1}
          aria-label={t("magazine:write.block.moveDownAria")}
        >
          <FiChevronDown aria-hidden />
        </IconButton>
        <IconButton
          size="sm"
          onClick={onRemove}
          aria-label={t("magazine:write.block.removeAria")}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      </div>

      <div className={styles.blkIn}>
        <BlockContent
          block={block}
          index={index}
          onSelect={onSelect}
          onChange={onChange}
          onSlash={onSlash}
        />
      </div>

      <span className={styles.blkType}>
        {t(`magazine:write.blockKind.${block.kind}.label`)}
      </span>
    </div>
  );
}

interface BlockContentProps {
  block: ArticleBlock;
  index: number;
  onSelect: () => void;
  onChange: (next: ArticleBlock) => void;
  onSlash: (element: HTMLElement, index: number) => void;
}

/** Dispatches to the right editing surface for `block.kind`, preserving the
 * discriminant on every patch by spreading `block`. */
function BlockContent({
  block,
  index,
  onSelect,
  onChange,
  onSlash,
}: BlockContentProps) {
  const { t } = useTranslation();
  switch (block.kind) {
    case "paragraph": {
      const className = block.lead
        ? `${styles.paragraph} ${styles.lead}`
        : styles.paragraph;
      return (
        <RichText
          html={block.html}
          placeholder={t("magazine:write.block.paragraphPlaceholder")}
          className={className}
          onChange={(html) => onChange({ ...block, html })}
          onSlash={(element) => onSlash(element, index)}
          onFocus={onSelect}
        />
      );
    }
    case "heading":
      return (
        <RichText
          html={block.html}
          placeholder={t("magazine:write.block.headingPlaceholder")}
          className={styles.heading}
          onChange={(html) => onChange({ ...block, html })}
          onSlash={(element) => onSlash(element, index)}
          onFocus={onSelect}
        />
      );
    case "pullQuote":
      return (
        <RichText
          html={block.html}
          placeholder={t("magazine:write.block.pullQuotePlaceholder")}
          className={styles.pullQuote}
          onChange={(html) => onChange({ ...block, html })}
          onSlash={(element) => onSlash(element, index)}
          onFocus={onSelect}
        />
      );
    case "quote":
      return (
        <QuoteBlockFields
          block={block}
          index={index}
          onSelect={onSelect}
          onChange={onChange}
          onSlash={onSlash}
        />
      );
    case "qa":
      return (
        <QaBlockFields
          block={block}
          index={index}
          onSelect={onSelect}
          onChange={onChange}
          onSlash={onSlash}
        />
      );
    case "stats":
      return (
        <StatsBlockFields
          block={block}
          onSelect={onSelect}
          onChange={onChange}
        />
      );
    case "image":
      return (
        <ImageBlockFields
          block={block}
          onSelect={onSelect}
          onChange={onChange}
        />
      );
    default: {
      // Exhaustiveness guard: TypeScript rejects an unhandled ArticleBlock
      // member here at compile time.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}
