import { useEffect, useId, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  Button,
  ChipSelect,
  Collapse,
  DatePicker,
  FilterChips,
  Select,
  Toggle,
  type ChipOption,
} from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
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
/** The width where the filters become a bottom sheet (VouchGraphFiltersSlot):
 *  the rows stack and the fields take their full touch size. */
const PHONE_QUERY = "(max-width: 920px)";
const TOUCH_QUERY = "(max-width: 920px), (pointer: coarse)";
const MONTH_VALUE = /^\d{4}-(0[1-9]|1[0-2])$/;
/** Each preset's months back from the current month. The current month
 *  counts as one, so "Last 3 months" starts two months before it. */
const DATE_PRESET_MONTHS = { last3: 3, last12: 12 } as const;
type DatePreset = "any" | keyof typeof DATE_PRESET_MONTHS | "custom";
const DATE_PRESETS: readonly DatePreset[] = [
  "any",
  "last3",
  "last12",
  "custom",
];
const DATE_PRESET_LABEL_KEYS: Record<DatePreset, string> = {
  any: "admin:vouchGraph.filters.dateAnyTime",
  last3: "admin:vouchGraph.filters.dateLast3Months",
  last12: "admin:vouchGraph.filters.dateLast12Months",
  custom: "admin:vouchGraph.filters.dateCustom",
};
const EDGE_SWATCH_CLASS: Record<VouchEdgeFilterKind, string | undefined> = {
  invite: styles.filterSwatchInvite,
  vouch: styles.filterSwatchVouch,
  mutual: styles.filterSwatchMutual,
};

function toMonthOrNull(value: string | null): string | null {
  return value !== null && MONTH_VALUE.test(value) ? value : null;
}

/** The "yyyy-mm" month that opens a preset reaching back `monthCount`
 *  months, the current month included. */
function presetStartMonth(monthCount: number): string {
  const today = new Date();
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth() - (monthCount - 1),
    1,
  );
  const monthNumber = String(startDate.getMonth() + 1).padStart(2, "0");
  return `${startDate.getFullYear()}-${monthNumber}`;
}

/** The preset a stored range matches. Any other range reads as Custom. */
function datePresetFor(filters: VouchGraphFilters): DatePreset {
  const { connectedFrom, connectedTo } = filters;
  if (connectedFrom === null && connectedTo === null) return "any";
  if (connectedTo === null) {
    if (connectedFrom === presetStartMonth(DATE_PRESET_MONTHS.last3)) {
      return "last3";
    }
    if (connectedFrom === presetStartMonth(DATE_PRESET_MONTHS.last12)) {
      return "last12";
    }
  }
  return "custom";
}

/** Next value of a chip list after one chip flips, in the canonical order. */
function toggleListValue<Value extends string>(
  selected: readonly Value[],
  allValues: readonly Value[],
  value: Value,
): Value[] {
  const isSelected = selected.includes(value);
  return allValues.filter((item) =>
    item === value ? !isSelected : selected.includes(item),
  );
}

/** Standing chips, each keyed by a dot in that standing's colour. */
function standingChipOptions(t: (key: string) => string): ChipOption[] {
  return STANDINGS.map((standing) => ({
    value: standing,
    label: (
      <>
        <span
          className={styles.filterStandingDot}
          data-standing={standing}
          aria-hidden
        />
        {t(`admin:vouchGraph.filters.standing.${standing}`)}
      </>
    ),
  }));
}

/** Connection chips, each keyed by the line the legend draws for it. */
function edgeKindChipOptions(t: (key: string) => string): ChipOption[] {
  return EDGE_KINDS.map((edgeKind) => ({
    value: edgeKind,
    label: (
      <>
        <span
          className={cx(styles.filterSwatch, EDGE_SWATCH_CLASS[edgeKind])}
          aria-hidden
        />
        {t(`admin:vouchGraph.filters.edgeKind.${edgeKind}`)}
      </>
    ),
  }));
}

interface FilterSwitchProps {
  label: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
}

/** A labelled switch: the visible text is part of the tap target. */
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

interface FilterDateRowProps {
  labelId: string;
  filters: VouchGraphFilters;
  isCustomPicked: boolean;
  isPhone: boolean;
  isTouchSized: boolean;
  onPickCustom: (isCustomPicked: boolean) => void;
  onUpdate: (patch: Partial<VouchGraphFilters>) => void;
}

/** "Connected": presets, and two month fields that fold open under Custom. */
function FilterDateRow({
  labelId,
  filters,
  isCustomPicked,
  isPhone,
  isTouchSized,
  onPickCustom,
  onUpdate,
}: FilterDateRowProps) {
  const { t } = useTranslation();
  const fromLabelId = useId();
  const toLabelId = useId();
  const activePreset = isCustomPicked ? "custom" : datePresetFor(filters);
  const presetOptions: ChipOption[] = DATE_PRESETS.map((preset) => ({
    value: preset,
    label: t(DATE_PRESET_LABEL_KEYS[preset]),
  }));
  const pickPreset = (value: string) => {
    const preset = value as DatePreset;
    if (preset === "custom") {
      onPickCustom(true);
      return;
    }
    onPickCustom(false);
    onUpdate({
      connectedFrom:
        preset === "any" ? null : presetStartMonth(DATE_PRESET_MONTHS[preset]),
      connectedTo: null,
    });
  };
  const fieldSize = isPhone ? "md" : "sm";

  return (
    <div className={styles.filterRow}>
      <span id={labelId} className={styles.filterLegend}>
        {t("admin:vouchGraph.filters.dateRange")}
      </span>
      <FilterChips
        options={presetOptions}
        value={activePreset}
        onChange={pickPreset}
        labelledBy={labelId}
        size={isTouchSized ? "touch" : "default"}
        className={styles.filterChips}
      />
      <Collapse
        isOpen={activePreset === "custom"}
        className={styles.filterDatesSlot}
      >
        <div className={styles.filterDates}>
          <div className={styles.filterDate}>
            <span id={fromLabelId} className={styles.filterDateLabel}>
              {t("admin:vouchGraph.filters.dateFrom")}
            </span>
            <DatePicker
              mode="month"
              size={fieldSize}
              labelledBy={`${labelId} ${fromLabelId}`}
              value={filters.connectedFrom}
              max={filters.connectedTo ?? undefined}
              clearable
              onChange={(value) =>
                onUpdate({ connectedFrom: toMonthOrNull(value) })
              }
            />
          </div>
          <div className={styles.filterDate}>
            <span id={toLabelId} className={styles.filterDateLabel}>
              {t("admin:vouchGraph.filters.dateTo")}
            </span>
            <DatePicker
              mode="month"
              size={fieldSize}
              labelledBy={`${labelId} ${toLabelId}`}
              value={filters.connectedTo}
              min={filters.connectedFrom ?? undefined}
              clearable
              onChange={(value) =>
                onUpdate({ connectedTo: toMonthOrNull(value) })
              }
            />
          </div>
        </div>
      </Collapse>
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

/** B7: the filter panel, one labelled row per field. The caller places it
 *  with `VouchGraphFiltersSlot` (a drop-down over the stage, or a bottom
 *  sheet on phones); every field writes straight to the view state. A chip
 *  row with nothing picked lets everyone through. */
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
  const isPhone = useMediaQuery(PHONE_QUERY);
  const isTouchSized = useMediaQuery(TOUCH_QUERY);
  const titleId = useId();
  const standingLabelId = useId();
  const edgeKindLabelId = useId();
  const sceneLabelId = useId();
  const dateLabelId = useId();
  // Custom stays picked while its months are still empty, so the fields
  // stay open for the admin to fill.
  const [isCustomPicked, setIsCustomPicked] = useState(false);
  const update = (patch: Partial<VouchGraphFilters>) =>
    onFiltersChange({ ...filters, ...patch });
  const isClearInactive = activeFilterCount === 0;
  const chipSize = isTouchSized ? "touch" : "default";
  const sectionRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape inside the panel folds the panel away. A native listener on the
  // panel stops the key before the modal's `document` listener sees it.
  // While the scene list is open, its own Escape closes the list first.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing) return;
      if (section.querySelector('[aria-expanded="true"]')) return;
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    };
    section.addEventListener("keydown", closeOnEscape);
    return () => section.removeEventListener("keydown", closeOnEscape);
  }, []);

  const standingOptions = standingChipOptions(t);
  const edgeKindOptions = edgeKindChipOptions(t);
  const sceneOptions = [
    { value: "", label: t("admin:vouchGraph.filters.sceneAll") },
    ...graph.scenes.map((scene) => ({ value: scene.id, label: scene.label })),
  ];

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
        <div className={styles.filterRow}>
          <span id={standingLabelId} className={styles.filterLegend}>
            {t("admin:vouchGraph.filters.standing")}
          </span>
          <ChipSelect
            options={standingOptions}
            selected={new Set(filters.standings)}
            onToggle={(value) =>
              update({
                standings: toggleListValue(
                  filters.standings,
                  STANDINGS,
                  value as Standing,
                ),
              })
            }
            labelledBy={standingLabelId}
            size={chipSize}
            className={styles.filterChips}
          />
        </div>
        <div className={styles.filterRow}>
          <span id={edgeKindLabelId} className={styles.filterLegend}>
            {t("admin:vouchGraph.filters.edgeKinds")}
          </span>
          <ChipSelect
            options={edgeKindOptions}
            selected={new Set(filters.edgeKinds)}
            onToggle={(value) =>
              update({
                edgeKinds: toggleListValue(
                  filters.edgeKinds,
                  EDGE_KINDS,
                  value as VouchEdgeFilterKind,
                ),
              })
            }
            labelledBy={edgeKindLabelId}
            size={chipSize}
            className={styles.filterChips}
          />
        </div>
        <div className={cx(styles.filterRow, styles.filterRowCentered)}>
          <span id={sceneLabelId} className={styles.filterLegend}>
            {t("admin:vouchGraph.filters.scene")}
          </span>
          <Select
            options={sceneOptions}
            value={filters.sceneId ?? ""}
            onChange={(value) => update({ sceneId: value || null })}
            labelledBy={sceneLabelId}
            label={t("admin:vouchGraph.filters.scene")}
            size={isPhone ? "md" : "sm"}
            className={styles.filterScene}
          />
        </div>
        <FilterDateRow
          labelId={dateLabelId}
          filters={filters}
          isCustomPicked={isCustomPicked}
          isPhone={isPhone}
          isTouchSized={isTouchSized}
          onPickCustom={setIsCustomPicked}
          onUpdate={update}
        />
        <div className={styles.filterRow}>
          <div className={styles.filterSwitches}>
            <FilterSwitch
              label={t("admin:vouchGraph.filters.verifiedOnly")}
              isChecked={filters.isVerifiedOnly}
              onChange={(isVerifiedOnly) => update({ isVerifiedOnly })}
            />
            <FilterSwitch
              label={t("admin:vouchGraph.filters.hideWithdrawn")}
              isChecked={filters.shouldHideWithdrawn}
              onChange={(shouldHideWithdrawn) =>
                update({ shouldHideWithdrawn })
              }
            />
          </div>
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
            if (isClearInactive) return;
            setIsCustomPicked(false);
            onClearFilters();
          }}
        >
          {t("admin:vouchGraph.filters.clearCta")}
        </Button>
      </div>
    </section>
  );
}
