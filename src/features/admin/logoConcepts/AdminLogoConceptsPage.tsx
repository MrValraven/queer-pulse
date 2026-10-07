import { useId } from "react";
import { routes } from "../../../app/routeMap";
import { FadeIn } from "../../../shared/components/ui";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import { CurrentMarkReference } from "./CurrentMarkReference";
import { LogoConceptCard } from "./LogoConceptCard";
import { LOGO_CONCEPTS, THREAD_VARIANTS } from "./logoConcepts.data";
import styles from "./LogoConcepts.module.css";

/**
 * Admin › Logo concepts (`/admin/logo-concepts`). Candidate QueerPulse marks
 * for social avatars, built from the sign-in Q, shown beside today's mark so
 * the team can compare them in each colourway and at avatar sizes, then
 * download the SVG or a 1080px PNG. The thread variants follow in their own
 * section, with their card titles one level below its heading.
 */
export function AdminLogoConceptsPage() {
  const { t } = useTranslation();
  const variantsHeadingId = useId();

  return (
    <AdminShell
      title={t("shared:adminNav.items.logoConcepts")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:logoConcepts.header.eyebrow")}
          title={t("shared:adminNav.items.logoConcepts")}
          sub={t("admin:logoConcepts.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <CurrentMarkReference />
      </FadeIn>

      <FadeIn delay={120}>
        <div className={styles.grid}>
          {LOGO_CONCEPTS.map((concept) => (
            <LogoConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={160}>
        <section
          className={styles.variants}
          aria-labelledby={variantsHeadingId}
        >
          <h2 id={variantsHeadingId} className={styles.variantsTitle}>
            {t("admin:logoConcepts.variants.title")}
          </h2>
          <p className={styles.variantsSub}>
            {t("admin:logoConcepts.variants.sub")}
          </p>
          <div className={styles.grid}>
            {THREAD_VARIANTS.map((concept) => (
              <LogoConceptCard
                key={concept.id}
                concept={concept}
                headingLevel={3}
              />
            ))}
          </div>
        </section>
      </FadeIn>
    </AdminShell>
  );
}
