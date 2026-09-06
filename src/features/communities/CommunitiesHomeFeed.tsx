import { Link } from "react-router-dom";
import { FiShield, FiInbox, FiFlag } from "react-icons/fi";
import { communityPath } from "../../app/routeMap";
import {
  FadeIn,
  EmptyState,
  LoadErrorState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  HubExcerptCard,
  HubPulseCard,
  type HubExcerpt,
  type HubPost,
} from "./HubPulseCard";
import type { HomeTodo } from "./useCommunitiesHomeData";
import styles from "./CommunitiesHomePage.module.css";

type PulseItem = {
  post: HubPost["post"];
  communityName: string;
  communitySlug: string;
};

/** The mod console pane each chip opens, addressed the way every other link
 *  into mod tools addresses one (`?tab=modtools&mod=<pane>`, see
 *  `modToolsNav.data.ts`). Both panes render for an owner, co-owner or
 *  moderator in live mode as well as demo. */
const todoTarget = (slug: string, pane: "requests" | "reports") =>
  `${communityPath(slug)}?tab=modtools&mod=${pane}`;

/**
 * "Needs your attention": the communities you staff that have somebody waiting
 * in a queue.
 *
 * Each count is its OWN link, into the pane that clears it, because the two
 * are different jobs: a pending join request is a person waiting at the door
 * and an open report is a moderation decision. A single row-wide link to the
 * community left a moderator to find the right pane themselves.
 *
 * The visible chip stays short ("3 requests"), and the accessible name says
 * which community it belongs to, because a screen reader reading the links on
 * this page one after another gets no row context from position.
 *
 * Renders nothing at all when there is nothing waiting. The caller decides
 * whether an empty list means "your queues are clear" or "you moderate
 * nothing", and only ever passes rows for communities the viewer staffs.
 */
export function CommunitiesHomeTodos({ todos }: { todos: HomeTodo[] }) {
  const { t } = useTranslation();
  if (todos.length === 0) return null;
  return (
    <div className={styles.todos}>
      <div className={styles.todoLbl}>
        <FiShield aria-hidden /> {t("communities:hub.todos.label")}
      </div>
      {todos.map((todo) => (
        <div key={todo.slug} className={styles.todoRow}>
          <Link to={communityPath(todo.slug)} className={styles.todoName}>
            {todo.name}
          </Link>
          <span className={styles.todoCounts}>
            {todo.requests > 0 && (
              <Link
                to={todoTarget(todo.slug, "requests")}
                className={styles.todoChip}
                aria-label={t("communities:hub.todos.requestsIn", {
                  count: todo.requests,
                  name: todo.name,
                })}
              >
                <FiInbox aria-hidden />{" "}
                {t("communities:hub.todos.requests", { count: todo.requests })}
              </Link>
            )}
            {todo.reports > 0 && (
              <Link
                to={todoTarget(todo.slug, "reports")}
                className={[styles.todoChip, styles.todoChipFlag].join(" ")}
                aria-label={t("communities:hub.todos.reportsIn", {
                  count: todo.reports,
                  name: todo.name,
                })}
              >
                <FiFlag aria-hidden />{" "}
                {t("communities:hub.todos.reports", { count: todo.reports })}
              </Link>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The live to-dos block, which has three states a demo one never has.
 *
 * A moderator is the one viewer for whom an ABSENT block is a lie: it reads as
 * "nothing is waiting on you", which a failed or in-flight digest cannot know.
 * So a viewer who staffs at least one community gets a skeleton while the
 * digest is in flight and a `LoadErrorState` with a retry when it failed, and
 * a viewer who staffs nothing gets no block in any state, because they could
 * never have had a to-do in the first place.
 *
 * The pulse below carries the same failure with its own retry. Two panels for
 * one outage is the lesser problem: a moderator told nothing is waiting when
 * the request never landed is the reason this block exists.
 */
export function CommunitiesHomeLiveTodos({
  isModeratorSomewhere,
  isLoading,
  isError,
  onRetry,
  todos,
}: {
  isModeratorSomewhere: boolean;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  todos: HomeTodo[];
}) {
  const { t } = useTranslation();
  if (!isModeratorSomewhere) return null;
  if (isLoading) {
    // `SkeletonLine` is a `--line-rgb` shimmer, which is dark on dark against
    // this block's plum ground and would not be seen. Same pulse, cream
    // channels, in the module.
    return (
      <div className={styles.todos} aria-busy="true">
        <div className={styles.todoLbl}>
          <FiShield aria-hidden /> {t("communities:hub.todos.label")}
        </div>
        <div className={styles.todoRow}>
          <span className={styles.todoSkeleton} style={{ width: "34%" }} />
        </div>
        <div className={styles.todoRow}>
          <span className={styles.todoSkeleton} style={{ width: "27%" }} />
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.todos}>
        <div className={styles.todoLbl}>
          <FiShield aria-hidden /> {t("communities:hub.todos.label")}
        </div>
        {/* On its own paper surface: `LoadErrorState` is an `EmptyState`, which
            paints its text in `--ink`, and this block's ground is plum. */}
        <div className={styles.todoError}>
          <LoadErrorState compact onRetry={onRetry} />
        </div>
      </div>
    );
  }
  return <CommunitiesHomeTodos todos={todos} />;
}

/** `hasAuthor` mirrors the card the skeleton stands in for: the demo card
 *  carries an author avatar and name, the live digest card carries neither
 *  (the endpoint sends no author), so its placeholder must not promise one. */
function PulseSkeleton({ hasAuthor = true }: { hasAuthor?: boolean }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div className={styles.pulseCard} key={i}>
          <SkeletonLine width="30%" height={11} style={{ marginBottom: 14 }} />
          {hasAuthor ? (
            <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <SkeletonAvatar size={36} />
              <SkeletonLine width="40%" height={12} />
            </div>
          ) : (
            <SkeletonLine width="22%" height={11} />
          )}
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

/**
 * The live cross-community pulse: post excerpts from
 * `GET /me/communities/digest`, one request for every community you belong to.
 *
 * Three distinct states, because collapsing them is the bug this replaced. A
 * failed digest shows `LoadErrorState` with a retry rather than the quiet
 * "nothing happening" copy, which would report an outage as calm. The empty
 * state is only reached once the request has succeeded and genuinely returned
 * no posts in the last seven days, which for a real member of quiet
 * communities is true.
 */
export function CommunitiesHomeLivePulse({
  isLoading,
  isError,
  onRetry,
  excerpts,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  excerpts: HubExcerpt[];
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.feedLbl}>{t("communities:hub.pulse.label")}</div>
      {isLoading ? (
        <PulseSkeleton hasAuthor={false} />
      ) : isError ? (
        <LoadErrorState compact onRetry={onRetry} />
      ) : excerpts.length === 0 ? (
        <EmptyState
          compact
          title={t("communities:hub.pulse.empty.title")}
          description={t("communities:hub.pulse.empty.description")}
        />
      ) : (
        excerpts.map((item, index) => (
          <FadeIn key={item.postId} delay={Math.min(index, 8) * 55}>
            <HubExcerptCard item={item} />
          </FadeIn>
        ))
      )}
    </>
  );
}
