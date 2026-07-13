import { FiSearch } from "react-icons/fi";
import type { CommunityCategory } from "./Communities.data";
import {
  LANG_LABEL,
  type CommunityFilterState,
  type SortKey,
} from "./useCommunityFilters";
import styles from "./Communities.module.css";

const CATS: Array<{
  key: CommunityCategory | "all";
  label: string;
  dot?: string;
}> = [
  { key: "all", label: "All" },
  { key: "social", label: "Social", dot: styles.dotSocial },
  { key: "arts", label: "Arts", dot: styles.dotArts },
  { key: "support", label: "Support", dot: styles.dotSupport },
  { key: "activism", label: "Activism", dot: styles.dotActivism },
];

interface ToolbarProps {
  state: CommunityFilterState;
  patch: (next: Partial<CommunityFilterState>) => void;
  langOptions: string[];
  hoodOptions: string[];
}

export function CommunitiesToolbar({
  state,
  patch,
  langOptions,
  hoodOptions,
}: ToolbarProps) {
  return (
    <div className={styles.tools}>
      <div className={styles.toolSearch}>
        <FiSearch aria-hidden />
        <input
          type="search"
          value={state.q}
          onChange={(e) => patch({ q: e.target.value })}
          placeholder="Search communities…"
          aria-label="Search communities"
        />
      </div>

      <div className={styles.toolChips}>
        {CATS.map((c) => (
          <button
            key={c.key}
            type="button"
            className={[styles.fchip, state.cat === c.key && styles.fchipOn]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={state.cat === c.key}
            onClick={() => patch({ cat: c.key })}
          >
            {c.dot && <span className={[styles.fdot, c.dot].join(" ")} />}
            {c.label}
          </button>
        ))}
      </div>

      <select
        className={styles.toolSelect}
        value={state.lang}
        onChange={(e) => patch({ lang: e.target.value })}
        aria-label="Filter by language"
      >
        <option value="all">All languages</option>
        {langOptions.map((l) => (
          <option key={l} value={l}>
            {LANG_LABEL[l] ?? l}
          </option>
        ))}
      </select>

      <select
        className={styles.toolSelect}
        value={state.hood}
        onChange={(e) => patch({ hood: e.target.value })}
        aria-label="Filter by neighbourhood"
      >
        <option value="all">All areas</option>
        {hoodOptions.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <button
        type="button"
        className={[styles.toolToggle, state.open && styles.toolToggleOn]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={state.open}
        onClick={() => patch({ open: !state.open })}
      >
        <span className={styles.tg} aria-hidden />
        Open to join
      </button>

      <span className={styles.toolSpacer} />

      <span className={styles.toolSort}>
        Sort
        <select
          className={styles.toolSelect}
          value={state.sort}
          onChange={(e) => patch({ sort: e.target.value as SortKey })}
          aria-label="Sort communities"
        >
          <option value="active">Most active</option>
          <option value="size">Largest</option>
          <option value="new">Newest</option>
          <option value="near">Nearest</option>
        </select>
      </span>
    </div>
  );
}
