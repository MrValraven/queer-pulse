import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiMoon, FiSun, FiBell } from "react-icons/fi";
import { useTheme } from "../../../app/providers/themeContext";
import { useToast } from "../feedback/useToast";
import { AdminSidebar } from "./AdminSidebar";
import styles from "./AdminShell.module.css";

export { ADMIN_NAV } from "./adminNav.data";

interface Crumb {
  label: string;
  to?: string;
}

export function AdminShell({
  children,
  title,
  breadcrumb = [],
  searchPlaceholder = "Search reports, members, communities…",
}: {
  children: ReactNode;
  title: ReactNode;
  breadcrumb?: Crumb[];
  searchPlaceholder?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.crumb}>
            {breadcrumb.map((c) => (
              <span key={c.to ?? c.label} className={styles.crumbCrumb}>
                {c.to ? (
                  <Link to={c.to} className={styles.crumbLink}>
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                <span aria-hidden> · </span>
              </span>
            ))}
            <span className={styles.crumbTitle}>{title}</span>
          </div>

          <label className={styles.search}>
            <FiSearch aria-hidden />
            <input
              type="text"
              placeholder={searchPlaceholder}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  showToast("Search is illustrative in this prototype", "info");
              }}
            />
          </label>

          <div className={styles.topRight}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={toggleTheme}
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <FiSun aria-hidden />
              ) : (
                <FiMoon aria-hidden />
              )}
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => showToast("No new alerts", "info")}
              title="Alerts"
              aria-label="Alerts"
            >
              <span className={styles.iconDot} aria-hidden />
              <FiBell aria-hidden />
            </button>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
