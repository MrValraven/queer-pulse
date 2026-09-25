import { FiArrowRight, FiMinus, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { RestoreDiffText } from "./RestoreDiffText";
import type {
  RestoreFieldChange,
  RestoreParagraphChange,
  RestoreRowChange,
} from "./restoreDiff.types";
import styles from "./RestoreDiff.module.css";

/** One full literal key per status, so a search for any key the review
 *  reads finds it here. */
const STATUS_LABEL_KEYS: Record<RestoreRowChange["status"], string> = {
  added: "marketing:listBusiness.editor.restore.review.status.added",
  removed: "marketing:listBusiness.editor.restore.review.status.removed",
  changed: "marketing:listBusiness.editor.restore.review.status.changed",
};

/** Thumbnail edge in px, set on the element too so the row keeps its height
 *  while the image loads. */
const THUMBNAIL_SIZE = 56;

/**
 * One changed field inside an area card: its label as the editor labels it,
 * then the change drawn the way that kind of field reads best. Prose gets an
 * inline word diff, a list of tags gets chips, a single choice gets
 * "before, arrow, after", and structured rows get one line each.
 */
export function RestoreDiffFieldRow({ field }: { field: RestoreFieldChange }) {
  const { t } = useTranslation();
  return (
    <div className={styles.field}>
      <p className={styles.fieldLabel}>{t(field.labelKey)}</p>
      <FieldChangeBody field={field} />
    </div>
  );
}

function FieldChangeBody({ field }: { field: RestoreFieldChange }) {
  switch (field.kind) {
    case "text":
      return <RestoreDiffText segments={field.segments} />;
    case "paragraphs":
      return <ParagraphChanges paragraphs={field.paragraphs} />;
    case "set":
      return <SetChanges added={field.added} removed={field.removed} />;
    case "choice":
      return <BeforeAfter before={field.before} after={field.after} />;
    case "rows":
      return <RowChanges rows={field.rows} />;
  }
}

function StatusTag({ status }: { status: RestoreRowChange["status"] }) {
  const { t } = useTranslation();
  return (
    <span className={styles.statusTag} data-status={status}>
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );
}

function ParagraphChanges({
  paragraphs,
}: {
  paragraphs: RestoreParagraphChange[];
}) {
  const { t } = useTranslation();
  return (
    <ul className={styles.paragraphs}>
      {paragraphs.map((paragraph) => (
        <li key={paragraph.key} className={styles.paragraph}>
          <p className={styles.paragraphCaption}>
            <span>
              {t("marketing:listBusiness.editor.restore.review.paragraph", {
                position: paragraph.position,
              })}
            </span>
            <StatusTag status={paragraph.status} />
          </p>
          <RestoreDiffText segments={paragraph.segments} />
        </li>
      ))}
    </ul>
  );
}

function SetChanges({
  added,
  removed,
}: {
  added: string[];
  removed: string[];
}) {
  const { t } = useTranslation();
  const addedPrefix = t(
    "marketing:listBusiness.editor.restore.review.addedPrefix",
  );
  const removedPrefix = t(
    "marketing:listBusiness.editor.restore.review.removedPrefix",
  );
  return (
    <ul className={styles.chips}>
      {added.map((value) => (
        <li key={`added-${value}`} className={styles.chip} data-tone="added">
          <FiPlus aria-hidden className={styles.chipIcon} />
          <span className="visuallyHidden">{addedPrefix} </span>
          <span className={styles.chipText}>{value}</span>
        </li>
      ))}
      {removed.map((value) => (
        <li
          key={`removed-${value}`}
          className={styles.chip}
          data-tone="removed"
        >
          <FiMinus aria-hidden className={styles.chipIcon} />
          <span className="visuallyHidden">{removedPrefix} </span>
          <span className={styles.chipText}>{value}</span>
        </li>
      ))}
    </ul>
  );
}

/** A value drawn as a pill: struck and danger-tinted for what goes, tinted
 *  success for what comes back. "" stands for a field left blank. */
function ValuePill({
  value,
  tone,
}: {
  value: string;
  tone: "removed" | "added";
}) {
  const { t } = useTranslation();
  const Element = tone === "removed" ? "del" : "ins";
  return (
    <Element className={styles.valuePill} data-tone={tone}>
      {value === "" ? (
        <em className={styles.emptyValue}>
          {t("marketing:listBusiness.editor.restore.review.empty")}
        </em>
      ) : (
        value
      )}
    </Element>
  );
}

/**
 * "Before, arrow, after" for a single value. With both sides, the visual pair
 * is hidden from screen readers and one plain sentence stands in for it,
 * because "struck X, arrow, Y" read aloud says nothing about the direction.
 * With one side (a row that is only added or only removed) the row's status
 * tag already says which, so the value stands alone.
 */
function BeforeAfter({
  before,
  after,
}: {
  before: string | null;
  after: string | null;
}) {
  const { t } = useTranslation();
  if (before === null && after === null) return null;
  if (before === null || after === null) {
    return (
      <p className={styles.beforeAfter}>
        {before !== null && <ValuePill value={before} tone="removed" />}
        {after !== null && <ValuePill value={after} tone="added" />}
      </p>
    );
  }
  const spokenValue = (value: string) =>
    value === ""
      ? t("marketing:listBusiness.editor.restore.review.empty")
      : value;
  return (
    <p className={styles.beforeAfter}>
      <span className="visuallyHidden">
        {t("marketing:listBusiness.editor.restore.review.choiceChange", {
          before: spokenValue(before),
          after: spokenValue(after),
        })}
      </span>
      <span className={styles.beforeAfterVisual} aria-hidden>
        <ValuePill value={before} tone="removed" />
        {/* The arrow travels with the value it points at, so a wrap never
            leaves it pointing at the end of a line. */}
        <span className={styles.afterGroup}>
          <FiArrowRight className={styles.arrow} />
          <ValuePill value={after} tone="added" />
        </span>
      </span>
    </p>
  );
}

/** A photo slot's before and after, side by side. `alt` stays empty: the
 *  row's own label already names the slot, and the pictures are the owner's
 *  own uploads, which they can see. */
function RowThumbnails({ row }: { row: RestoreRowChange }) {
  const hasBothImages = Boolean(row.beforeImageUrl && row.afterImageUrl);
  return (
    <div className={styles.thumbnails}>
      {row.beforeImageUrl && (
        <img
          className={styles.thumbnail}
          data-tone="removed"
          src={row.beforeImageUrl}
          alt=""
          loading="lazy"
          width={THUMBNAIL_SIZE}
          height={THUMBNAIL_SIZE}
        />
      )}
      {row.afterImageUrl && (
        <span className={styles.afterGroup}>
          {hasBothImages && (
            <FiArrowRight aria-hidden className={styles.arrow} />
          )}
          <img
            className={styles.thumbnail}
            data-tone="added"
            src={row.afterImageUrl}
            alt=""
            loading="lazy"
            width={THUMBNAIL_SIZE}
            height={THUMBNAIL_SIZE}
          />
        </span>
      )}
    </div>
  );
}

function RowChanges({ rows }: { rows: RestoreRowChange[] }) {
  return (
    <ul className={styles.rows}>
      {rows.map((row) => (
        <li key={row.key} className={styles.row}>
          <p className={styles.rowHead}>
            <StatusTag status={row.status} />
            <span className={styles.rowLabel}>{row.label}</span>
          </p>
          {(row.beforeImageUrl || row.afterImageUrl) && (
            <RowThumbnails row={row} />
          )}
          <BeforeAfter before={row.before} after={row.after} />
        </li>
      ))}
    </ul>
  );
}
