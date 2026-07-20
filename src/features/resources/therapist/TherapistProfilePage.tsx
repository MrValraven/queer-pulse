import { Navigate, useParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { PageShell } from "../../../shared/components/layout";
import {
  FadeIn,
  SkeletonCard,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useSimulatedLoad } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "../../../shared/seo";
import { THERAPISTS } from "../mentalHealth.data";
import { THERAPIST_PROFILES } from "./therapistProfiles.data";
import { TherapistHero } from "./TherapistHero";
import { TherapistSections } from "./TherapistSections";
import { TherapistSidebar } from "./TherapistSidebar";
import styles from "./TherapistProfilePage.module.css";

export function TherapistProfilePage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const loading = useSimulatedLoad();
  const therapist = THERAPISTS.find(
    (therapistEntry) => therapistEntry.id === id,
  );
  const profile = id ? THERAPIST_PROFILES[id] : undefined;

  if (!therapist || !profile) {
    return <Navigate to={routes.mentalHealth} replace />;
  }

  // Every :id shares this one template, so meta describes the directory in
  // general rather than the individual profile currently loaded.
  const pageTitle = t("resources:therapists.meta.title");
  const pageDescription = t("resources:therapists.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildMedicalWebPageSchema({
          name: pageTitle,
          description: pageDescription,
          path: "/resources/therapists",
        })}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/therapists" },
        ])}
      />
      <div className={styles.page}>
        {loading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <FadeIn>
              <TherapistHero therapist={therapist} profile={profile} />
            </FadeIn>
            <div className={styles.grid}>
              <FadeIn delay={80}>
                <TherapistSections therapist={therapist} profile={profile} />
              </FadeIn>
              <FadeIn as="aside" delay={160} className={styles.side}>
                <TherapistSidebar therapist={therapist} profile={profile} />
              </FadeIn>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

/** Mirrors the loaded layout so nothing shifts when content lands. */
function ProfileSkeleton() {
  return (
    <>
      <SkeletonLine width={160} height={13} style={{ marginBottom: 22 }} />
      <SkeletonLine
        height={64}
        style={{ borderRadius: 14, marginBottom: 28 }}
      />
      <div className={styles.hero}>
        <SkeletonLine width={180} height={220} style={{ borderRadius: 18 }} />
        <div>
          <SkeletonLine width={220} height={11} style={{ marginBottom: 14 }} />
          <SkeletonLine width="60%" height={48} style={{ marginBottom: 12 }} />
          <SkeletonLine width="45%" height={14} style={{ marginBottom: 18 }} />
          <SkeletonLine width="70%" height={40} />
        </div>
      </div>
      <div className={styles.grid}>
        <div>
          <SkeletonCard />
          <SkeletonCard style={{ marginTop: 14 }} />
        </div>
        <SkeletonCard />
      </div>
    </>
  );
}
