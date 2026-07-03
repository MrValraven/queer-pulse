import type { ReactNode } from "react";
import type { RadioOption } from "./cinemaSubmit.data";
import styles from "./CinemaSubmitPage.module.css";

/** Numbered form-block header (circle + serif title + sub). */
export function FbHead({
  num,
  title,
  em,
  titlePost,
  sub,
}: {
  num: number;
  title: string;
  em?: string;
  titlePost?: string;
  sub: string;
}) {
  return (
    <div className={styles.fbHead}>
      <div className={styles.fbNum}>{num}</div>
      <div>
        <div className={styles.fbTitle}>
          {title} {em && <em>{em}</em>}
          {titlePost}
        </div>
        <div className={styles.fbSub}>{sub}</div>
      </div>
    </div>
  );
}

/** Single-select radio grid of card options. */
export function RadioGrid({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className={styles.radioGrid} role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={[styles.rOpt, on && styles.rOptOn]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles.rDot} aria-hidden />
            <span className={styles.rText}>
              {o.label}
              {o.sub && <span className={styles.rSub}>{o.sub}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** A field label with the design's italic-serif "why" helper underneath. */
export function FieldLabel({
  children,
  opt,
  why,
}: {
  children: ReactNode;
  opt?: string;
  why?: string;
}) {
  return (
    <>
      {children}
      {opt && (
        <span style={{ fontWeight: 400, color: "var(--ink-40)" }}> {opt}</span>
      )}
      {why && (
        <span
          style={{
            display: "block",
            fontSize: "11.5px",
            color: "var(--ink-40)",
            fontWeight: 400,
            fontFamily: "var(--serif)",
            fontStyle: "italic",
            lineHeight: 1.45,
            marginTop: 3,
          }}
        >
          {why}
        </span>
      )}
    </>
  );
}
