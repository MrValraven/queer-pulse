import type { ClipboardEvent, RefObject } from "react";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleBlock } from "../../api/pieces.api";
import { ArticleBlockEditor } from "./ArticleBlockEditor";
import { BLOCK_KINDS, type ArticleBlockKind } from "./blockKinds";
import { RichText } from "./RichText";
import styles from "./ArticleDocument.module.css";

export interface ArticleDocumentProps {
  /** Attached to the `.doc` root so `SelectionToolbar` (rendered by the
   * page) knows "a selection inside here is this article's". */
  docRef: RefObject<HTMLDivElement | null>;
  kicker: string;
  /** PLAIN TEXT, never markup — the public reader renders it as JSX text.
   * Both fields are edited in `RichText`'s `plainText` mode, which commits
   * `textContent`. See `plainText.ts`. */
  title: string;
  /** Plain text, same contract as `title`. */
  standfirst: string;
  blocks: ArticleBlock[];
  selectedId: string | null;
  wordCount: number;
  readMinutes: number;
  onTitleChange: (text: string) => void;
  onStandfirstChange: (text: string) => void;
  onSelectBlock: (id: string) => void;
  onChangeBlock: (id: string, next: ArticleBlock) => void;
  onMoveBlock: (id: string, direction: "up" | "down") => void;
  onRemoveBlock: (id: string) => void;
  /** Bubbled from `ArticleBlockEditor`'s `onSlash` — the page opens the
   * slash menu positioned at `element`'s rect, `index` says which block to
   * insert the picked kind after. */
  onSlashOpen: (element: HTMLElement, index: number) => void;
  /** The add-bar's quick-insert row — always appends at the end. */
  onAppendBlock: (kind: ArticleBlockKind) => void;
  /** Paste-as-blocks: `index` is the block the cursor was in (or the last
   * block, pasting after the end) when the paste landed. */
  onPasteParagraphs: (index: number, texts: string[]) => void;
}

/**
 * The document surface itself — kicker, title, standfirst, a live word/
 * read-time count, the block list, and an add-bar. Ported from the design
 * prototype's `.doc`/`.docwrap` (`mag-write.jsx`). Owns nothing but a paste
 * handler; every block mutation is a callback into `ArticleEditorPage`
 * (via `useArticleBlockOps`), so this stays a thin composition layer.
 *
 * CRITICAL: each block is keyed on `block.id`, never its array index — an
 * index key would remount `RichText` on reorder/insert and destroy whatever
 * caret was live inside it.
 */
export function ArticleDocument({
  docRef,
  kicker,
  title,
  standfirst,
  blocks,
  selectedId,
  wordCount,
  readMinutes,
  onTitleChange,
  onStandfirstChange,
  onSelectBlock,
  onChangeBlock,
  onMoveBlock,
  onRemoveBlock,
  onSlashOpen,
  onAppendBlock,
  onPasteParagraphs,
}: ArticleDocumentProps) {
  const { t } = useTranslation();

  function handleHeadlinePaste(event: ClipboardEvent<HTMLDivElement>) {
    // Title/standfirst sit outside `.blockList` below, so they don't get
    // `handlePaste`'s protection — without this, the browser's default
    // paste drops the clipboard's HTML straight into these contentEditables
    // (wrapper tags, inline styles, classes and all), which then becomes
    // the saved title/standfirst verbatim. Collapse to plain text instead,
    // same as blocks discard rich clipboard markup below.
    event.preventDefault();
    const text = event.clipboardData
      .getData("text/plain")
      .replace(/\s+/g, " ")
      .trim();
    if (text) document.execCommand("insertText", false, text);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const text = event.clipboardData.getData("text/plain");
    if (!text.trim()) return;
    // Word-processor/rich clipboard markup is deliberately discarded — only
    // the plain text survives, split into one paragraph block per blank-line
    // group, matching the plan's "strip markup, split on blank lines".
    event.preventDefault();
    const targetElement = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-block-id]",
    );
    const targetId = targetElement?.dataset.blockId;
    const targetIndex = targetId
      ? blocks.findIndex((block) => block.id === targetId)
      : blocks.length - 1;
    const paragraphs = text
      .split(/\r?\n\s*\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
    if (paragraphs.length > 0) onPasteParagraphs(targetIndex, paragraphs);
  }

  return (
    <div className={styles.doc} ref={docRef}>
      <div className={styles.docwrap}>
        {kicker && <div className={styles.kicker}>{kicker}</div>}
        <RichText
          html={title}
          onChange={onTitleChange}
          onPaste={handleHeadlinePaste}
          className={styles.title}
          placeholder={t("magazine:write.document.headlinePlaceholder")}
          plainText
        />
        <RichText
          html={standfirst}
          onChange={onStandfirstChange}
          onPaste={handleHeadlinePaste}
          className={styles.standfirst}
          placeholder={t("magazine:write.document.standfirstPlaceholder")}
          plainText
        />
        <div className={styles.byline}>
          <span>{t("magazine:format.words", { count: wordCount })}</span>
          <span aria-hidden="true">·</span>
          <span>{t("magazine:format.minRead", { count: readMinutes })}</span>
        </div>

        <div className={styles.blockList} onPaste={handlePaste}>
          {blocks.map((block, index) => (
            <div key={block.id} data-block-id={block.id}>
              <ArticleBlockEditor
                block={block}
                index={index}
                total={blocks.length}
                selected={selectedId === block.id}
                onSelect={() => onSelectBlock(block.id)}
                onChange={(next) => onChangeBlock(block.id, next)}
                onMove={(direction) => onMoveBlock(block.id, direction)}
                onRemove={() => onRemoveBlock(block.id)}
                onSlash={onSlashOpen}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.addbar}>
        {BLOCK_KINDS.slice(0, 5).map((option) => (
          <Button
            key={option.kind}
            size="sm"
            variant="ghost"
            onClick={() => onAppendBlock(option.kind)}
          >
            {t(`magazine:write.blockKind.${option.kind}.label`)}
          </Button>
        ))}
        <span className={styles.hint}>
          {t("magazine:write.document.addBlockHint")}
        </span>
      </div>
    </div>
  );
}
