import type { ReactNode } from "react";
import { FiShare } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import type { ShareMenuTriggerRenderProps } from "../../messages/share/shareMenu.types";

/** The Studio hero's labelled Share trigger: a quiet Button that the hero's
 *  action row restyles (`.heroActions button`, studio.module.css), the share
 *  icon before the label as Shuffle carries its own. */
export function studioShareTrigger(
  label: string,
): (trigger: ShareMenuTriggerRenderProps) => ReactNode {
  return ({ triggerProps }) => (
    <Button variant="quiet" {...triggerProps}>
      <FiShare aria-hidden /> {label}
    </Button>
  );
}
