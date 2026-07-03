import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { CREATE_ITEMS } from "./drafts.data";
import styles from "./DraftsPage.module.css";

/** Drafts page header: title block + a "Start something" create-menu dropdown. */
export function DraftsHeader() {
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
        <div className={styles.eyebrow}>Drafts · only visible to you</div>
        <h1 className={styles.h1}>
          Things you <em>started.</em>
        </h1>
        <p className={styles.lead}>
          Posts, articles, applications, and pitches you haven't sent yet.{" "}
          <em>Auto-saved every 8 seconds.</em> Drafts older than 90 days get a
          polite reminder, then a polite second one, then quietly delete.
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
          Start something
        </Button>

        {open && (
          <div className={styles.createMenu} role="menu">
            {CREATE_ITEMS.map((item) => (
              <Link
                key={item.label}
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
                  {item.label}
                  <small>{item.sub}</small>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
