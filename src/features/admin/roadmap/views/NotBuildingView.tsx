import { FiEye, FiRotateCcw, FiThumbsDown } from "react-icons/fi";
import { Button, EmptyState, Tag } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { describeError } from "../../../../shared/api/errorMessage";
import { formatRelative } from "../../../../shared/lib/date";
import { useAdminRoadmapMutations } from "../../api/useAdminRoadmapMutations";
import type { AdminRoadmapIdeaDTO } from "../../api/roadmapAdmin.types";
import styles from "./NotBuildingView.module.css";

interface NotBuildingRowProps {
  idea: AdminRoadmapIdeaDTO;
  pending: boolean;
  onReopen: () => void;
}

function NotBuildingRow({ idea, pending, onReopen }: NotBuildingRowProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const reasonKey = idea.declineReason ?? "scope";

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.meta}>
          <Tag>{t(`admin:roadmap.categories.${idea.category}`)}</Tag>
          <span className={styles.reasonTag}>
            {t(`admin:roadmap.modals.decline.reason.${reasonKey}.label`)}
          </span>
          <span className={styles.metaItem}>
            {formatRelative(idea.createdAt, fmt)}
          </span>
        </div>
        <p className={styles.title}>{idea.text}</p>
        {idea.declineNote && <p className={styles.wording}>{idea.declineNote}</p>}
        <p className={styles.hadAsked}>
          {idea.votes} {t("admin:roadmap.notBuildingView.hadAskedLabel")}
        </p>
      </div>

      <div className={styles.rowSide}>
        <Button variant="ghost" onClick={onReopen} disabled={pending}>
          <FiRotateCcw aria-hidden /> {t("admin:roadmap.notBuildingView.reopenCta")}
        </Button>
      </div>
    </li>
  );
}

/**
 * The publicly-visible "not building this, and why" list — every idea the
 * team declined with a reason, the same set the public `/roadmap` page reads
 * (Task D2). Reopen is a plain `status: 'published'` patch (the mutation
 * clears `declineReason`/`declineNote` server-side), so a reopened idea
 * simply reappears in the Ideas queue on the next read.
 */
export function NotBuildingView({ ideas }: { ideas: AdminRoadmapIdeaDTO[] }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { reopenIdea, pending } = useAdminRoadmapMutations();

  const declined = ideas
    .filter((idea) => idea.status === "dismissed" && idea.declineReason)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function handleReopen(idea: AdminRoadmapIdeaDTO) {
    reopenIdea(idea.id, {
      onSuccess: () =>
        showToast(
          t("admin:roadmap.toasts.reopened", { name: idea.text }),
          "success",
        ),
      onError: (error) =>
        showToast(
          describeError(t("admin:roadmap.toasts.reopenError"), error),
          "error",
        ),
    });
  }

  return (
    <div>
      <div className={styles.banner} role="note">
        <FiEye aria-hidden className={styles.bannerIcon} />
        <p>{t("admin:roadmap.notBuildingView.publicBanner")}</p>
      </div>

      {declined.length === 0 ? (
        <EmptyState
          icon={<FiThumbsDown />}
          title={t("admin:roadmap.notBuildingView.emptyTitle")}
          description={t("admin:roadmap.notBuildingView.emptyBody")}
        />
      ) : (
        <ul className={styles.list}>
          {declined.map((idea) => (
            <NotBuildingRow
              key={idea.id}
              idea={idea}
              pending={pending}
              onReopen={() => handleReopen(idea)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
