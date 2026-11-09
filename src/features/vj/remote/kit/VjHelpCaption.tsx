/**
 * The remote's quiet description lines. `VjHelpCaption` sits under a dock or
 * top-row control and folds in while help captions are on (the "?" toggle,
 * `useVjHelpCaptions`); `VjOptionDescription` sits under a picker option or
 * a sheet title and always shows. Both draw the same small muted caption,
 * wrapped to at most two lines, so pickers, sheets and the dock read alike.
 * Give the caption an `id` and point the control's aria-describedby at it
 * while it shows. A component that draws its own caption element takes the
 * look from `.helpCaption` in VjRemoteKit.module.css (CSS `composes`).
 */
import type { JSX } from "react";
import { Collapse } from "../../../../shared/components/ui/Collapse";
import { useVjHelpCaptions } from "../hooks/useVjHelpCaptions";
import styles from "./VjRemoteKit.module.css";

export interface VjHelpCaptionProps {
  text: string;
  id?: string;
  /** Added to the caption line itself. */
  className?: string;
  /** Shows the caption whether or not help captions are on. */
  isAlwaysVisible?: boolean;
}

function captionClassNameOf(className: string | undefined): string {
  return [styles.helpCaption, className]
    .filter((name) => name !== undefined && name !== "")
    .join(" ");
}

/** A control's caption: folds in and out with the help toggle. */
export function VjHelpCaption({
  text,
  id,
  className,
  isAlwaysVisible = false,
}: VjHelpCaptionProps): JSX.Element {
  const { isOn } = useVjHelpCaptions();
  return (
    <Collapse isOpen={isOn || isAlwaysVisible}>
      <p
        id={id}
        className={captionClassNameOf(className)}
        data-vj-help-caption=""
      >
        {text}
      </p>
    </Collapse>
  );
}

export interface VjOptionDescriptionProps {
  text: string;
  id?: string;
}

/** An option's or a sheet's one-line description: always shown. */
export function VjOptionDescription({
  text,
  id,
}: VjOptionDescriptionProps): JSX.Element {
  return (
    <p id={id} className={styles.helpCaption} data-vj-option-description="">
      {text}
    </p>
  );
}
