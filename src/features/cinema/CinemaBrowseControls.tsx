import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChipSelect } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ACCESS_FILTERS,
  FORMAT_OPTIONS,
  MADE_BY_OPTIONS,
  COUNTRY_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  MOOD_OPTIONS,
  SORT_OPTIONS,
  type BrowseFilters,
  type SortKey,
} from "./cinemaBrowse.data";
import styles from "./CinemaBrowsePage.module.css";

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.group}>
      <div className={styles.gLabel}>{label}</div>
      {children}
    </div>
  );
}

export function CinemaBrowseSidebar({
  filters,
  toggleSet,
  setFormat,
  onClear,
}: {
  filters: BrowseFilters;
  toggleSet: (
    key: "access" | "madeBy" | "country" | "accessibility" | "mood",
    value: string,
  ) => void;
  setFormat: (value: string) => void;
  onClear: () => void;
}) {
  // Format is single-select with click-active-to-clear; modelled as a max-one
  // ChipSelect so setFormat keeps its toggle-back-to-null behaviour.
  const formatSelected = filters.format
    ? new Set([filters.format])
    : new Set<string>();
  const { t } = useTranslation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sfHead}>
        <h3>
          <Translation
            i18nKey="cinema:browse.filters.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <span
          className={styles.clear}
          role="button"
          tabIndex={0}
          onClick={onClear}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClear();
            }
          }}
        >
          {t("cinema:browse.filters.clearAll")}
        </span>
      </div>

      <FilterGroup label={t("cinema:browse.filters.groupAccess")}>
        <ChipSelect
          tint="dark"
          tick={false}
          options={ACCESS_FILTERS.map((a) => ({
            value: a.value,
            label: t(a.labelKey),
          }))}
          selected={filters.access}
          onToggle={(v) => toggleSet("access", v)}
        />
      </FilterGroup>

      <FilterGroup label={t("cinema:browse.filters.groupFormat")}>
        <ChipSelect
          tint="dark"
          tick={false}
          options={FORMAT_OPTIONS.map((f) => ({
            value: f.value,
            label: t(f.labelKey),
          }))}
          selected={formatSelected}
          onToggle={setFormat}
        />
      </FilterGroup>

      <FilterGroup label={t("cinema:browse.filters.groupMadeBy")}>
        <ChipSelect
          tint="dark"
          tick={false}
          options={MADE_BY_OPTIONS.map((m) => ({
            value: m.value,
            label: t(m.labelKey),
          }))}
          selected={filters.madeBy}
          onToggle={(v) => toggleSet("madeBy", v)}
        />
      </FilterGroup>
      <FilterGroup label={t("cinema:browse.filters.groupCountry")}>
        <ChipSelect
          tint="dark"
          tick={false}
          options={COUNTRY_OPTIONS.map((c) => ({
            value: c.value,
            label: t(c.labelKey),
          }))}
          selected={filters.country}
          onToggle={(v) => toggleSet("country", v)}
        />
      </FilterGroup>
      <FilterGroup label={t("cinema:browse.filters.groupAccessibility")}>
        <ChipSelect
          tint="dark"
          tone="jade"
          tick={false}
          options={ACCESSIBILITY_OPTIONS.map((a) => ({
            value: a.value,
            label: t(a.labelKey),
          }))}
          selected={filters.accessibility}
          onToggle={(v) => toggleSet("accessibility", v)}
        />
      </FilterGroup>
      <FilterGroup label={t("cinema:browse.filters.groupMood")}>
        <ChipSelect
          tint="dark"
          tick={false}
          options={MOOD_OPTIONS.map((m) => ({
            value: m.value,
            label: t(m.labelKey),
          }))}
          selected={filters.mood}
          onToggle={(v) => toggleSet("mood", v)}
        />
      </FilterGroup>
    </aside>
  );
}

/** Real <select>-style dropdown for sorting results. */
export function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (key: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const current =
    SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]!;

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className={styles.sortWrap} ref={ref}>
      <button
        type="button"
        className={styles.sortSel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {t(current.labelKey)}
        <svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <ul className={styles.sortMenu} role="listbox">
          {SORT_OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                className={[
                  styles.sortOpt,
                  o.value === value && styles.sortOptOn,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                {t(o.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
