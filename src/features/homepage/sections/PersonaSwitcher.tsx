import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FiChevronDown } from "react-icons/fi";
import {
  getPersonas,
  SWITCHER_ORDER,
  type PersonaKey,
} from "./personasShowcase.data";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PersonasShowcase.module.css";

const tintClass: Record<string, string | undefined> = {
  plum: styles.avPlum,
  acc: styles.avAcc,
  jade: styles.avJade,
  mute: styles.avMute,
};

/** The "Posting as" disclosure: a pill button showing the active persona,
 * opening a menu of the main profile plus all three personas. Follows the
 * same roving-focus APG menu-button pattern as `ThreadRowMenu`. */
export function PersonaSwitcher({
  selectedKey,
  onSelect,
}: {
  selectedKey: PersonaKey;
  onSelect: (key: PersonaKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  const { t } = useTranslation();
  const personas = getPersonas(t);
  const selected = personas[selectedKey];

  useEffect(() => {
    if (!open) return;
    function onDocumentPointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocumentPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const moveTo = (index: number) => {
    const nextIndex = (index + SWITCHER_ORDER.length) % SWITCHER_ORDER.length;
    itemRefs.current[nextIndex]?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    const currentIndex = itemRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTo(currentIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTo(currentIndex - 1);
    }
  };

  return (
    <div className={styles.switcher} ref={containerRef}>
      <span className={styles.swLbl}>
        {t("homepage:subprofiles.postingAs")}
      </span>
      <button
        ref={triggerRef}
        type="button"
        className={styles.swBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((previous) => !previous)}
      >
        <span className={`${styles.swAv} ${tintClass[selected.tint]}`}>
          {selected.initials}
        </span>
        <span className={selected.nameCaps ? styles.swBtnNameCaps : undefined}>
          {selected.name}
        </span>
        <FiChevronDown
          aria-hidden
          className={
            open ? `${styles.swChev} ${styles.swChevOpen}` : styles.swChev
          }
        />
      </button>
      {open && (
        <div
          id={menuId}
          className={styles.swMenu}
          role="menu"
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
        >
          {SWITCHER_ORDER.map((key, index) => {
            const persona = personas[key];
            return (
              <div key={key}>
                {key === "mara" && <hr className={styles.swDivider} />}
                <button
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  className={styles.swItem}
                  aria-current={key === selectedKey}
                  onClick={() => {
                    onSelect(key);
                    close();
                  }}
                >
                  <span className={`${styles.swAv} ${tintClass[persona.tint]}`}>
                    {persona.initials}
                  </span>
                  <span>
                    {persona.name}
                    <span className={styles.swSub}>{persona.switcherSub}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
