import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useTherapistEditHref } from "./TherapistEditContext";
import {
  therapistEditAriaKey,
  type TherapistEditTarget,
} from "./therapistEditLinks.data";
import styles from "./TherapistEditLink.module.css";

export type { TherapistEditTarget } from "./therapistEditLinks.data";

interface TherapistEditLinkProps {
  target: TherapistEditTarget;
  /** Visible text; "Edit" when absent. */
  label?: string;
  /** Accessible name. Defaults to one naming what is edited ("Edit
   *  quote") when `label` is absent, and to `label` itself otherwise. */
  ariaLabel?: string;
  /** Shows the pencil alone (for tight spots such as a fact label); the
   *  accessible name still says what is edited. */
  isCompact?: boolean;
  className?: string;
}

/**
 * The owner's small "Edit" link beside a value on the therapist page. It
 * opens the persona editor on the pane, chapter and field where that value
 * is edited. Renders nothing unless the owner is viewing (see
 * `TherapistEditProvider`), so public, visitor and preview never show it.
 */
export function TherapistEditLink({
  target,
  label,
  ariaLabel,
  isCompact = false,
  className,
}: TherapistEditLinkProps) {
  const { t } = useTranslation();
  const href = useTherapistEditHref(target);
  if (!href) return null;
  const text = label ?? t("subprofiles:therapist.edit.link");
  // A visible label names itself; "Edit" alone, or the bare pencil, needs
  // a name that says what is edited.
  const hasOwnName = label !== undefined && !isCompact;
  const accessibleName =
    ariaLabel ?? (hasOwnName ? undefined : t(therapistEditAriaKey(target)));
  const linkClassName = [styles.link, isCompact && styles.compact, className]
    .filter(Boolean)
    .join(" ");
  return (
    <Link to={href} className={linkClassName} aria-label={accessibleName}>
      <FiEdit2 aria-hidden className={styles.icon} />
      {!isCompact && <span>{text}</span>}
    </Link>
  );
}
