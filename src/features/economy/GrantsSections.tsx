import { Link } from "react-router-dom";
import { FiDollarSign } from "react-icons/fi";
import {
  EmptyState,
  FadeIn,
  Reveal,
  SkeletonLine,
} from "../../shared/components/ui";
import {
  SECTIONS,
  STATUS_LABEL,
  STEPS,
  type Grant,
  type Status,
} from "./grants.data";
import styles from "./GrantsPage.module.css";

const STATUS_CLASS: Record<Status, string | undefined> = {
  open: styles.gsOpen,
  rolling: styles.gsRolling,
  closed: styles.gsClosed,
};

function GrantSkeleton() {
  return (
    <div className={styles.gc} aria-hidden>
      <div className={styles.gcTop}>
        <div style={{ flex: 1 }}>
          <SkeletonLine width={90} height={12} />
          <SkeletonLine width="70%" height={19} style={{ marginTop: 6 }} />
        </div>
        <SkeletonLine width={64} height={14} />
      </div>
      <SkeletonLine width="100%" height={13} />
      <SkeletonLine
        width="85%"
        height={13}
        style={{ marginTop: 6, marginBottom: 14 }}
      />
      <div className={styles.gcFoot}>
        <div className={styles.gcTags}>
          <SkeletonLine width={58} height={20} style={{ borderRadius: 6 }} />
          <SkeletonLine width={72} height={20} style={{ borderRadius: 6 }} />
        </div>
        <div className={styles.gcRight}>
          <SkeletonLine width={58} height={18} style={{ borderRadius: 5 }} />
          <SkeletonLine width={76} height={13} />
        </div>
      </div>
    </div>
  );
}

function GrantCard({ grant, delay }: { grant: Grant; delay: number }) {
  return (
    <FadeIn as="div" delay={delay} className={styles.gc}>
      <div className={styles.gcTop}>
        <div>
          <div className={styles.gcOrg}>{grant.org}</div>
          <div className={styles.gcName}>{grant.name}</div>
        </div>
        <div className={styles.gcAmount}>{grant.amount}</div>
      </div>
      <div className={styles.gcDesc}>{grant.desc}</div>
      <div className={styles.gcFoot}>
        <div className={styles.gcTags}>
          {grant.tags.map((tag) => (
            <span key={tag} className={styles.gtag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.gcRight}>
          <span className={`${styles.gcStatus} ${STATUS_CLASS[grant.status]}`}>
            {STATUS_LABEL[grant.status]}
          </span>
          <Link to={grant.to} className={styles.gcLink}>
            Learn more
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}

export function GrantsResults({
  loading,
  filtered,
  onClearFilter,
}: {
  loading: boolean;
  filtered: Grant[];
  onClearFilter: () => void;
}) {
  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <GrantSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<FiDollarSign />}
        title="Nothing matches your filter"
        description="No opportunities fit that category right now. Clear the filter to browse every grant and fellowship members are tracking."
        action={{ label: "Clear filters", onClick: onClearFilter }}
      />
    );
  }

  return (
    <>
      {SECTIONS.map((section) => {
        const items = filtered.filter((g) => g.sec === section.id);
        if (items.length === 0) return null;
        return (
          <div key={section.id} className={styles.section}>
            <div className={styles.secHead}>{section.label}</div>
            <div className={styles.grid}>
              {items.map((grant, i) => (
                <GrantCard
                  key={grant.name}
                  grant={grant}
                  delay={Math.min(i, 8) * 60}
                />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

export function GrantsGuide() {
  return (
    <section className={styles.guide}>
      <div className="wrap">
        <Reveal as="h2">
          Writing a <em>strong application</em>
        </Reveal>
        <Reveal as="p" className={styles.guideSub} delay={60}>
          Advice from community members who've successfully secured grants —
          from micro to major.
        </Reveal>
        <div className={styles.stepsGrid}>
          {STEPS.map((step) => (
            <div key={step.n} className={styles.stepItem}>
              <div className={styles.stepN}>{step.n}</div>
              <div className={styles.stepTitle}>{step.title}</div>
              <div className={styles.stepBody}>{step.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
