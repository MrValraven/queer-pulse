import type { ElementType, ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./Card.module.css";

interface CardOwnProps {
  as?: ElementType;
  padding?: "sm" | "md" | "lg";
  children: ReactNode;
}
type CardProps = CardOwnProps &
  Omit<ComponentPropsWithoutRef<"div">, keyof CardOwnProps>;

export function Card({
  as: Component = "div",
  padding = "md",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Component
      className={[styles.card, styles[`pad-${padding}`], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </Component>
  );
}
