import { useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { SearchInput, Tooltip } from "../ui";
import { AdminNavLink } from "./AdminNavGroup";
import { countAdminNavMatches, pendingCount } from "./adminNavMatching";
import type {
  AdminNavBadgeCounts,
  AdminNavSearchGroup,
} from "./adminNavMatching";
import styles from "./AdminShell.module.css";

/**
 * Finds a console destination by name instead of by remembering which of the
 * rail's sections it was filed under. Sits above the nav, so it is the first
 * thing under the identity chip on every admin screen.
 */
export function AdminNavSearch({
  value,
  onChange,
  onSubmit,
  isCollapsed = false,
  onExpand,
}: {
  value: string;
  onChange: (value: string) => void;
  /** Enter on the field: open the first match. */
  onSubmit: () => void;
  /** Icon-only rail: a field cannot fit, so the control becomes a button. */
  isCollapsed?: boolean;
  /** Widen the rail so the field has room. Absent on mobile, where the drawer
   *  is always full width and there is nothing to widen. */
  onExpand?: () => void;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  // Held while the collapsed rail is still widening: the field does not exist
  // to focus yet, so the intent waits for the wide rail to render it. A ref
  // rather than state, because wanting the focus is not something to re-render
  // for; the widening itself is what runs the effect.
  const isFocusPending = useRef(false);
  const label = t("shared:adminSidebar.search.label");

  useEffect(() => {
    if (isCollapsed || !isFocusPending.current) return;
    isFocusPending.current = false;
    inputRef.current?.focus();
  }, [isCollapsed]);

  if (isCollapsed) {
    return (
      <Tooltip label={label} placement="right">
        <button
          type="button"
          className={styles.navSearchBtn}
          aria-label={label}
          onClick={() => {
            isFocusPending.current = true;
            onExpand?.();
          }}
        >
          <FiSearch aria-hidden />
        </button>
      </Tooltip>
    );
  }

  return (
    <SearchInput
      className={styles.navSearch}
      value={value}
      onChange={onChange}
      inputRef={inputRef}
      placeholder={t("shared:adminSidebar.search.placeholder")}
      ariaLabel={label}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onSubmit();
        }
        // Escape clears the query rather than the browser's own search-field
        // reset, so the rail returns to its sections in one press.
        if (event.key === "Escape" && value) {
          event.preventDefault();
          onChange("");
        }
      }}
    />
  );
}

/**
 * The rail's body while a query is running: every match as a flat list under
 * its section's name, so a hit can never sit hidden inside a shut group. The
 * headings are plain text here, since collapsing a result set would put back
 * exactly what the search was for.
 */
export function AdminNavSearchResults({
  groups,
  badgeCounts,
  onNavigate,
}: {
  groups: AdminNavSearchGroup[];
  badgeCounts: AdminNavBadgeCounts;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const count = countAdminNavMatches(groups);

  if (count === 0) {
    return (
      <p className={styles.navSearchEmpty} role="status">
        {t("shared:adminSidebar.search.empty")}
      </p>
    );
  }

  return (
    <div className={styles.navSearchResults}>
      {/* The list itself is never a live region: re-reading every link on each
          keystroke would bury the one thing worth hearing, which is how many
          are left. */}
      <p className="visuallyHidden" role="status">
        {t("shared:adminSidebar.search.results", { count })}
      </p>
      {groups.map((group) => (
        <div key={group.id} className={styles.navSearchGroup}>
          {group.label && <p className={styles.navSearchHead}>{group.label}</p>}
          {group.items.map((item) => (
            <AdminNavLink
              key={item.to}
              item={item}
              count={pendingCount(item, badgeCounts)}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
