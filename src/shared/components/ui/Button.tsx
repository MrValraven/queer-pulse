import type { ComponentPropsWithRef, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import styles from "./Button.module.css";

export type ButtonVariant =
  "primary" | "ghost" | "ghost-dark" | "jade" | "danger";
export type ButtonSize = "md" | "lg";

const variantClass: Record<ButtonVariant, string | undefined> = {
  primary: styles.primary,
  ghost: styles.ghost,
  "ghost-dark": styles.ghostDark,
  jade: styles.jade,
  danger: styles.danger,
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithRef<"button">, keyof BaseProps> & {
    to?: undefined;
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<LinkProps, keyof BaseProps | "to"> & {
    to: LinkProps["to"];
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<ComponentPropsWithRef<"a">, keyof BaseProps> & {
    href: string;
    to?: undefined;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;

function buildClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  extra?: string,
): string {
  return [
    styles.button,
    variantClass[variant],
    size === "lg" && styles.lg,
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Pill button. Renders a router `<Link>` when `to` is given, a plain `<a>` when
 * `href` is given, otherwise a `<button>`.
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = buildClassName(variant, size, className);

  if ("to" in rest && rest.to !== undefined) {
    return (
      <Link className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a className={cls} {...rest}>
        {children}
      </a>
    );
  }

  // Default to type="button" so a <Button> inside a <form> doesn't silently
  // submit it; callers opt into submit via type="submit" (rest wins).
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
