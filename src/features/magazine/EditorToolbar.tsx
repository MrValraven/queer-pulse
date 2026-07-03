import { FiSearch, FiX } from "react-icons/fi";
import { SECTIONS, EDITORS, type SortKey } from "./editorDashboard.data";
import type { FilterKey } from "./useEditorDashboard";
import styles from "./EditorDashboardPage.module.css";

const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

const STATUS_OPTS: [string, string][] = [
  ["all", "All statuses"],
  ["late", "Late"],
  ["blocked", "In an editor’s court"],
  ["ready", "Ready"],
];

const SORT_OPTS: [SortKey, string][] = [
  ["due", "Sort · deadline"],
  ["status", "Sort · stage"],
  ["editor", "Sort · editor"],
  ["section", "Sort · section"],
  ["words", "Sort · length"],
];

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
          placeholder="Search pieces, pitches, contributors…"
          onChange={(e) => onQuery(e.target.value)}
          aria-label="Search"
        />
        {q && (
          <button
            type="button"
            className={styles.searchClear}
            onClick={() => onQuery("")}
            aria-label="Clear search"
          >
            <FiX size={14} aria-hidden />
          </button>
        )}
      </div>

      <select
        className={styles.tbSel}
        value={fEditor}
        onChange={(e) => onFilter("fEditor", e.target.value)}
        aria-label="Filter by editor"
      >
        <option value="all">All editors</option>
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
        aria-label="Filter by status"
      >
        {STATUS_OPTS.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>

      <select
        className={styles.tbSel}
        value={fSection}
        onChange={(e) => onFilter("fSection", e.target.value)}
        aria-label="Filter by section"
      >
        <option value="all">All sections</option>
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
        aria-label="Sort pieces"
      >
        {SORT_OPTS.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>

      <button
        type="button"
        className={cx(styles.tbToggle, myQueue && styles.on)}
        onClick={onToggleMyQueue}
        aria-pressed={myQueue}
      >
        {myQueue ? "My queue · on" : "My queue"}
      </button>

      <button type="button" className={styles.kbdHint} onClick={onShortcuts}>
        Press <kbd>?</kbd> for shortcuts
      </button>
    </div>
  );
}
