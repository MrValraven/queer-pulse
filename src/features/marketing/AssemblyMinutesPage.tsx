import { useParams, Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AssemblyMinutesBody } from "./AssemblyMinutesBody";
import { MINUTES, MINUTES_FALLBACK_YEAR } from "./assemblyMinutes.data";
import styles from "./AssemblyMinutesPage.module.css";

export function AssemblyMinutesPage() {
  const { t } = useTranslation();
  const { year } = useParams<{ year: string }>();
  const minutes = (year && MINUTES[year]) || MINUTES[MINUTES_FALLBACK_YEAR]!;
  const exact = Boolean(year && MINUTES[year]);

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            {t("marketing:assemblyMinutes.hero.eyebrow", {
              year: minutes.year,
            })}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:assemblyMinutes.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            {t("marketing:assemblyMinutes.hero.dek", { year: minutes.year })}{" "}
            {!exact && (
              <em>
                {t("marketing:assemblyMinutes.hero.fallbackNote", {
                  requestedYear: year,
                  year: minutes.year,
                })}
              </em>
            )}
          </p>
          <div className={styles.actions}>
            <Button to={routes.annualAssembly} variant="ghost">
              {t("marketing:assemblyMinutes.hero.backCta")}
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.page}>
        <AssemblyMinutesBody minutes={minutes} />

        <div className={styles.otherYears}>
          <span>{t("marketing:assemblyMinutes.otherYears")}</span>
          {Object.keys(MINUTES)
            .sort()
            .reverse()
            .map((y) => (
              <Link
                key={y}
                to={`${routes.annualAssembly}/minutes/${y}`}
                className={y === minutes.year ? styles.yearActive : styles.year}
              >
                {y}
              </Link>
            ))}
        </div>
      </div>
    </PageShell>
  );
}
