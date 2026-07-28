import { useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  SERVICES,
  INCIDENTS,
  UPTIME_SERVICE_IDS,
  STATUS_LABEL_KEY,
  type ServiceStatus,
} from "./status.data";
import { ServiceCardSkeleton, IncidentSkeleton } from "./StatusSkeletons";
import styles from "./StatusComponents.module.css";

const PILL_CLASS: Record<ServiceStatus, string | undefined> = {
  op: styles.pillOp,
  deg: styles.pillDeg,
  out: styles.pillOut,
};

const DAYS = 90;

function buildBars(id: string): string[] {
  return Array.from({ length: DAYS }, (_, i) => {
    if (id === "authentication" && i === 12) return "partial";
    if (id === "messages" && i === 43) return "partial";
    return "op";
  });
}

export function StatusHero() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // The "all operational" badge and the "refreshes every 60 s" line are live
  // status claims with no backend behind them yet — demo-only. Live mode shows
  // an honest, neutral subtitle instead.
  return (
    <section className={`${styles.hero} wrap`}>
      {demoMode && (
        <div className={styles.overallBadge} aria-live="polite">
          <span className={styles.overallDot} aria-hidden />
          <span className={styles.overallLabel}>
            {t("system:status.hero.allOperational")}
          </span>
        </div>
      )}
      <h1 className={styles.heroTitle}>{t("system:status.hero.title")}</h1>
      <p className={styles.heroSub}>
        {demoMode
          ? t("system:status.hero.sub")
          : t("system:status.hero.subLive")}
      </p>
    </section>
  );
}

export function ServicesGrid() {
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  return (
    <section className="wrap" style={{ paddingBottom: 60 }}>
      <p className={styles.sectionEye}>
        {t("system:status.services.sectionEye")}
      </p>
      <div className={styles.svcGrid} aria-busy={loading}>
        {loading
          ? Array.from({ length: SERVICES.length }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))
          : SERVICES.map((svc, i) => (
              <FadeIn key={svc.id} delay={Math.min(i, 8) * 60}>
                <div className={styles.svcCard}>
                  <div>
                    <div className={styles.svcName}>{t(svc.nameKey)}</div>
                    <div className={styles.svcDesc}>{t(svc.descriptionKey)}</div>
                  </div>
                  <span
                    className={`${styles.svcPill} ${PILL_CLASS[svc.status]}`}
                  >
                    {t(STATUS_LABEL_KEY[svc.status])}
                  </span>
                </div>
              </FadeIn>
            ))}
      </div>
    </section>
  );
}

export function UptimeSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className="wrap" style={{ padding: "60px 0" }}>
      <p className={styles.sectionEye}>
        {t("system:status.uptime.sectionEye")}
      </p>
      {UPTIME_SERVICE_IDS.map((id) => {
        const service = SERVICES.find((svc) => svc.id === id);
        if (!service) return null;
        const bars = buildBars(id);
        const pct = (
          (bars.filter((b) => b === "op").length / DAYS) *
          100
        ).toFixed(2);
        return (
          <div key={id}>
            <div className={styles.uptimeHead}>
              <span className={styles.uptimeName}>{t(service.nameKey)}</span>
              <span className={styles.uptimePct}>
                {t("system:status.uptime.pct", {
                  pct: fmt.number(Number(pct), {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                })}
              </span>
            </div>
            <div className={styles.uptimeBars}>
              {bars.map((bar, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (DAYS - i));
                const label = fmt.date(d, { day: "numeric", month: "short" });
                const tip =
                  bar === "op"
                    ? t("system:status.uptime.tooltip.operational", {
                        date: label,
                      })
                    : bar === "partial"
                      ? t("system:status.uptime.tooltip.partial", {
                          date: label,
                        })
                      : t("system:status.uptime.tooltip.outage", {
                          date: label,
                        });
                const cls = [
                  styles.ubar,
                  bar === "partial" && styles.ubarPartial,
                  bar === "down" && styles.ubarDown,
                ]
                  .filter(Boolean)
                  .join(" ");
                return <div key={i} className={cls} data-tip={tip} />;
              })}
            </div>
          </div>
        );
      })}
      <div className={styles.uptimeAxis}>
        <span>{t("system:status.uptime.axis.ninetyDaysAgo")}</span>
        <span>{t("system:status.uptime.axis.sixtyDaysAgo")}</span>
        <span>{t("system:status.uptime.axis.thirtyDaysAgo")}</span>
        <span>{t("system:status.uptime.axis.today")}</span>
      </div>
    </section>
  );
}

export function IncidentsSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const loading = useSimulatedLoad();
  return (
    <section className="wrap" style={{ paddingBottom: 80 }}>
      <p className={styles.sectionEye}>
        {t("system:status.incidents.sectionEye")}
      </p>
      <div className={styles.incList} aria-busy={loading}>
        {loading
          ? Array.from({ length: INCIDENTS.length }).map((_, i) => (
              <IncidentSkeleton key={i} />
            ))
          : INCIDENTS.map((inc, i) => (
              <FadeIn
                key={inc.titleKey}
                delay={Math.min(i, 8) * 60}
                className={[
                  styles.incItem,
                  inc.resolved && styles.incItemResolved,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={styles.incDot} aria-hidden>
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 14 14"
                    fill="none"
                    stroke={inc.resolved ? "var(--jade)" : "rgba(45,27,61,.4)"}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                  >
                    {inc.resolved ? (
                      <polyline points="2,7 5.5,10.5 12,3.5" />
                    ) : (
                      <circle cx={7} cy={7} r={5} />
                    )}
                  </svg>
                </div>
                <div>
                  <div className={styles.incDate}>{fmt.date(inc.date)}</div>
                  <div className={styles.incTitle}>{t(inc.titleKey)}</div>
                  <div className={styles.incText}>{t(inc.textKey)}</div>
                  <span
                    className={[
                      styles.incTag,
                      inc.status === "resolved"
                        ? styles.incTagResolved
                        : styles.incTagMonitoring,
                    ].join(" ")}
                  >
                    {inc.status === "resolved"
                      ? t("system:status.incidents.resolvedTag")
                      : t("system:status.incidents.monitoringTag")}
                  </span>
                </div>
              </FadeIn>
            ))}
      </div>
    </section>
  );
}

export function SubscribeStrip() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    showToast(t("system:status.subscribe.toast"), "success");
    setEmail("");
  }

  return (
    <div className="wrap">
      <div className={styles.subStrip}>
        <div>
          <h3>{t("system:status.subscribe.title")}</h3>
          <p>{t("system:status.subscribe.body")}</p>
        </div>
        <form className={styles.subForm} onSubmit={handleSubmit}>
          <input
            className={styles.subInput}
            type="email"
            placeholder={t("system:status.subscribe.placeholder")}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit">{t("system:status.subscribe.cta")}</Button>
        </form>
      </div>
    </div>
  );
}
