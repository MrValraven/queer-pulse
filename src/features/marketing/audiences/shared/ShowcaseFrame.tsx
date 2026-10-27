import type { ReactNode } from "react";
import { FiTag } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./ShowcaseFrame.module.css";

export type ShowcaseDevice = "bare" | "browser" | "phone";

const MAX_HEIGHT_CLASS: Record<"none" | "short" | "tall", string | undefined> =
  {
    none: undefined,
    short: styles.short,
    tall: styles.tall,
  };

/**
 * A labelled, inert frame around real product components rendered with
 * sample content. Everything inside the stage is `inert`: nothing in it can
 * be clicked, focused or reached by a screen reader, so the frame's label is
 * what assistive tech hears. The "Sample" caption sits outside the stage.
 * `device` draws a browser bar or a phone body around the stage; both are
 * decorative.
 */
export function ShowcaseFrame({
  label,
  device = "bare",
  maxHeight = "none",
  className,
  children,
}: {
  label: string;
  device?: ShowcaseDevice;
  maxHeight?: "none" | "short" | "tall";
  className?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <figure
      aria-label={label}
      data-device={device}
      className={[styles.frame, className].filter(Boolean).join(" ")}
    >
      {device === "browser" && (
        <div className={styles.browserBar} aria-hidden>
          <span className={styles.browserDot} />
          <span className={styles.browserDot} />
          <span className={styles.browserDot} />
          <span className={styles.browserAddress} />
        </div>
      )}
      {device === "phone" && <div className={styles.phoneNotch} aria-hidden />}
      <div
        className={[styles.stage, MAX_HEIGHT_CLASS[maxHeight]]
          .filter(Boolean)
          .join(" ")}
        inert
      >
        {children}
      </div>
      <figcaption className={styles.sample}>
        <FiTag aria-hidden />
        {t("audiences:sample.label")}
      </figcaption>
    </figure>
  );
}
