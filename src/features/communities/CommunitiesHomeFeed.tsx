import { Link } from "react-router-dom";
import { FiShield, FiInbox, FiFlag } from "react-icons/fi";
import {
  FadeIn,
  EmptyState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { HubPulseCard, type HubPost } from "./HubPulseCard";
import type { HomeTodo } from "./useCommunitiesHomeData";
import styles from "./CommunitiesHomePage.module.css";

type PulseItem = {
  post: HubPost["post"];
  communityName: string;
  communitySlug: string;
};

export function CommunitiesHomeTodos({ todos }: { todos: HomeTodo[] }) {
  if (todos.length === 0) return null;
  return (
    <div className={styles.todos}>
      <div className={styles.todoLbl}>
        <FiShield aria-hidden /> Needs your attention
      </div>
      {todos.map((t) => (
        <Link
          key={t.slug}
          to={`/community/${t.slug}`}
          className={styles.todoRow}
        >
          <span className={styles.todoName}>{t.name}</span>
          <span className={styles.todoCounts}>
            {t.requests > 0 && (
              <span className={styles.todoChip}>
                <FiInbox aria-hidden /> {t.requests} request
                {t.requests > 1 ? "s" : ""}
              </span>
            )}
            {t.reports > 0 && (
              <span
                className={[styles.todoChip, styles.todoChipFlag].join(" ")}
              >
                <FiFlag aria-hidden /> {t.reports} report
                {t.reports > 1 ? "s" : ""}
              </span>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}

function PulseSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div className={styles.pulseCard} key={i}>
          <SkeletonLine width="30%" height={11} style={{ marginBottom: 14 }} />
          <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
            <SkeletonAvatar size={36} />
            <SkeletonLine width="40%" height={12} />
          </div>
          <SkeletonLine height={12} style={{ margin: "14px 0 6px" }} />
          <SkeletonLine width="80%" height={12} />
        </div>
      ))}
    </>
  );
}

export function CommunitiesHomePulse({
  loading,
  pulse,
}: {
  loading: boolean;
  pulse: PulseItem[];
}) {
  return (
    <>
      <div className={styles.feedLbl}>Your pulse</div>
      {loading ? (
        <PulseSkeleton />
      ) : pulse.length === 0 ? (
        <EmptyState
          compact
          title="Quiet for now"
          description="When your communities post, it shows up here."
        />
      ) : (
        pulse.map((item, i) => (
          <FadeIn key={item.post.id} delay={Math.min(i, 8) * 55}>
            <HubPulseCard item={item} />
          </FadeIn>
        ))
      )}
    </>
  );
}
