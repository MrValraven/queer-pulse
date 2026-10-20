import { useEffect, useId, useRef } from "react";
import { FiX } from "react-icons/fi";
import { Button, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import type { Standing } from "./trustGraph/trustGraphModel";
import type {
  VouchEdgeFilterKind,
  VouchGraphFilters,
} from "./vouchGraph.types";
import styles from "./vouchGraphShell.module.css";

const STANDINGS: readonly Standing[] = ["trusted", "warned", "new", "flagged"];
const EDGE_KINDS: readonly VouchEdgeFilterKind[] = [
  "invite",
  "vouch",
  "mutual",
];
const MONTH_VALUE = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Next value of a "pick some, empty means all" list after one box flips.
 * Ticking every box stores the empty list again. Unticking the last ticked
 * box keeps the list as it was, so the filter always leaves something.
 */
function toggleFilterValue<Value>(
  selected: readonly Value[],
  allValues: readonly Value[],
  value: Value,
  isChecked: boolean,
): Value[] {
  const current = selected.length === 0 ? [...allValues] : [...selected];
  const next = isChecked
    ? [...current, value]
    : current.filter((item) => item !== value);
  const ordered = allValues.filter((item) => next.includes(item));
  if (ordered.length === 0) return [...selected];
  return ordered.length === allValues.length ? [] : ordered;
}

function toMonthOrNull(value: string): string | null {
  return MONTH_VALUE.test(value) ? value : null;
}

interface FilterCheckGroupProps<Value extends string> {
  legend: string;
  values: readonly Value[];
  selected: readonly Value[];
  labelKeyPrefix: string;
  onChange: (next: Value[]) => void;
}

/** One fieldset of checkboxes where an empty selection means "all". */
function FilterCheckGroup<Value extends string>({
  legend,
  values,
  selected,
  labelKeyPrefix,
  onChange,
}: FilterCheckGroupProps<Value>) {
  const { t } = useTranslation();
  return (
    <fieldset className={styles.filterGroup}>
      <legend className={styles.filterLegend}>{legend}</legend>
      <div className={styles.filterChecks}>
        {values.map((value) => (
          <label key={value} className={styles.filterCheck}>
            <input
              type="checkbox"
              checked={selected.length === 0 || selected.includes(value)}
              onChange={(event) =>
                onChange(
                  toggleFilterValue(
                    selected,
                    values,
                    value,
                    event.target.checked,
                  ),
                )
              }
            />
            {t(`admin:${labelKeyPrefix}.${value}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

interface FilterSwitchProps {
  label: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}

/** A labelled switch row: the visible text is part of the tap target. */
function FilterSwitch({ label, isChecked, onChange }: FilterSwitchProps) {
  const switchId = useId();
  return (
    <div className={styles.filterSwitch}>
      <Toggle
        id={switchId}
        checked={isChecked}
        onChange={onChange}
        label={label}
      />
      <label htmlFor={switchId} className={styles.filterSwitchLabel}>
        {label}
      </label>
    </div>
  );
}

export interface VouchGraphFiltersPanelProps {
  panelId: string;
  filters: VouchGraphFilters;
  activeFilterCount: number;
  onFiltersChange: (next: VouchGraphFilters) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

/** B7: the filter panel. The caller places it with `VouchGraphFiltersSlot`
 *  (a drop-down over the stage, or a bottom sheet on phones); every field
 *  writes straight to the view state. */
export function VouchGraphFiltersPanel({
  panelId,
  filters,
  activeFilterCount,
  onFiltersChange,
  onClearFilters,
  onClose,
}: VouchGraphFiltersPanelProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const sceneSelectId = useId();
  const titleId = useId();
  const update = (patch: Partial<VouchGraphFilters>) =>
    onFiltersChange({ ...filters, ...patch });
  const isClearInactive = activeFilterCount === 0;
  const sectionRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape inside the panel folds the panel away. A native listener on the
  // panel stops the key before the modal's `document` listener sees it.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing) return;
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    };
    section.addEventListener("keydown", closeOnEscape);
    return () => section.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <section
      ref={sectionRef}
      id={panelId}
      className={styles.filtersPanel}
      aria-labelledby={titleId}
    >
      <div className={styles.filtersHead}>
        <h2 id={titleId} className={styles.filtersTitle}>
          {t("admin:vouchGraph.filters.title")}
        </h2>
        <button
          type="button"
          className={styles.filtersClose}
          onClick={onClose}
          aria-label={t("admin:vouchGraph.filters.closeCta")}
        >
          <FiX aria-hidden />
        </button>
      </div>
      <div className={styles.filtersBody}>
        <FilterCheckGroup
          legend={t("admin:vouchGraph.filters.standing")}
          values={STANDINGS}
          selected={filters.standings}
          labelKeyPrefix="vouchGraph.filters.standing"
          onChange={(standings) => update({ standings })}
        />
        <div className={styles.filterGroup}>
          <label htmlFor={sceneSelectId} className={styles.filterLegend}>
            {t("admin:vouchGraph.filters.scene")}
          </label>
          <select
            id={sceneSelectId}
            className={styles.filterControl}
            value={filters.sceneId ?? ""}
            onChange={(event) =>
              update({ sceneId: event.target.value || null })
            }
          >
            <option value="">{t("admin:vouchGraph.filters.sceneAll")}</option>
            {graph.scenes.map((scene) => (
              <option key={scene.id} value={scene.id}>
                {scene.label}
              </option>
            ))}
          </select>
        </div>
        <fieldset className={styles.filterGroup}>
          <legend className={styles.filterLegend}>
            {t("admin:vouchGraph.filters.dateRange")}
          </legend>
          <div className={styles.filterDates}>
            <label className={styles.filterDate}>
              <span>{t("admin:vouchGraph.filters.dateFrom")}</span>
              <input
                type="month"
                className={styles.filterControl}
                value={filters.connectedFrom ?? ""}
                max={filters.connectedTo ?? undefined}
                onChange={(event) =>
                  update({ connectedFrom: toMonthOrNull(event.target.value) })
                }
              />
            </label>
            <label className={styles.filterDate}>
              <span>{t("admin:vouchGraph.filters.dateTo")}</span>
              <input
                type="month"
                className={styles.filterControl}
                value={filters.connectedTo ?? ""}
                min={filters.connectedFrom ?? undefined}
                onChange={(event) =>
                  update({ connectedTo: toMonthOrNull(event.target.value) })
                }
              />
            </label>
          </div>
        </fieldset>
        <FilterCheckGroup
          legend={t("admin:vouchGraph.filters.edgeKinds")}
          values={EDGE_KINDS}
          selected={filters.edgeKinds}
          labelKeyPrefix="vouchGraph.filters.edgeKind"
          onChange={(edgeKinds) => update({ edgeKinds })}
        />
        <div className={styles.filterSwitches}>
          <FilterSwitch
            label={t("admin:vouchGraph.filters.verifiedOnly")}
            isChecked={filters.isVerifiedOnly}
            onChange={(isVerifiedOnly) => update({ isVerifiedOnly })}
          />
          <FilterSwitch
            label={t("admin:vouchGraph.filters.hideWithdrawn")}
            isChecked={filters.shouldHideWithdrawn}
            onChange={(shouldHideWithdrawn) => update({ shouldHideWithdrawn })}
          />
        </div>
      </div>
      <div className={styles.filtersFoot}>
        {/* aria-disabled keeps the button focusable, so focus stays put
            after a clear empties the filters. */}
        <Button
          variant="ghost"
          size="sm"
          className={isClearInactive ? styles.filtersClearInactive : undefined}
          aria-disabled={isClearInactive}
          onClick={() => {
            if (!isClearInactive) onClearFilters();
          }}
        >
          {t("admin:vouchGraph.filters.clearCta")}
        </Button>
      </div>
    </section>
  );
}
