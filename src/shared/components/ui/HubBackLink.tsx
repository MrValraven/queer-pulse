import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import styles from "./HubBackLink.module.css";

/**
 * Inline breadcrumb linking a subpage back up to its hub. Drop it in as the
 * first child of a page's already-padded hero/content container — it brings no
 * nav-clearance padding or width of its own, so it inherits the container's top
 * padding (which clears the fixed navbar) and its content width.
 *
 * `tone="dark"` for placement on a dark (plum) hero, where the muted text dims
 * toward cream instead of ink.
 */
export function HubBackLink({
  to,
  label,
  tone = "light",
}: {
  to: string;
  label: string;
  tone?: "light" | "dark";
}) {
  return (
    <div className={styles.bar}>
      <Link to={to} className={styles.link} data-tone={tone}>
        <FiArrowLeft aria-hidden />
        Back to {label}
      </Link>
    </div>
  );
}
