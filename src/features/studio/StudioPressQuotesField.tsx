import { AnimatePresence } from "motion/react";
import { useId, useLayoutEffect, useRef } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
  type ButtonSize,
} from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import { STUDIO_PRESS } from "./api/studio.types";
import type {
  StudioPressKitFormErrors,
  StudioPressQuoteFormEntry,
} from "./studioPressEdit";
import s from "./creator.module.css";
import styles from "./StudioPressEdit.module.css";

type QuoteErrors = StudioPressKitFormErrors["quotes"][number];

/** On a phone the quote buttons take the full size, the 44px tap target. */
const PHONE_QUERY = mediaMax(720);

/** A field's error line, folding in and out under its field. */
function QuoteFieldError({ id, errorKey }: { id: string; errorKey?: string }) {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={errorKey !== undefined}>
      <p id={id} className={s.fieldError}>
        {errorKey ? t(errorKey) : ""}
      </p>
    </Collapse>
  );
}

function QuoteRow({
  index,
  entry,
  errors,
  quoteRef,
  buttonSize,
  onChange,
  onRemove,
}: {
  index: number;
  entry: StudioPressQuoteFormEntry;
  errors: QuoteErrors | undefined;
  quoteRef: (element: HTMLTextAreaElement | null) => void;
  buttonSize: ButtonSize;
  onChange: (entry: StudioPressQuoteFormEntry) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const quoteId = useId();
  const sourceId = useId();
  const quoteErrorId = useId();
  const sourceErrorId = useId();
  return (
    <div className={styles.quoteRow}>
      <div className={s.field}>
        <label htmlFor={quoteId}>{t("studio:pressEdit.quoteLabel")}</label>
        <textarea
          ref={quoteRef}
          id={quoteId}
          rows={2}
          value={entry.quote}
          maxLength={STUDIO_PRESS.quoteMax}
          aria-invalid={errors?.quote ? true : undefined}
          aria-describedby={errors?.quote ? quoteErrorId : undefined}
          onChange={(event) =>
            onChange({ ...entry, quote: event.target.value })
          }
        />
        <QuoteFieldError id={quoteErrorId} errorKey={errors?.quote} />
      </div>
      <div className={s.field}>
        <label htmlFor={sourceId}>{t("studio:pressEdit.sourceLabel")}</label>
        <input
          id={sourceId}
          type="text"
          value={entry.source}
          maxLength={STUDIO_PRESS.sourceMax}
          aria-invalid={errors?.source ? true : undefined}
          aria-describedby={errors?.source ? sourceErrorId : undefined}
          onChange={(event) =>
            onChange({ ...entry, source: event.target.value })
          }
        />
        <QuoteFieldError id={sourceErrorId} errorKey={errors?.source} />
      </div>
      <Button variant="ghost" size={buttonSize} onClick={onRemove}>
        <FiX aria-hidden />{" "}
        {t("studio:pressEdit.removeQuoteCta", { number: index + 1 })}
      </Button>
    </div>
  );
}

/** Up to three quotes, each a line and its source. Remove moves focus to
 *  the next quote, else to Add quote; Add quote focuses the new quote. */
export function StudioPressQuotesField({
  quotes,
  errors,
  onChange,
}: {
  quotes: StudioPressQuoteFormEntry[];
  errors: StudioPressKitFormErrors["quotes"];
  onChange: (quotes: StudioPressQuoteFormEntry[]) => void;
}) {
  const { t } = useTranslation();
  const addId = useId();
  const quoteFieldsRef = useRef(new Map<string, HTMLTextAreaElement>());
  const focusRef = useRef<string | null>(null);
  const addedCountRef = useRef(0);
  const isFull = quotes.length >= STUDIO_PRESS.quotesMax;
  const buttonSize: ButtonSize = useMediaQuery(PHONE_QUERY) ? "md" : "sm";
  const keyOf = (entry: StudioPressQuoteFormEntry, index: number) =>
    entry.rowKey ?? `row-${index}`;

  useLayoutEffect(() => {
    const pendingKey = focusRef.current;
    if (!pendingKey) return;
    focusRef.current = null;
    const target =
      pendingKey === addId
        ? document.getElementById(addId)
        : quoteFieldsRef.current.get(pendingKey);
    target?.focus();
  });

  const registerQuote =
    (key: string) => (element: HTMLTextAreaElement | null) => {
      if (element) quoteFieldsRef.current.set(key, element);
      else quoteFieldsRef.current.delete(key);
    };

  const removeAt = (index: number) => {
    const nextEntry = quotes[index + 1];
    focusRef.current = nextEntry ? keyOf(nextEntry, index + 1) : addId;
    onChange(quotes.filter((_, position) => position !== index));
  };

  const addQuote = () => {
    if (isFull) return;
    addedCountRef.current += 1;
    const rowKey = `added-${addedCountRef.current}`;
    focusRef.current = rowKey;
    onChange([...quotes, { quote: "", source: "", rowKey }]);
  };

  return (
    <div className={styles.quotes}>
      <ol className={styles.quoteList}>
        <AnimatePresence initial={false}>
          {quotes.map((entry, index) => {
            const key = keyOf(entry, index);
            return (
              <CollapseListItem key={key}>
                <QuoteRow
                  index={index}
                  entry={entry}
                  errors={errors[index]}
                  quoteRef={registerQuote(key)}
                  buttonSize={buttonSize}
                  onChange={(next) =>
                    onChange(
                      quotes.map((current, position) =>
                        position === index ? next : current,
                      ),
                    )
                  }
                  onRemove={() => removeAt(index)}
                />
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ol>
      <div>
        <Button
          id={addId}
          variant="ghost"
          size={buttonSize}
          aria-disabled={isFull || undefined}
          onClick={addQuote}
        >
          <FiPlus aria-hidden /> {t("studio:pressEdit.addQuoteCta")}
        </Button>
      </div>
    </div>
  );
}
