import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Button } from "../../shared/components/ui";
import styles from "./DeckPage.module.css";

/**
 * "Present" takeover: a full-screen portal that hosts the same `<DeckViewer>`
 * the caller renders inline, bound to the same index/onIndex — so exiting
 * Present keeps your place. Closes on Escape or the × button.
 */
export function DeckPresentButton({
  title,
  label,
  children,
}: {
  title: ReactNode;
  label?: string;
  children: ReactNode; // the <DeckViewer> to render inside the overlay
}) {
  const { t } = useTranslation();
  const [presenting, setPresenting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  useScrollLock(presenting);

  useEffect(() => {
    if (presenting) overlayRef.current?.focus();
  }, [presenting]);

  return (
    <>
      <Button variant="ghost" onClick={() => setPresenting(true)}>
        {t("magazine:deck.present")}
      </Button>
      {presenting &&
        createPortal(
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- WAI-ARIA modal dialog: the dialog intentionally handles Escape to dismiss itself.
          <div
            ref={overlayRef}
            className={styles.present}
            role="dialog"
            aria-modal
            aria-label={label}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape") setPresenting(false);
            }}
          >
            <div className={styles.presentBar}>
              <span className={styles.presentTitle}>{title}</span>
              <button
                type="button"
                className={styles.presentClose}
                onClick={() => setPresenting(false)}
                aria-label={t("magazine:deck.close")}
              >
                <FiX aria-hidden />
              </button>
            </div>
            <div className={styles.presentStage}>{children}</div>
          </div>,
          document.body,
        )}
    </>
  );
}
