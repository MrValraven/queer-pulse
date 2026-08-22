import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button, type ButtonSize } from "./Button";

type IconButtonBase = {
  /**
   * The icon. A single react-icons element (`<FiX aria-hidden />`), never a
   * Unicode glyph: glyphs render differently per font and, when they are a
   * control's only content, screen readers read them out ("multiplication
   * sign") on top of the label below.
   */
  children: ReactNode;
  /**
   * Required. An icon-only control has no text to announce, so without this it
   * reaches a screen reader as an unnamed button. Make it the ACTION, not the
   * picture: "Close", "Remove Ana from the list" — never "X icon".
   */
  "aria-label": string;
  /** `md` (default) is the 44px tap target; `sm` only shrinks the glyph. */
  size?: ButtonSize;
  /** `dark` for a plum/dark ground, where the ink tokens disappear. */
  tone?: "light" | "dark";
  className?: string;
};

type IconButtonProps = IconButtonBase &
  Omit<ComponentPropsWithRef<"button">, keyof IconButtonBase>;

/**
 * The one icon-only button in the app: a square, quiet control carrying a
 * single icon, with a mandatory accessible name.
 *
 * It exists because the alternative kept being hand-rolled — the review found
 * 31 close/remove/kebab controls styled at 30x30 or 34x34 (under the 44px WCAG
 * 2.5.5 tap-target floor) and a run of `×` glyph buttons with no label at all.
 * This wraps `<Button variant="icon">`, so it inherits the shared focus ring,
 * disabled treatment, transitions and tap-target floor for free.
 *
 * ```tsx
 * <IconButton aria-label={t("common:close")} onClick={onClose}>
 *   <FiX aria-hidden />
 * </IconButton>
 * ```
 */
export function IconButton({
  children,
  size = "md",
  tone = "light",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      variant={tone === "dark" ? "icon-dark" : "icon"}
      size={size}
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
}
