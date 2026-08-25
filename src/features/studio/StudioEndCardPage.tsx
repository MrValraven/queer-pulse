import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  DOT_COORDS,
  HAIRLINE_PAIRS,
  SPINE_COUNT,
  JADE_BARS,
} from "./StudioEndCardPage.data";
import styles from "./StudioEndCardPage.module.css";

// Brand domain — never translated, not routed through the catalog.
const STUDIO_DOMAIN = "studio.queerpulse.com";

export function StudioEndCardPage() {
  const { t } = useTranslation();
  const frameRef = useRef<HTMLDivElement>(null);

  /* Scale the fixed 1920×1080 frame to fit the viewport, letterboxed. */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const fit = () => {
      const scale = Math.min(
        window.innerWidth / 1920,
        window.innerHeight / 1080,
      );
      frame.style.transform = `scale(${scale})`;
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const dots = useMemo(
    () =>
      DOT_COORDS.map(([x, y], i) => {
        const cls = [styles.cdot];
        if (i % 4 === 0) cls.push(styles.j);
        if (i % 3 === 0) cls.push(styles.sm);
        return { key: i, x, y, className: cls.join(" ") };
      }),
    [],
  );

  const hairlines = useMemo(
    () =>
      HAIRLINE_PAIRS.flatMap(([a, b], i) => {
        const from = DOT_COORDS[a];
        const to = DOT_COORDS[b];
        if (!from || !to) return [];
        return [{ key: i, x1: from[0], y1: from[1], x2: to[0], y2: to[1] }];
      }),
    [],
  );

  const bars = useMemo(
    () =>
      Array.from({ length: SPINE_COUNT }, (_, i) => ({
        key: i,
        height: 12 + Math.abs(Math.sin(i * 0.38) + Math.sin(i * 0.11)) * 46,
        jade: JADE_BARS.has(i),
      })),
    [],
  );

  return (
    <div className={styles.stage}>
      <div className={styles.frame} ref={frameRef}>
        <svg
          className={styles.chair}
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          aria-hidden
        >
          {hairlines.map((h) => (
            <line key={h.key} x1={h.x1} y1={h.y1} x2={h.x2} y2={h.y2} />
          ))}
        </svg>

        <div className={styles.constellation} aria-hidden>
          {dots.map((d) => (
            <span
              key={d.key}
              className={d.className}
              style={{ left: `${d.x}px`, top: `${d.y}px` }}
            />
          ))}
        </div>

        <div className={styles.spine} aria-hidden>
          {bars.map((b) => (
            <span
              key={b.key}
              className={`${styles.bar}${b.jade ? ` ${styles.jadeBar}` : ""}`}
              style={{ height: `${b.height}px` }}
            />
          ))}
        </div>

        <div className={styles.lockup}>
          <div className={styles.eyebrow}>{t("studio:endCard.eyebrow")}</div>

          <div className={styles.wordmark}>
            <span className={styles.pulse} aria-hidden />
            <span className={styles.wm}>
              <Translation
                i18nKey="studio:brand.lockup"
                components={{ em: <span className={styles.q} /> }}
              />
            </span>
            <span className={styles.tag}>{t("studio:brand.studioLabel")}</span>
          </div>

          <div className={styles.tagline}>
            <Translation
              i18nKey="studio:endCard.tagline"
              components={{ em: <em /> }}
            />
          </div>

          <div className={styles.ledger}>
            <span className={styles.pay}>
              <svg
                className={styles.coin}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M14.5 9.2c-.5-.9-1.5-1.4-2.6-1.4-1.6 0-2.9 1-2.9 2.3 0 1.2 1 1.8 2.9 2.2 1.9.4 2.9 1 2.9 2.2 0 1.3-1.3 2.3-2.9 2.3-1.2 0-2.2-.5-2.7-1.5M12 6.4v11.2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              {t("studio:endCard.paidThisMonth")}
            </span>
            <span className={styles.div} aria-hidden />
            <span className={styles.per}>
              <b>€0.05</b> {t("studio:endCard.perPlayLabel")} · <b>100%</b>{" "}
              {t("studio:endCard.perTipLabel")}
            </span>
          </div>

          <div className={styles.cta}>
            {t("studio:endCard.listenCta")}
            <b>{STUDIO_DOMAIN}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
