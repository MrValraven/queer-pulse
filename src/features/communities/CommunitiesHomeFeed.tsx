import { Link } from "react-router-dom";
import { FiShield, FiInbox, FiFlag } from "react-icons/fi";
import {
  FadeIn,
  EmptyState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HubPulseCard, type HubPost } from "./HubPulseCard";
import type { HomeTodo } from "./useCommunitiesHomeData";
import styles from "./CommunitiesHomePage.module.css";

type PulseItem = {
  post: HubPost["post"];
  communityName: string;
  communitySlug: string;
};

export function CommunitiesHomeTodos({ todos }: { todos: HomeTodo[] }) {
  const { t } = useTranslation();
  if (todos.length === 0) return null;
  return (
    <div className={styles.todos}>
      <div className={styles.todoLbl}>
        <FiShield aria-hidden /> {t("communities:hub.todos.label")}
      </div>
      {todos.map((todo) => (
        <Link
          key={todo.slug}
          to={`/community/${todo.slug}`}
          className={styles.todoRow}
        >
          <span className={styles.todoName}>{todo.name}</span>
          <span className={styles.todoCounts}>
            {todo.requests > 0 && (
              <span className={styles.todoChip}>
                <FiInbox aria-hidden />{" "}
                {t("communities:hub.todos.requests", { count: todo.requests })}
              </span>
            )}
            {todo.reports > 0 && (
              <span
                className={[styles.todoChip, styles.todoChipFlag].join(" ")}
              >
                <FiFlag aria-hidden />{" "}
                {t("communities:hub.todos.reports", { count: todo.reports })}
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
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.feedLbl}>{t("communities:hub.pulse.label")}</div>
      {loading ? (
        <PulseSkeleton />
      ) : pulse.length === 0 ? (
        <EmptyState
          compact
          title={t("communities:hub.pulse.empty.title")}
          description={t("communities:hub.pulse.empty.description")}
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
