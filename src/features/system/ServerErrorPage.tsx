import { useState, useEffect, useRef } from "react";
import { Button } from "../../shared/components/ui";
import { BackToSettingsLink } from "../../shared/components/layout";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./ServerErrorPage.module.css";

function Countdown() {
  const { t } = useTranslation();
  const endRef = useRef<number | null>(null);
  const [display, setDisplay] = useState("23:44");

  useEffect(() => {
    // Compute the deadline once the timer starts — Date.now() is impure, so keep
    // it out of render.
    endRef.current = Date.now() + 23 * 60_000 + 44_000;
    const id = setInterval(() => {
      const diff = Math.max(0, (endRef.current ?? 0) - Date.now());
      const m = Math.floor(diff / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setDisplay(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      if (diff === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.countdown}>
      <div className={styles.cdLabel}>
        {t("system:serverError.countdown.label")}
      </div>
      <div className={styles.cdNum}>{display}</div>
    </div>
  );
}

type Mode = "error" | "maintenance";

export function ServerErrorPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("error");
  const isMaint = mode === "maintenance";

  return (
    <div className={styles.root}>
      <BackToSettingsLink />
      <div
        className={styles.modeTabs}
        aria-label={t("system:serverError.demoModeAria")}
      >
        {(["error", "maintenance"] as Mode[]).map((m) => (
          <button
            type="button"
            key={m}
            className={[styles.modeTab, mode === m && styles.modeTabActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setMode(m)}
          >
            {m === "error"
              ? t("system:serverError.tabs.error")
              : t("system:serverError.tabs.maintenance")}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.brand}>
            <span className={styles.dot} aria-hidden />
            <Translation
              i18nKey="shared:brand.wordmark"
              components={{ em: <em /> }}
            />
          </div>
          <div className={styles.codeBg} aria-hidden>
            {isMaint ? "—" : "500"}
          </div>
          <h1 className={styles.heading}>
            {isMaint ? (
              <>
                {t("system:serverError.heading.maintenance.line1")}
                <br />
                <Translation
                  i18nKey="system:serverError.heading.maintenance.line2"
                  components={{ em: <em /> }}
                />
              </>
            ) : (
              <>
                {t("system:serverError.heading.error.line1")}
                <br />
                <Translation
                  i18nKey="system:serverError.heading.error.line2"
                  components={{ em: <em /> }}
                />
              </>
            )}
          </h1>
          <p className={styles.headingSub}>
            {isMaint
              ? t("system:serverError.sub.maintenance")
              : t("system:serverError.sub.error")}
          </p>
        </div>

        <div className={styles.cardBody}>
          {isMaint && (
            <div className={styles.maintBadge}>
              <span>{t("system:maintenance.eyebrow")}</span>
            </div>
          )}

          <div className={styles.statusStrip}>
            <span
              className={styles.statusDot}
              style={
                isMaint
                  ? {
                      background: "var(--jade)",
                      animation: "none",
                      boxShadow: "none",
                    }
                  : undefined
              }
            />
            <span className={styles.statusText}>
              {isMaint ? (
                <Translation
                  i18nKey="system:serverError.status.maintenance"
                  components={{
                    strong: <strong />,
                    // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- element template; <Translation> clones it with the link text at render time.
                    a: <a href="https://status.queerpulse.com" />,
                  }}
                />
              ) : (
                <Translation
                  i18nKey="system:serverError.status.error"
                  components={{
                    strong: <strong />,
                    // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- element template; <Translation> clones it with the link text at render time.
                    a: <a href={routes.status} />,
                  }}
                />
              )}
            </span>
          </div>

          {isMaint && <Countdown />}

          <div className={styles.actions}>
            <Button
              onClick={() => window.location.reload()}
              className={styles.actionBtn}
            >
              {t("system:serverError.actions.retryCta")}
            </Button>
            <Button
              variant="ghost"
              to={routes.homepage}
              className={styles.actionBtn}
            >
              {t("system:serverError.actions.homeCta")}
            </Button>
            <Button
              variant="ghost"
              to={routes.status}
              className={styles.actionBtn}
            >
              {t("system:serverError.actions.statusCta")}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>
          <Translation
            i18nKey="system:serverError.footer.contact"
            // eslint-disable-next-line jsx-a11y/anchor-has-content, jsx-a11y/control-has-associated-label -- element template; <Translation> clones it with the link text at render time.
            components={{ a: <a href="mailto:hello@queerpulse.com" /> }}
          />
        </p>
      </div>
    </div>
  );
}
