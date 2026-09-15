import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { ComposeChecklistItem } from "./composeThread.types";
import styles from "./ComposeChecklistBlock.module.css";

// ── "Ready to post" ─────────────────────────────────────────────────────────
// Status, so it reads quietly: the rows never move, never reorder, and the
// only thing that changes as the member types is a tick and a countdown.
//
// The live region is a SEPARATE hidden line carrying the count of required
// rows done, rather than `aria-live` on the list itself. A live list would
// re-announce the body row's "23 more characters" on every keystroke, which is
// the definition of stealing attention from someone who is mid-sentence. The
// count changes at most three times in a whole composing session.
//
// THE `Block` SUFFIX IS LOAD-BEARING. `composeChecklist.ts`, the pure builder
// that produces these rows, already sits in this folder, and macOS
// canonicalizes file names case-insensitively: a `ComposeChecklist.tsx` beside
// it is dropped from the TypeScript program altogether, and an import of
// `./ComposeChecklist` resolves to the builder. The suffix is what keeps both
// files reachable, so leave it in place.

export interface ComposeChecklistBlockProps {
  /** The five rows, exactly as `buildComposeChecklist` returns them. */
  items: readonly ComposeChecklistItem[];
  /** Extra classes from whatever lays the block out. */
  className?: string;
}

export function ComposeChecklistBlock({
  items,
  className,
}: ComposeChecklistBlockProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const headingId = useId();
  const requiredItems = items.filter((item) => item.isRequired);
  const doneRequiredCount = requiredItems.filter((item) => item.isDone).length;
  const isEverythingRequiredDone =
    requiredItems.length > 0 && doneRequiredCount === requiredItems.length;

  return (
    <section
      className={[styles.block, className].filter(Boolean).join(" ")}
      aria-labelledby={headingId}
    >
      <h2 className={styles.heading} id={headingId}>
        {t("forum:composePage.checklist.heading")}
      </h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <ChecklistRow key={item.id} item={item} translate={t} />
        ))}
      </ul>
      <p className="visuallyHidden" role="status">
        {isEverythingRequiredDone
          ? t("forum:composePage.checklist.allRequiredDone")
          : t("forum:composePage.checklist.progress", {
              done: format.number(doneRequiredCount),
              total: format.number(requiredItems.length),
            })}
      </p>
    </section>
  );
}

function ChecklistRow({
  item,
  translate,
}: {
  item: ComposeChecklistItem;
  translate: TFunction;
}) {
  // The hint is what is still missing, so it belongs on an unfinished row
  // only: "17 more characters" beside a ticked row is a contradiction.
  const hint =
    !item.isDone && item.hintKey
      ? translate(item.hintKey, item.hintValues)
      : null;
  return (
    <li
      className={[
        styles.row,
        item.isDone && styles.rowDone,
        !item.isRequired && styles.rowOptional,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* A tick is a SHAPE, so the done state survives without its jade fill
          for anyone who cannot separate the two colours. The hidden text
          below says the same thing for a screen reader. */}
      <span className={styles.box} aria-hidden="true">
        {item.isDone && <FiCheck />}
      </span>
      <span className={styles.label}>{translate(item.labelKey)}</span>
      <span className="visuallyHidden">
        {translate(
          item.isDone
            ? "forum:composePage.checklist.stateDone"
            : "forum:composePage.checklist.stateToDo",
        )}
      </span>
      {hint && <span className={styles.hint}>{hint}</span>}
      {!hint && !item.isRequired && (
        <span className={styles.optional}>
          {translate("forum:composePage.section.optional")}
        </span>
      )}
    </li>
  );
}
