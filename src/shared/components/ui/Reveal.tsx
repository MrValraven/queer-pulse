import {
  createElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import styles from "./Reveal.module.css";

interface RevealProps {
  as?: ElementType;
  /** Stagger delay in ms. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  /** Extra props are forwarded to the rendered element (e.g. `to` when `as={Link}`). */
  [key: string]: unknown;
}

/**
 * Fades + slides its children in when scrolled into view. Respects reduced
 * motion (renders visible immediately).
 */
export function Reveal({
  as = "div",
  delay = 0,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLElement>();
  const cls = [styles.reveal, isVisible && styles.visible, className]
    .filter(Boolean)
    .join(" ");

  return createElement(
    as,
    {
      ref,
      className: cls,
      style: { "--reveal-delay": `${delay}ms`, ...style } as CSSProperties,
      ...rest,
    },
    children,
  );
}
