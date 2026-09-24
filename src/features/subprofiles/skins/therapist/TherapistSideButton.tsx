import type { ReactNode } from "react";
import { Button } from "../../../../shared/components/ui";
import { TherapistEditLink } from "./TherapistEditLink";
import type { TherapistEditTarget } from "./therapistEditLinks.data";
import styles from "./TherapistSidebar.module.css";

interface SideButtonProps {
  /** false renders a disabled look-alike with no link. */
  isLive: boolean;
  href: string;
  isExternal?: boolean;
  icon: ReactNode;
  label: string;
  ariaLabel?: string;
  onClick?: () => void;
  /** Where the owner edits this button's value: adds a pencil link beside
   *  it, shown to the owner only (see `TherapistEditLink`). */
  editTarget?: TherapistEditTarget;
  /** The pencil's accessible name, when the target's default is too broad. */
  editAriaLabel?: string;
}

/** The label with a line-break opportunity after an email's "@", so an
 *  address that must wrap splits between the name and the domain. */
function breakableLabel(label: string): ReactNode {
  const atIndex = label.indexOf("@");
  if (atIndex < 0) return label;
  return (
    <>
      {label.slice(0, atIndex + 1)}
      <wbr />
      {label.slice(atIndex + 1)}
    </>
  );
}

function SideButtonControl({
  isLive,
  href,
  isExternal = false,
  icon,
  label,
  ariaLabel,
  onClick,
}: Omit<SideButtonProps, "editTarget" | "editAriaLabel">) {
  const content = (
    <>
      {icon}
      <span className={styles.buttonText}>{breakableLabel(label)}</span>
    </>
  );
  if (!isLive) {
    return (
      <Button variant="ghost" className={styles.fullButton} disabled>
        {content}
      </Button>
    );
  }
  return (
    <Button
      variant="ghost"
      className={styles.fullButton}
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {content}
    </Button>
  );
}

/** A full-width ghost link button, or its inert look-alike, with the
 *  owner's pencil beside it when `editTarget` is given. */
export function SideButton({
  editTarget,
  editAriaLabel,
  ...buttonProps
}: SideButtonProps) {
  if (!editTarget) return <SideButtonControl {...buttonProps} />;
  return (
    <div className={styles.editableRow}>
      <SideButtonControl {...buttonProps} />
      <TherapistEditLink
        target={editTarget}
        ariaLabel={editAriaLabel}
        isCompact
        className={styles.rowEdit}
      />
    </div>
  );
}
