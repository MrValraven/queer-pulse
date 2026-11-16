import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { FiSearch, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { AdminEmptyState } from "../../../features/admin/ui/AdminEmptyState";
import { useScrollLock } from "../../hooks";
import { useFormat } from "../../i18n/format";
import { useTranslation } from "../../i18n/useTranslation";
import { IconButton } from "../ui";
import { isTopmostModal, popModal, pushModal } from "../ui/modalStack";
import { ADMIN_NAV_OVERVIEW } from "./adminNav.data";
import type { AdminNavItem, AdminNavSection } from "./adminNav.data";
import {
  countAdminNavMatches,
  normalizeSearchText,
  pendingCount,
  searchAdminNav,
} from "./adminNavMatching";
import type {
  AdminNavBadgeCounts,
  AdminNavSearchGroup,
} from "./adminNavMatching";
import { useAdminNavBadges } from "./useAdminNavBadges";
import { useAdminSidebarNav } from "./useAdminSidebarNav";
import styles from "./AdminCommandPalette.module.css";

const FADE_SECONDS = 0.16;
const RISE_PX = 8;
const PALETTE_EASE = [0.22, 0.68, 0.16, 1] as const;

/** Every destination this viewer is offered, grouped as the rail files them.
 *  What an empty query lists, so the palette doubles as a map of the console. */
function allAdminDestinations(
  sections: readonly AdminNavSection[],
  overview: AdminNavItem | undefined,
  translate: (key: string) => string,
): AdminNavSearchGroup[] {
  const sectionGroups = sections.map((section) => ({
    id: section.id,
    label: translate(section.labelKey),
    items: section.items,
  }));
  if (!overview) return sectionGroups;
  return [{ id: "overview", label: null, items: [overview] }, ...sectionGroups];
}

/** Keeps Tab inside the open palette: the field and the close button are its
 *  only tab stops, since the options are reached with the arrow keys. */
function keepTabInside(event: ReactKeyboardEvent<HTMLElement>) {
  const stops = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>("input, button"),
  );
  if (stops.length === 0) return;
  const index = stops.indexOf(document.activeElement as HTMLElement);
  const step = event.shiftKey ? -1 : 1;
  event.preventDefault();
  stops[(index + step + stops.length) % stops.length]?.focus();
}

/**
 * The admin console's Cmd/Ctrl+K palette: a search over every destination the
 * viewer's rail offers, grouped by section, with each queue's pending count.
 * `useAdminCommandPalette` owns the open state and the shortcut; this renders
 * the dialog and animates it in and out.
 */
export function AdminCommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return createPortal(
    <AnimatePresence>
      {isOpen && <AdminCommandPaletteDialog key="palette" onClose={onClose} />}
    </AnimatePresence>,
    document.body,
  );
}

/** The open palette. Mounts on open, so the query and the active row start
 *  fresh on every visit. */
function AdminCommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isPresent = useIsPresent();
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  useScrollLock(isPresent);

  const { sections, isFullConsole } = useAdminSidebarNav();
  const badgeCounts = useAdminNavBadges();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const paletteId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const hasQuery = normalizeSearchText(query).length > 0;
  const groups = useMemo(() => {
    const overview = isFullConsole ? ADMIN_NAV_OVERVIEW : undefined;
    return hasQuery
      ? searchAdminNav({ sections, overview, query, translate: t })
      : allAdminDestinations(sections, overview, t);
  }, [hasQuery, sections, isFullConsole, query, t]);
  const options = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  );
  // Clamped during render, so a narrowing query never leaves a stale row lit.
  const currentIndex = Math.min(activeIndex, Math.max(0, options.length - 1));

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Joins the shared modal stack while showing, so a drawer or dialog open
  // underneath stops being topmost: its Escape handler and every shortcut
  // layer gated on `hasOpenModal()` stand down until the palette leaves.
  useEffect(() => {
    if (!isPresent) return;
    pushModal(paletteId);
    return () => popModal(paletteId);
  }, [isPresent, paletteId]);

  // Esc with focus outside the panel's tab stops (on <body> after a click on
  // the panel's padding, a group heading or the empty state). A press from
  // inside the panel is spent by the panel's own handler and never gets here.
  useEffect(() => {
    if (!isPresent) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isTopmostModal(paletteId)) return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isPresent, paletteId, onClose]);

  useEffect(() => {
    document
      .getElementById(`${listboxId}-option-${currentIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [listboxId, currentIndex]);

  const openDestination = (item: AdminNavItem | undefined) => {
    if (!item) return;
    onClose();
    void navigate(item.to);
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const count = options.length;
    if (event.key === "ArrowDown" && count > 0) {
      setActiveIndex((currentIndex + 1) % count);
    } else if (event.key === "ArrowUp" && count > 0) {
      setActiveIndex((currentIndex - 1 + count) % count);
    } else if (event.key === "Enter") {
      openDestination(options[currentIndex]);
    } else {
      return;
    }
    event.preventDefault();
  };

  const transition = {
    duration: isReducedMotion ? 0 : FADE_SECONDS,
    ease: PALETTE_EASE,
  };
  const label = t("shared:adminShell.palette.placeholder");

  return (
    <m.div
      className={styles.overlay}
      role="presentation"
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <m.div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("shared:adminShell.palette.trigger")}
        initial={{ opacity: 0, y: isReducedMotion ? 0 : -RISE_PX }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isReducedMotion ? 0 : -RISE_PX }}
        transition={transition}
        onKeyDown={(event) => {
          if (event.key === "Tab") keepTabInside(event);
          if (event.key !== "Escape") return;
          // Spent here: no document listener below may close a second layer.
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }}
      >
        <div className={styles.inputRow}>
          <FiSearch aria-hidden className={styles.inputIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            role="combobox"
            aria-label={label}
            aria-expanded={options.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              options.length > 0 ? optionId(currentIndex) : undefined
            }
            placeholder={label}
            value={query}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
          />
          <IconButton
            aria-label={t("shared:modal.close")}
            className={styles.close}
            onClick={onClose}
          >
            <FiX aria-hidden />
          </IconButton>
        </div>

        {options.length === 0 ? (
          <div className={styles.empty}>
            <AdminEmptyState
              size="inline"
              icon={FiSearch}
              title={t("shared:adminShell.palette.empty", {
                query: query.trim(),
              })}
            />
          </div>
        ) : (
          <AdminCommandPaletteResults
            listboxId={listboxId}
            label={label}
            groups={groups}
            badgeCounts={badgeCounts}
            activeIndex={currentIndex}
            optionId={optionId}
            onHover={setActiveIndex}
            onPick={openDestination}
          />
        )}
        {/* Mounted for the dialog's whole life so screen readers keep
            listening to it; only the text changes as the query narrows. */}
        <p className="visuallyHidden" role="status">
          {hasQuery && options.length > 0
            ? t("shared:adminSidebar.search.results", {
                count: countAdminNavMatches(groups),
              })
            : ""}
        </p>
      </m.div>
    </m.div>
  );
}

const TONE_CLASS = {
  alert: styles.countAlert,
  warn: styles.countWarn,
} as const;

/** The listbox: one group per rail section, each option with its icon, its
 *  label and the pending count of the queue behind it. */
function AdminCommandPaletteResults({
  listboxId,
  label,
  groups,
  badgeCounts,
  activeIndex,
  optionId,
  onHover,
  onPick,
}: {
  listboxId: string;
  label: string;
  groups: AdminNavSearchGroup[];
  badgeCounts: AdminNavBadgeCounts;
  activeIndex: number;
  optionId: (index: number) => string;
  onHover: (index: number) => void;
  onPick: (item: AdminNavItem) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Where each group's options start in the flat option order the arrow keys
  // walk, so an option's id and active state line up with that order.
  const groupStarts: number[] = [];
  groups.reduce((start, group) => {
    groupStarts.push(start);
    return start + group.items.length;
  }, 0);

  return (
    <div
      id={listboxId}
      role="listbox"
      aria-label={label}
      className={styles.results}
    >
      {groups.map((group, groupIndex) => {
        const headId = `${listboxId}-group-${group.id}`;
        return (
          <div
            key={group.id}
            role="group"
            aria-labelledby={group.label ? headId : undefined}
            className={styles.group}
          >
            {group.label && (
              <p id={headId} role="presentation" className={styles.groupHead}>
                {group.label}
              </p>
            )}
            {group.items.map((item, itemIndex) => {
              const optionIndex = (groupStarts[groupIndex] ?? 0) + itemIndex;
              const isActive = optionIndex === activeIndex;
              const count = pendingCount(item, badgeCounts);
              const Icon = item.icon;
              return (
                <div
                  key={item.to}
                  id={optionId(optionIndex)}
                  role="option"
                  aria-selected={isActive}
                  // Required by the a11y ratchet (interactive-supports-focus
                  // and click-events-have-key-events, budget 0). Focus stays
                  // in the field through aria-activedescendant.
                  tabIndex={-1}
                  className={[styles.option, isActive && styles.optionActive]
                    .filter(Boolean)
                    .join(" ")}
                  onPointerMove={() => onHover(optionIndex)}
                  onClick={() => onPick(item)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    onPick(item);
                  }}
                >
                  <span className={styles.optionIcon} aria-hidden>
                    <Icon />
                  </span>
                  <span className={styles.optionLabel}>{t(item.labelKey)}</span>
                  {count > 0 && (
                    <span
                      className={[
                        styles.count,
                        TONE_CLASS[item.tone ?? "warn"],
                      ].join(" ")}
                    >
                      {fmt.number(count)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
