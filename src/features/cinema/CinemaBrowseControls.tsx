import { useId, type ReactNode } from "react";
import { ChipSelect, Select } from "../../shared/components/ui";
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

/**
 * A labelled filter block. The label is already on screen, so the group inside
 * is named by pointing at it (`aria-labelledby`) rather than repeating the
 * string — hence the render-prop child, which hands down the label's `id`.
 */
function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: (labelId: string) => ReactNode;
}) {
  const labelId = useId();
  return (
    <div className={styles.group}>
      <div className={styles.gLabel} id={labelId}>
        {label}
      </div>
      {children(labelId)}
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
        {(labelId) => (
          <ChipSelect
            tint="dark"
            tick={false}
            options={ACCESS_FILTERS.map((a) => ({
              value: a.value,
              label: t(a.labelKey),
            }))}
            selected={filters.access}
            onToggle={(v) => toggleSet("access", v)}
            labelledBy={labelId}
          />
        )}
      </FilterGroup>

      <FilterGroup label={t("cinema:browse.filters.groupFormat")}>
        {(labelId) => (
          <ChipSelect
            tint="dark"
            tick={false}
            options={FORMAT_OPTIONS.map((f) => ({
              value: f.value,
              label: t(f.labelKey),
            }))}
            selected={formatSelected}
            onToggle={setFormat}
            labelledBy={labelId}
          />
        )}
      </FilterGroup>

      <FilterGroup label={t("cinema:browse.filters.groupMadeBy")}>
        {(labelId) => (
          <ChipSelect
            tint="dark"
            tick={false}
            options={MADE_BY_OPTIONS.map((m) => ({
              value: m.value,
              label: t(m.labelKey),
            }))}
            selected={filters.madeBy}
            onToggle={(v) => toggleSet("madeBy", v)}
            labelledBy={labelId}
          />
        )}
      </FilterGroup>
      <FilterGroup label={t("cinema:browse.filters.groupCountry")}>
        {(labelId) => (
          <ChipSelect
            tint="dark"
            tick={false}
            options={COUNTRY_OPTIONS.map((c) => ({
              value: c.value,
              label: t(c.labelKey),
            }))}
            selected={filters.country}
            onToggle={(v) => toggleSet("country", v)}
            labelledBy={labelId}
          />
        )}
      </FilterGroup>
      <FilterGroup label={t("cinema:browse.filters.groupAccessibility")}>
        {(labelId) => (
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
            labelledBy={labelId}
          />
        )}
      </FilterGroup>
      <FilterGroup label={t("cinema:browse.filters.groupMood")}>
        {(labelId) => (
          <ChipSelect
            tint="dark"
            tick={false}
            options={MOOD_OPTIONS.map((m) => ({
              value: m.value,
              label: t(m.labelKey),
            }))}
            selected={filters.mood}
            onToggle={(v) => toggleSet("mood", v)}
            labelledBy={labelId}
          />
        )}
      </FilterGroup>
    </aside>
  );
}

/** Dropdown for sorting results, built on the shared Select primitive. */
export function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (key: SortKey) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.sortWrap}>
      <Select
        size="sm"
        value={value}
        onChange={(next) => next && onChange(next as SortKey)}
        options={SORT_OPTIONS.map((o) => ({
          value: o.value,
          label: t(o.labelKey),
        }))}
      />
    </div>
  );
}
