import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./HubBackLink.module.css";

/**
 * Inline breadcrumb linking a subpage back up to its hub. Drop it in as the
 * first child of a page's already-padded hero/content container — it brings no
 * nav-clearance padding or width of its own, so it inherits the container's top
 * padding (which clears the fixed navbar) and its content width.
 *
 * `tone="dark"` for placement on a dark (plum) hero, where the muted text dims
 * toward cream instead of ink.
 *
 * `text` replaces the composed "Back to {label}" line for a hub whose name
 * needs its own grammar in some language: PT contracts "a" + "o" into "ao",
 * so "Voltar ao Roteiro" has to be a whole catalog string.
 */
export function HubBackLink({
  to,
  label,
  text,
  tone = "light",
}: {
  to: string;
  label: string;
  text?: string;
  tone?: "light" | "dark";
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.bar}>
      <Link to={to} className={styles.link} data-tone={tone}>
        <FiArrowLeft aria-hidden />
        {text ?? t("shared:hubBackLink.backTo", { label })}
      </Link>
    </div>
  );
}
