import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CREATE_ITEMS } from "./drafts.data";
import styles from "./DraftsPage.module.css";

/** Drafts page header: title block + a "Start something" create-menu dropdown. */
export function DraftsHeader() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className={styles.head}>
      <div className={styles.headText}>
        <div className={styles.eyebrow}>
          {t("members:drafts.header.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="members:drafts.header.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>
          <Translation
            i18nKey="members:drafts.header.lead"
            components={{ em: <em /> }}
          />
        </p>
      </div>

      <div className={styles.create} ref={ref}>
        <Button
          variant="primary"
          className={styles.createBtn}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <svg viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            />
          </svg>
          {t("members:drafts.header.startCta")}
        </Button>

        {open && (
          <div className={styles.createMenu} role="menu">
            {CREATE_ITEMS.map((item) => (
              <Link
                key={item.labelKey}
                to={item.to}
                role="menuitem"
                className={styles.createItem}
                onClick={() => setOpen(false)}
              >
                <span
                  className={`${styles.ci} ${item.tint === "jade" ? styles.ciJade : styles.ciPlum}`}
                >
                  {item.badge}
                </span>
                <span>
                  {t(item.labelKey)}
                  <small>{t(item.subKey)}</small>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
