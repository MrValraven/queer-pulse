import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { LuTreeDeciduous } from "react-icons/lu";
import { PageShell } from "../../shared/components/layout";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { MENTORS } from "./mentorship.data";
import { MentorDetailSkeleton } from "./MentorDetailSkeleton";
import { MentorCycleNav } from "./MentorCycleNav";
import { MentorDetailHeader } from "./MentorDetailHeader";
import { MentorDetailSections } from "./MentorDetailSections";
import { MentorDetailSidebar } from "./MentorDetailSidebar";
import { MentorMatchModal } from "./MentorMatchModal";
import styles from "./MentorDetailPage.module.css";

export function MentorDetailPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { slug } = useParams();
  const idx = MENTORS.findIndex((mentor) => mentor.slug === slug);
  const loading = useSimulatedLoad();
  const [matchOpen, setMatchOpen] = useState(false);

  // Live mode has no real mentor directory yet, so the MENTORS mock must never
  // stand in for a real profile — show an honest coming-soon state instead.
  if (!demoMode) {
    return (
      <PageShell>
        <div className={styles.page}>
          <Link to={routes.mentorship} className={styles.back}>
            {t("economy:mentorDetail.backToAll")}
          </Link>
          <EmptyState
            icon={<LuTreeDeciduous />}
            title={t("economy:mentorDetail.emptyLive.title")}
            description={t("economy:mentorDetail.emptyLive.description")}
            action={{
              label: t("economy:mentorDetail.emptyLive.cta"),
              to: routes.mentorship,
            }}
          />
        </div>
      </PageShell>
    );
  }

  if (idx === -1) return <Navigate to={routes.mentorship} replace />;

  const m = MENTORS[idx]!;
  const prev = MENTORS[(idx - 1 + MENTORS.length) % MENTORS.length]!;
  const next = MENTORS[(idx + 1) % MENTORS.length]!;
  const first = m.name.split(" ")[0] ?? m.name;
  const base = routes.mentorship;
  const openRequest = () => setMatchOpen(true);

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={base} className={styles.back}>
          {t("economy:mentorDetail.backToAll")}
        </Link>

        <MentorCycleNav
          base={base}
          previous={prev}
          next={next}
          position={idx + 1}
          total={MENTORS.length}
        />

        {loading ? (
          <MentorDetailSkeleton />
        ) : (
          <FadeIn>
            <MentorDetailHeader m={m} first={first} onRequest={openRequest} />
            <div className={styles.grid}>
              <MentorDetailSections m={m} first={first} />
              <MentorDetailSidebar
                m={m}
                first={first}
                onRequest={openRequest}
              />
            </div>
            <MentorCycleNav
              base={base}
              previous={prev}
              next={next}
              position={idx + 1}
              total={MENTORS.length}
              last
            />
          </FadeIn>
        )}

        {matchOpen && (
          <MentorMatchModal mode="mentee" onClose={() => setMatchOpen(false)} />
        )}
      </div>
    </PageShell>
  );
}
