import {
  Button,
  SearchInput,
  SegmentedControl,
  Select,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskToolbar.module.css";

/** Desk format the pipeline is filtered to. */
export type DeskFormatFilter = "all" | "article" | "deck";
/** Desk sort key applied to the visible pieces. */
export type DeskSortKey = "due" | "stage" | "sec";

/**
 * Desk toolbar: search, format switch, "My queue" toggle, sort, and a
 * shortcuts chip.
 */
export function DeskToolbar({
  q,
  onQ,
  fmt,
  onFmt,
  mine,
  onMine,
  sort,
  onSort,
  onShortcuts,
}: {
  q: string;
  onQ: (value: string) => void;
  fmt: DeskFormatFilter;
  onFmt: (value: DeskFormatFilter) => void;
  mine: boolean;
  onMine: (value: boolean) => void;
  sort: DeskSortKey;
  onSort: (value: DeskSortKey) => void;
  onShortcuts: () => void;
}) {
  const { t } = useTranslation();

  const formatOptions = [
    { value: "all", label: t("magazine:desk.toolbar.format.everything") },
    { value: "article", label: t("magazine:desk.toolbar.format.articles") },
    { value: "deck", label: t("magazine:desk.toolbar.format.decks") },
  ];

  return (
    <div className={styles.toolbar}>
      <SearchInput
        value={q}
        onChange={onQ}
        placeholder={t("magazine:desk.toolbar.searchPlaceholder")}
        ariaLabel={t("magazine:desk.toolbar.searchAria")}
        className={styles.search}
      />
      <SegmentedControl
        label={t("magazine:desk.toolbar.formatAria")}
        value={fmt}
        onChange={(value) => onFmt(value as DeskFormatFilter)}
        options={formatOptions}
      />
      <Button
        variant={mine ? "plum" : "ghost"}
        size="sm"
        type="button"
        aria-pressed={mine}
        onClick={() => onMine(!mine)}
      >
        {t("magazine:desk.toolbar.myQueue")}
      </Button>
      <Select
        size="sm"
        value={sort}
        onChange={(value) => onSort(value as DeskSortKey)}
        label={t("magazine:desk.toolbar.sortAria")}
        options={[
          { value: "due", label: t("magazine:desk.toolbar.sort.due") },
          { value: "stage", label: t("magazine:desk.toolbar.sort.stage") },
          { value: "sec", label: t("magazine:desk.toolbar.sort.section") },
        ]}
      />
      <Button variant="ghost" size="sm" type="button" onClick={onShortcuts}>
        {t("magazine:desk.toolbar.shortcuts")}{" "}
        <span className={styles.kbd} aria-hidden>
          ?
        </span>
      </Button>
    </div>
  );
}
