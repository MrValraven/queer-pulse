import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import styles from "./SubpageIndex.module.css";

export interface SubpageItem {
  label: string;
  to: string;
  blurb: string;
}

/**
 * A hub → subpages index. Renders a card grid for multiple children, or a
 * single full-width callout when there is only one child.
 */
export function SubpageIndex({
  eyebrow,
  title,
  items,
}: {
  eyebrow?: string;
  title: string;
  items: SubpageItem[];
}) {
  return (
    <section className={styles.section}>
      <div className="wrap">
        {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
        <h2 className={styles.title}>{title}</h2>
        <ul
          className={styles.grid}
          data-single={items.length === 1 || undefined}
        >
          {items.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={styles.card}>
                <span className={styles.label}>
                  {item.label}
                  <FiArrowRight aria-hidden />
                </span>
                <span className={styles.blurb}>{item.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
