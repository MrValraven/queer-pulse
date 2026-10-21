import { routes } from "../../../app/routeMap";
import { FadeIn } from "../../../shared/components/ui";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import { CurrentMarkReference } from "./CurrentMarkReference";
import { LogoConceptCard } from "./LogoConceptCard";
import {
  LOGO_CONCEPTS,
  RIPPLE_FUSED_VARIANTS,
  RIPPLE_OUTSIDE_VARIANTS,
  RIPPLE_VARIANTS,
  THREAD_VARIANTS,
} from "./logoConcepts.data";
import { LogoVariantsSection } from "./LogoVariantsSection";
import styles from "./LogoConcepts.module.css";

/**
 * Admin › Logo concepts (`/admin/logo-concepts`). Candidate QueerPulse marks
 * for social avatars, built from the sign-in Q, shown beside today's mark so
 * the team can compare them in each colourway and at avatar sizes, then
 * download the SVG or a 1080px PNG. The ripple family leads in its own
 * section, where the P drops in like a pulse and its ripples form the Q.
 * Two more ripple families follow in sections of their own: the outside
 * family, a big P with the Q inside its bowl, and the fused family, where
 * the P's bowl is the Q's first ripple. The original three concepts come
 * next, then the thread variants in a section of their own.
 */
export function AdminLogoConceptsPage() {
  const { t } = useTranslation();

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
        <LogoVariantsSection
          title={t("admin:logoConcepts.ripple.title")}
          sub={t("admin:logoConcepts.ripple.sub")}
          concepts={RIPPLE_VARIANTS}
        />
      </FadeIn>

      <FadeIn delay={160}>
        <LogoVariantsSection
          title={t("admin:logoConcepts.rippleOutside.title")}
          sub={t("admin:logoConcepts.rippleOutside.sub")}
          concepts={RIPPLE_OUTSIDE_VARIANTS}
        />
      </FadeIn>

      <FadeIn delay={200}>
        <LogoVariantsSection
          title={t("admin:logoConcepts.rippleFused.title")}
          sub={t("admin:logoConcepts.rippleFused.sub")}
          concepts={RIPPLE_FUSED_VARIANTS}
        />
      </FadeIn>

      <FadeIn delay={240}>
        <div className={styles.grid}>
          {LOGO_CONCEPTS.map((concept) => (
            <LogoConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={280}>
        <LogoVariantsSection
          title={t("admin:logoConcepts.variants.title")}
          sub={t("admin:logoConcepts.variants.sub")}
          concepts={THREAD_VARIANTS}
        />
      </FadeIn>
    </AdminShell>
  );
}
