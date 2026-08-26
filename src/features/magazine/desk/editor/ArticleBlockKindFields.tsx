import { FiTrash2 } from "react-icons/fi";
import type {
  ArticleBlock,
  ArticleImageBlock,
  ArticleQaBlock,
  ArticleQuoteBlock,
  ArticleStatsBlock,
} from "../../api/pieces.api";
import { Avatar } from "../../../../shared/components/ui";
import { initialsFromName } from "../../../../shared/lib/initials";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { RichText } from "./RichText";
import { ImageBlockControls } from "./ImageBlockControls";
import styles from "./ArticleBlockEditor.module.css";

interface KindFieldsProps<T extends ArticleBlock> {
  block: T;
  onSelect: () => void;
  onChange: (next: ArticleBlock) => void;
}

interface RichKindFieldsProps<
  T extends ArticleBlock,
> extends KindFieldsProps<T> {
  index: number;
  onSlash: (element: HTMLElement, index: number) => void;
}

/** The cited-answer block: the quoted speech as RichText, plus a plain
 * attribution input rendered with a "— " prefix (ported from the design's
 * `.blk-quote .cite`; `cite` is a plain string field, not HTML, so a native
 * input is the right control rather than another contentEditable surface). */
export function QuoteBlockFields({
  block,
  index,
  onSelect,
  onChange,
  onSlash,
}: RichKindFieldsProps<ArticleQuoteBlock>) {
  const { t } = useTranslation();
  return (
    <div className={styles.quote}>
      <RichText
        html={block.html}
        placeholder={t("magazine:write.block.quotePlaceholder")}
        onChange={(html) => onChange({ ...block, html })}
        onSlash={(element) => onSlash(element, index)}
        onFocus={onSelect}
      />
      <p className={styles.cite}>
        <span aria-hidden="true">{"— "}</span>
        <input
          type="text"
          className={styles.citeInput}
          value={block.cite}
          placeholder={t("magazine:write.block.attributionPlaceholder")}
          onChange={(event) => onChange({ ...block, cite: event.target.value })}
          onFocus={onSelect}
          aria-label={t("magazine:write.block.attributionAria")}
        />
      </p>
    </div>
  );
}

/** The interview Q&A block: the question as RichText, then an avatar (from
 * `who`'s initials) beside the "who" name input and the answer RichText. */
export function QaBlockFields({
  block,
  index,
  onSelect,
  onChange,
  onSlash,
}: RichKindFieldsProps<ArticleQaBlock>) {
  const { t } = useTranslation();
  return (
    <div className={styles.qa}>
      <RichText
        html={block.q}
        placeholder={t("magazine:write.block.questionPlaceholder")}
        className={styles.q}
        onChange={(q) => onChange({ ...block, q })}
        onSlash={(element) => onSlash(element, index)}
        onFocus={onSelect}
      />
      <div className={styles.a}>
        <Avatar
          initials={initialsFromName(block.who, "?")}
          size={32}
          name={block.who}
        />
        <div className={styles.aBody}>
          <input
            type="text"
            className={styles.whoInput}
            value={block.who}
            placeholder={t("magazine:write.block.whoPlaceholder")}
            onChange={(event) =>
              onChange({ ...block, who: event.target.value })
            }
            onFocus={onSelect}
            aria-label={t("magazine:write.block.whoAria")}
          />
          <RichText
            html={block.html}
            placeholder={t("magazine:write.block.answerPlaceholder")}
            onChange={(html) => onChange({ ...block, html })}
            onSlash={(element) => onSlash(element, index)}
            onFocus={onSelect}
          />
        </div>
      </div>
    </div>
  );
}

/** The stat-row block: a value/label input pair per item, each patched
 * immutably by index, plus add/remove-item controls so the row can grow
 * past whatever it started with. */
export function StatsBlockFields({
  block,
  onSelect,
  onChange,
}: KindFieldsProps<ArticleStatsBlock>) {
  const { t } = useTranslation();
  function updateItem(
    itemIndex: number,
    patch: Partial<ArticleStatsBlock["items"][number]>,
  ) {
    const items = block.items.map((item, currentIndex) =>
      currentIndex === itemIndex ? { ...item, ...patch } : item,
    );
    onChange({ ...block, items });
  }

  function removeItem(itemIndex: number) {
    onChange({
      ...block,
      items: block.items.filter(
        (_item, currentIndex) => currentIndex !== itemIndex,
      ),
    });
  }

  function addItem() {
    onChange({ ...block, items: [...block.items, { value: "", label: "" }] });
  }

  return (
    <div className={styles.stats}>
      {block.items.map((item, itemIndex) => (
        <div key={itemIndex} className={styles.statItem}>
          <input
            type="text"
            className={styles.statValue}
            value={item.value}
            placeholder={t("magazine:write.block.statValuePlaceholder")}
            onChange={(event) =>
              updateItem(itemIndex, { value: event.target.value })
            }
            onFocus={onSelect}
            aria-label={t("magazine:write.block.statValueAria", {
              number: itemIndex + 1,
            })}
          />
          <input
            type="text"
            className={styles.statLabel}
            value={item.label}
            placeholder={t("magazine:write.block.statLabelPlaceholder")}
            onChange={(event) =>
              updateItem(itemIndex, { label: event.target.value })
            }
            onFocus={onSelect}
            aria-label={t("magazine:write.block.statLabelAria", {
              number: itemIndex + 1,
            })}
          />
          <button
            type="button"
            className={styles.statRemove}
            onClick={() => removeItem(itemIndex)}
            aria-label={t("magazine:write.block.statRemoveAria", {
              number: itemIndex + 1,
            })}
          >
            <FiTrash2 aria-hidden />
          </button>
        </div>
      ))}
      <button type="button" className={styles.statAdd} onClick={addItem}>
        {t("magazine:write.block.addStat")}
      </button>
    </div>
  );
}

/** The image block's own body. CON-04 moved the picture ITSELF into
 * `ImageBlockControls`, alongside the alt/credit/rights/crop/focal controls
 * that describe it: it used to be a paste-an-image-URL field here, so the
 * only art an editor could put mid-piece was a hotlink to somebody else's
 * server, and the rights and focal controls beside it described an image the
 * desk could never actually supply. It is now a real upload through the same
 * presigned stack the story cover and the deck cover use. */
export function ImageBlockFields({
  block,
  onSelect,
  onChange,
}: KindFieldsProps<ArticleImageBlock>) {
  return (
    <div className={styles.image} onFocus={onSelect}>
      <ImageBlockControls block={block} onChange={onChange} />
    </div>
  );
}
