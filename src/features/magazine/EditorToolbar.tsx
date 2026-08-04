import { FiSearch, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  SECTIONS,
  EDITORS,
  SORT_LABEL_KEY,
  type SortKey,
} from "./editorDashboard.data";
import type { FilterKey } from "./useEditorDashboard";
import { cx } from "../../shared/lib/cx";
import styles from "./EditorDashboardPage.module.css";

const STATUS_OPTS: [string, string][] = [
  ["all", "magazine:editor.toolbar.status.all"],
  ["late", "magazine:editor.toolbar.status.late"],
  ["blocked", "magazine:editor.toolbar.status.blocked"],
  ["ready", "magazine:editor.toolbar.status.ready"],
];

const SORT_OPTS: SortKey[] = ["due", "status", "editor", "section", "words"];

/** Search + filters + sort + My-queue toggle + shortcuts hint. */
export function EditorToolbar({
  q,
  fEditor,
  fStatus,
  fSection,
  sort,
  myQueue,
  onQuery,
  onFilter,
  onToggleMyQueue,
  onShortcuts,
}: {
  q: string;
  fEditor: string;
  fStatus: string;
  fSection: string;
  sort: SortKey;
  myQueue: boolean;
  onQuery: (q: string) => void;
  onFilter: (key: FilterKey, value: string) => void;
  onToggleMyQueue: () => void;
  onShortcuts: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchBox}>
        <span className={styles.searchIc}>
          <FiSearch size={15} aria-hidden />
        </span>
        <input
          id="editor-search"
          type="text"
          value={q}
          placeholder={t("magazine:editor.toolbar.searchPlaceholder")}
          onChange={(e) => onQuery(e.target.value)}
          aria-label={t("magazine:editor.toolbar.searchAria")}
        />
        {q && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => onQuery("")}
            aria-label={t("magazine:editor.toolbar.clearSearchAria")}
          >
            <FiX size={14} aria-hidden />
          </button>
        )}
      </div>

      <select
        className={styles.tbSel}
        value={fEditor}
        onChange={(e) => onFilter("fEditor", e.target.value)}
        aria-label={t("magazine:editor.toolbar.filterEditorAria")}
      >
        <option value="all">{t("magazine:editor.toolbar.allEditors")}</option>
        {EDITORS.map((ed) => (
          <option key={ed} value={ed}>
            {ed}
          </option>
        ))}
      </select>

      <select
        className={styles.tbSel}
        value={fStatus}
        onChange={(e) => onFilter("fStatus", e.target.value)}
        aria-label={t("magazine:editor.toolbar.filterStatusAria")}
      >
        {STATUS_OPTS.map(([v, labelKey]) => (
          <option key={v} value={v}>
            {t(labelKey)}
          </option>
        ))}
      </select>

      <select
        className={styles.tbSel}
        value={fSection}
        onChange={(e) => onFilter("fSection", e.target.value)}
        aria-label={t("magazine:editor.toolbar.filterSectionAria")}
      >
        <option value="all">{t("magazine:editor.toolbar.allSections")}</option>
        {SECTIONS.map((s) => {
          const v = s.name.split(" ")[0];
          return (
            <option key={s.name} value={v}>
              {s.name}
            </option>
          );
        })}
      </select>

      <select
        className={styles.tbSel}
        value={sort}
        onChange={(e) => onFilter("sort", e.target.value)}
        aria-label={t("magazine:editor.toolbar.sortAria")}
      >
        {SORT_OPTS.map((key) => (
          <option key={key} value={key}>
            {t(SORT_LABEL_KEY[key])}
          </option>
        ))}
      </select>

      <button
        type="button"
        className={cx(styles.tbToggle, myQueue && styles.on)}
        onClick={onToggleMyQueue}
        aria-pressed={myQueue}
      >
        {myQueue
          ? t("magazine:editor.toolbar.myQueueOn")
          : t("magazine:editor.toolbar.myQueue")}
      </button>

      <button type="button" className={styles.kbdHint} onClick={onShortcuts}>
        <Translation
          i18nKey="magazine:editor.toolbar.shortcutsHint"
          components={{ kbd: <kbd /> }}
        />
      </button>
    </div>
  );
}
