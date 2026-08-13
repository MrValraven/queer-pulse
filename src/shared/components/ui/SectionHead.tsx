import type { HTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import styles from "./SectionHead.module.css";

interface SectionHeadBaseProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** Title content — pass `<>…<em>accent</em></>` for the accent emphasis. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Right-aligned action (e.g. a ghost button). */
  action?: ReactNode;
  /** Use on plum/dark sections. */
  dark?: boolean;
}

/**
 * The "see-all" link is paired: a `linkLabel` may only be given alongside a
 * real `linkTo`, so a label can never render a dead `to="#"` link. Callers
 * either supply both or neither.
 */
type SectionHeadLinkProps =
  | { linkLabel: string; linkTo: string }
  | { linkLabel?: undefined; linkTo?: undefined };

type SectionHeadProps = SectionHeadBaseProps & SectionHeadLinkProps;

export function SectionHead({
  title,
  subtitle,
  linkLabel,
  linkTo,
  action,
  dark = false,
  className,
  ...rest
}: SectionHeadProps) {
  const cls = [styles.head, dark && styles.dark, className]
    .filter(Boolean)
    .join(" ");
  const hasAside = linkLabel || action;
  return (
    <div className={cls} {...rest}>
      <div className={styles.titleBlock}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {hasAside && (
        <div className={styles.aside}>
          {linkLabel && linkTo && (
            <Link to={linkTo} className={styles.link}>
              {linkLabel}{" "}
              <FiArrowRight aria-hidden />
            </Link>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
