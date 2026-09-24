import type { ReactNode } from "react";
import { Button } from "../../../../shared/components/ui";

interface TherapistInertButtonProps {
  variant?: "primary" | "ghost";
  icon: ReactNode;
  label: string;
  className?: string;
}

/** Disabled look-alike of a live control, for the editor preview, the
 *  owner's own view and the owner's visitor preview. */
export function TherapistInertButton({
  variant = "ghost",
  icon,
  label,
  className,
}: TherapistInertButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size="md"
      className={className}
      disabled
    >
      {icon} {label}
    </Button>
  );
}
