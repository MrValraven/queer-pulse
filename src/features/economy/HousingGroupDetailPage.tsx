import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { useHousingGroup } from "./api/useHousingGroup";
import {
  GroupDetailHeader,
  GroupNorms,
  GroupListings,
} from "./HousingGroupDetailSections";
import { GroupEmptyState } from "./GroupEmptyState";
import { JoinGroupModal } from "./JoinGroupModal";
import styles from "./HousingGroupsPage.module.css";

/** One vetted group: its norms, its listings, and the join-with-screening flow
 *  (P3.1/P3.3). */
export function HousingGroupDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: group, isLoading } = useHousingGroup(slug);
  const [joining, setJoining] = useState(false);

  if (isLoading) {
    return (
      <PageShell>
        <div className={`wrap ${styles.detailLoading}`} aria-busy="true">
          <div className={styles.cardSkeleton} />
        </div>
      </PageShell>
    );
  }

  if (!group) {
    return (
      <PageShell>
        <div className={`wrap ${styles.notFound}`}>
          <GroupEmptyState />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GroupDetailHeader group={group} onJoin={() => setJoining(true)} />
      <GroupNorms norms={group.norms} />
      <GroupListings listings={group.listings ?? []} />
      {joining && (
        <JoinGroupModal group={group} onClose={() => setJoining(false)} />
      )}
    </PageShell>
  );
}
