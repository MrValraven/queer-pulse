import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
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
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    to?: undefined;
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<LinkProps, keyof BaseProps | "to"> & {
    to: LinkProps["to"];
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps> & {
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
      <Link className={cls} {...(rest as LinkProps)}>
        {children}
      </Link>
    );
  }

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button
      className={cls}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
