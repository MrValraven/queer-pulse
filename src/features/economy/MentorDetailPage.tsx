import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { FadeIn } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
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
  const { slug } = useParams();
  const idx = MENTORS.findIndex((m) => m.slug === slug);
  const loading = useSimulatedLoad();
  const [matchOpen, setMatchOpen] = useState(false);
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
          ← All mentors
        </Link>

        <MentorCycleNav
          base={base}
          prev={prev}
          next={next}
          pos={idx + 1}
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
              prev={prev}
              next={next}
              pos={idx + 1}
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
