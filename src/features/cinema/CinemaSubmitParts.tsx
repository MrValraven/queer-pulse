import type { ReactNode } from "react";
import { RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RadioOption } from "./cinemaSubmit.data";
import styles from "./CinemaSubmitPage.module.css";

/** Numbered form-block header (circle + serif title + sub). `heading` is
 * built by the caller — via <Translation> when it carries a coral <em> run,
 * or a plain `t()` string otherwise — rather than assembled here from
 * separate title/em parts: word order (and where the emphasis lands)
 * differs in pt-PT, so the whole heading must resolve as one catalog
 * string, never be concatenated from fragments (see the sweep brief §5.8). */
export function FbHead({
  num,
  heading,
  sub,
}: {
  num: number;
  heading: ReactNode;
  sub: string;
}) {
  return (
    <div className={styles.fbHead}>
      <div className={styles.fbNum}>{num}</div>
      <div>
        <div className={styles.fbTitle}>{heading}</div>
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
  const { t } = useTranslation();
  return (
    <RadioCardGroup
      className={styles.radioGrid}
      optionClassName={styles.rOpt}
      checkedClassName={styles.rOptOn}
      ariaLabel={ariaLabel}
      value={value}
      onChange={onChange}
      options={options.map((option) => ({
        id: option.value,
        render: (
          <>
            <span className={styles.rDot} aria-hidden />
            <span className={styles.rText}>
              {t(option.labelKey)}
              {option.subKey && (
                <span className={styles.rSub}>{t(option.subKey)}</span>
              )}
            </span>
          </>
        ),
      }))}
    />
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
