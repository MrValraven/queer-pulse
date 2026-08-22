import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { normalizeLinkHref } from "./linkHref";
import styles from "./SelectionToolbar.module.css";

export interface LinkPromptProps {
  /** Prefilled when the selection already sits inside a link. */
  initialHref: string;
  /** Receives an href already normalized and checked against the reader's
   * protocol allowlist, so the caller can hand it straight to `createLink`. */
  onApply: (href: string) => void;
  onCancel: () => void;
}

/**
 * The address field the toolbar's Link button opens. Links used to be created
 * with a hardcoded `https://` placeholder that the reader's sanitizer always
 * dropped, so every link a writer added disappeared on publish; this asks for
 * the real address and refuses anything the reader would not keep.
 *
 * `mousedown` is stopped here (the toolbar itself cancels mousedown to protect
 * the text selection) so clicking into the field can still focus it.
 */
export function LinkPrompt({
  initialHref,
  onApply,
  onCancel,
}: LinkPromptProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialHref);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const href = normalizeLinkHref(value);
  const showInvalid = value.trim() !== "" && href === null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (href) onApply(href);
  }

  return (
    // The mousedown guard stops the toolbar's own mousedown handler from
    // collapsing the text selection before the link is applied. It sits on a
    // presentational wrapper rather than on the <form>, because a form is a
    // non-interactive element and must not carry mouse listeners.
    <div
      role="presentation"
      className={styles.linkPromptGuard}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <form className={styles.linkPrompt} onSubmit={handleSubmit}>
        <div className={styles.linkRow}>
          <input
            ref={inputRef}
            className={styles.linkInput}
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={value}
            placeholder={t("magazine:write.selection.linkPlaceholder")}
            aria-label={t("magazine:write.selection.linkFieldLabel")}
            aria-invalid={showInvalid}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
            }}
          />
          <Button
            type="submit"
            variant="ghost-dark"
            size="sm"
            disabled={href === null}
            aria-label={t("magazine:write.selection.linkApply")}
          >
            <FiCheck aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost-dark"
            size="sm"
            onClick={onCancel}
            aria-label={t("magazine:write.selection.linkCancel")}
          >
            <FiX aria-hidden />
          </Button>
        </div>
        {showInvalid && (
          <p className={styles.linkHint} role="alert">
            {t("magazine:write.selection.linkInvalid")}
          </p>
        )}
      </form>
    </div>
  );
}
