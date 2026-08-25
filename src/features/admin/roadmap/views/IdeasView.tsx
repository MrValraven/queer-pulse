import { FiInbox } from "react-icons/fi";
import { Button, EmptyState, Tag } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../../../shared/i18n/format";
import { describeError } from "../../../../shared/api/errorMessage";
import { useAdminRoadmap } from "../../api/useAdminRoadmap";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import { useRoadmapModals } from "../state/roadmapModalsHook";
import type { AdminRoadmapIdeaDTO } from "../../api/roadmapAdmin.types";
import styles from "./IdeasView.module.css";

/**
 * "3 days"/"5 hours" — a bare duration (no "ago"/"há" baked in), because
 * `admin:roadmap.ideasView.ageSuffix` supplies that wrapper itself
 * (`"{age} ago"` EN / `"há {age}"` PT). `Intl.NumberFormat`'s unit style
 * localizes the unit word for free, so this stays correct in both languages
 * without a second catalog entry.
 */
function bareAge(createdAtIso: string, fmt: Formatters): string {
  const createdAtMs = new Date(createdAtIso).getTime();
  if (Number.isNaN(createdAtMs)) return "";
  const minutes = Math.max(1, Math.round((Date.now() - createdAtMs) / 60_000));
  if (minutes < 60) {
    return fmt.number(minutes, {
      style: "unit",
      unit: "minute",
      unitDisplay: "long",
    });
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return fmt.number(hours, {
      style: "unit",
      unit: "hour",
      unitDisplay: "long",
    });
  }
  const days = Math.round(hours / 24);
  if (days < 30) {
    return fmt.number(days, {
      style: "unit",
      unit: "day",
      unitDisplay: "long",
    });
  }
  const months = Math.round(days / 30);
  return fmt.number(months, {
    style: "unit",
    unit: "month",
    unitDisplay: "long",
  });
}

interface IdeaRowProps {
  idea: AdminRoadmapIdeaDTO;
  duplicateOfName: string | null;
  pending: boolean;
  onPromote: () => void;
  onMerge: () => void;
  onDecline: () => void;
}

function IdeaRow({
  idea,
  duplicateOfName,
  pending,
  onPromote,
  onMerge,
  onDecline,
}: IdeaRowProps) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <p className={styles.title}>{idea.text}</p>
        {idea.note && <p className={styles.note}>{idea.note}</p>}
        <div className={styles.meta}>
          <Tag>{t(`admin:roadmap.categories.${idea.category}`)}</Tag>
          <span className={styles.metaItem}>
            {t(
              idea.fromMember
                ? "admin:roadmap.ideasView.submittedByMember"
                : "admin:roadmap.ideasView.submittedByTeam",
            )}
          </span>
          <span className={styles.metaItem}>
            {t("admin:roadmap.ideasView.ageSuffix", {
              age: bareAge(idea.createdAt, fmt),
            })}
          </span>
        </div>
        {duplicateOfName && (
          <p className={styles.duplicateHint}>
            {t("admin:roadmap.ideasView.duplicateHint", {
              name: duplicateOfName,
            })}{" "}
            <button
              type="button"
              className={styles.duplicateAction}
              onClick={onMerge}
            >
              {t("admin:roadmap.ideasView.mergeInsteadCta")}
            </button>
          </p>
        )}
      </div>

      <div className={styles.rowSide}>
        <div className={styles.voteCount}>
          <strong>{idea.votes}</strong>
          <span>{t("admin:roadmap.ideasView.votesLabel")}</span>
        </div>
        <div className={styles.actions}>
          <Button variant="jade" onClick={onPromote} disabled={pending}>
            {t("admin:roadmap.ideas.promoteCta")}
          </Button>
          <Button variant="ghost" onClick={onMerge} disabled={pending}>
            {t("admin:roadmap.ideasView.mergeCta")}
          </Button>
          <Button variant="ghost" onClick={onDecline} disabled={pending}>
            {t("admin:roadmap.ideasView.declineCta")}
          </Button>
        </div>
      </div>
    </li>
  );
}

/**
 * The member-idea triage queue — every idea not yet dismissed (`pending` +
 * already-`published`), highest-voted first. Promote turns an idea straight
 * into a board item; Merge/Decline open their own modals (`RoadmapModalsHost`,
 * Task C4), which own the actual `mergeIdea`/`declineIdea` mutation + toast —
 * this view only triggers them and handles the one action it owns directly,
 * Promote.
 */
export function IdeasView({ ideas }: { ideas: AdminRoadmapIdeaDTO[] }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { items } = useAdminRoadmap();
  const { promoteIdea, pending } = useAdminRoadmapMutations();
  const modals = useRoadmapModals();

  const queue = [...ideas]
    .filter((idea) => idea.status !== "dismissed")
    .sort((a, b) => b.votes - a.votes || a.sortOrder - b.sortOrder);

  if (queue.length === 0) {
    return (
      <EmptyState
        icon={<FiInbox />}
        title={t("admin:roadmap.ideasView.emptyTitle")}
        description={t("admin:roadmap.ideasView.emptyBody")}
      />
    );
  }

  function handlePromote(idea: AdminRoadmapIdeaDTO) {
    promoteIdea(idea.id, {
      onSuccess: (item) =>
        showToast(
          t("admin:roadmap.toasts.promoted", {
            name: item.name,
            votes: idea.liveVotes,
            count: idea.liveVotes,
          }),
          "success",
        ),
      onError: (error) =>
        showToast(
          describeError(t("admin:roadmap.toasts.promoteError"), error),
          "error",
        ),
    });
  }

  return (
    <ul className={styles.list}>
      {queue.map((idea) => (
        <IdeaRow
          key={idea.id}
          idea={idea}
          pending={pending}
          duplicateOfName={
            idea.duplicateOfItemId
              ? (items.find((item) => item.id === idea.duplicateOfItemId)
                  ?.name ?? null)
              : null
          }
          onPromote={() => handlePromote(idea)}
          onMerge={() => modals.open("merge", { ideaId: idea.id })}
          onDecline={() => modals.open("decline", { ideaId: idea.id })}
        />
      ))}
    </ul>
  );
}
