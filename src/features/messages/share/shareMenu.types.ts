import type { ReactNode, Ref } from "react";
import type { TooltipProps } from "../../../shared/components/ui/Tooltip";
import type { ShareableKind } from "./shareToChat.helpers";

/**
 * What a `ShareMenu` passes on. Every item reads from this one object, so a
 * surface describes its thing once and gets every way to share it.
 */
export interface ShareContent {
  /** Same-origin path, e.g. `gatheringPath(slug)`. "Send in a message" sends
   *  it as is; every other item turns it absolute on the running origin. */
  path: string;
  /** The thing's name: the native share sheet's title and the picker's. */
  title: string;
  /** Shapes the "Send in a message" picker's copy. */
  kind: ShareableKind;
  /** The message lines above the link (title, when, where...), joined with
   *  "\n". The full message is this text, a line break, then the absolute
   *  link. Empty leaves the bare link. */
  text: string;
}

/** What `renderTrigger` receives to build its own trigger button. */
export interface ShareMenuTriggerRenderProps {
  isOpen: boolean;
  /** Spread every one of these onto the trigger `<button>`: the ref the menu
   *  is anchored to, the menu-button ARIA attributes and the toggle. */
  triggerProps: {
    ref: Ref<HTMLButtonElement>;
    "aria-haspopup": "menu";
    "aria-expanded": boolean;
    "aria-controls": string | undefined;
    onClick: () => void;
  };
}

export interface ShareMenuProps {
  content: ShareContent;
  /** The menu's accessible name. Defaults to "Share {title}". */
  menuLabel?: string;
  /** The default icon trigger's tooltip, and its accessible name unless
   *  `triggerAriaLabel` is set. Defaults to "Share". */
  triggerLabel?: string;
  /** A fuller accessible name for the default icon trigger, e.g. one that
   *  names the thing being shared. */
  triggerAriaLabel?: string;
  /** The default icon trigger's tone: `dark` on a plum ground. */
  tone?: "light" | "dark";
  /** Where the default icon trigger's tooltip opens. Defaults to `bottom`.
   *  Kept to the inline placements: a portalled tooltip escapes the rule that
   *  hides it while the menu is open, and would sit over the first item. */
  tooltipPlacement?: Extract<TooltipProps["placement"], "top" | "bottom">;
  /** Builds a custom trigger (a labelled text button, say) in the default
   *  icon's place. The tooltip hides while the menu is open either way. */
  renderTrigger?: (trigger: ShareMenuTriggerRenderProps) => ReactNode;
}

/** One entry in the menu. */
export interface ShareMenuOption {
  key: string;
  icon: ReactNode;
  label: string;
  /** Set for an item that leaves for another site in a new tab. */
  href?: string;
  onSelect?: () => void;
}
