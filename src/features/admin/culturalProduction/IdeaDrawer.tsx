import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import {
  Button,
  ConfirmDialog,
  SkeletonLine,
} from "../../../shared/components/ui";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminDrawer } from "../ui";
import {
  culturalReasonOf,
  type CulturalIdeaDTO,
} from "./api/culturalProduction.types";
import { useCulturalIdea } from "./api/useCulturalIdeas";
import { useDeleteCulturalIdea } from "./api/useCulturalIdeaMutations";
import { CulturalLoadError } from "./CulturalLoadError";
import { CulturalRefusalLine } from "./CulturalRefusalLine";
import { IdeaBackers } from "./IdeaBackers";
import { IdeaComments } from "./IdeaComments";
import { IdeaDrawerHeader } from "./IdeaDrawerHeader";
import { IdeaFormDialog } from "./IdeaFormDialog";
import { IdeaLinkedTasks } from "./IdeaLinkedTasks";
import styles from "./IdeaDrawer.module.css";

type IdeaDrawerView = "loading" | "notFound" | "error" | "idea";

/** The body of a loaded idea: the description as written, who's in, the
 *  linked tasks and the thread. */
function IdeaDrawerBody({
  idea,
  onOpenTask,
}: {
  idea: CulturalIdeaDTO;
  onOpenTask: (taskId: string) => void;
}) {
  return (
    <div className={styles.body}>
      {idea.description.trim() !== "" && (
        <p className={styles.description}>{idea.description}</p>
      )}
      <IdeaBackers idea={idea} />
      <IdeaLinkedTasks idea={idea} onOpenTask={onOpenTask} />
      <IdeaComments idea={idea} />
    </div>
  );
}

/** The outline while the idea loads. */
function IdeaDrawerSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden>
      <SkeletonLine height={14} />
      <SkeletonLine height={14} width="80%" />
      <SkeletonLine height={40} width="50%" />
      <SkeletonLine height={60} />
    </div>
  );
}

/** Edit idea and, when the server allows it, Delete idea (asked first). A
 *  deleted idea closes the drawer with a toast. */
function IdeaDrawerFoot({
  idea,
  onClose,
}: {
  idea: CulturalIdeaDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const deleteIdea = useDeleteCulturalIdea(idea.id);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [refusal, setRefusal] = useState<unknown>(null);

  const confirmDelete = () => {
    if (deleteIdea.isPending) return;
    setRefusal(null);
    deleteIdea.mutate(undefined, {
      onSuccess: () => {
        showToast(
          t("admin:culturalProduction.ideas.drawer.deletedToast"),
          "success",
        );
        onClose();
      },
      onError: (cause) => setRefusal(cause),
    });
  };

  return (
    <div className={styles.foot}>
      {idea.canDelete && (
        <Button
          variant="quiet"
          className={styles.deleteButton}
          onClick={() => {
            setRefusal(null);
            setIsConfirmOpen(true);
          }}
        >
          <FiTrash2 aria-hidden />
          {t("admin:culturalProduction.ideas.drawer.deleteCta")}
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        className={styles.phoneTarget}
        onClick={() => setIsEditOpen(true)}
      >
        <FiEdit2 aria-hidden />
        {t("admin:culturalProduction.ideas.drawer.editCta")}
      </Button>
      <AnimatePresence>
        {isEditOpen && (
          <IdeaFormDialog
            mode="edit"
            idea={idea}
            onClose={() => setIsEditOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmDialog
            open
            tone="destructive"
            initialFocus="cancel"
            loading={deleteIdea.isPending}
            title={t(
              "admin:culturalProduction.ideas.drawer.deleteConfirmTitle",
            )}
            description={t(
              "admin:culturalProduction.ideas.drawer.deleteConfirmBody",
            )}
            confirmLabel={t("admin:culturalProduction.ideas.drawer.deleteCta")}
            cancelLabel={t("admin:culturalProduction.common.cancel")}
            onClose={() => {
              if (!deleteIdea.isPending) setIsConfirmOpen(false);
            }}
            onConfirm={confirmDelete}
          >
            <CulturalRefusalLine error={refusal} />
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The idea drawer. One drawer stays mounted while its body swaps between
 * the outline, the idea, a gone idea (named, with a way out; a retry would
 * get the same answer) and any other failure (its cause and a retry).
 */
export function IdeaDrawer({
  ideaId,
  onClose,
  onOpenTask,
}: {
  ideaId: string;
  onClose: () => void;
  onOpenTask: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  const ideaQuery = useCulturalIdea(ideaId);
  const idea = ideaQuery.data;
  const drawerLabel = t("admin:culturalProduction.ideas.drawer.label");
  const view: IdeaDrawerView =
    idea !== undefined
      ? "idea"
      : ideaQuery.isPending
        ? "loading"
        : culturalReasonOf(ideaQuery.error) === "CULTURAL_IDEA_NOT_FOUND"
          ? "notFound"
          : "error";

  const content: Record<IdeaDrawerView, ReactNode> = {
    loading: <IdeaDrawerSkeleton />,
    notFound: (
      <div className={styles.state}>
        <p className={styles.stateText}>
          {t("admin:culturalProduction.ideas.drawer.notFound")}
        </p>
        <Button variant="ghost" size="sm" onClick={onClose}>
          {t("admin:culturalProduction.common.close")}
        </Button>
      </div>
    ),
    error: (
      <CulturalLoadError
        error={ideaQuery.error}
        isRetrying={ideaQuery.isFetching}
        onRetry={() => void ideaQuery.refetch()}
        titleKey="admin:culturalProduction.ideas.drawer.loadError.title"
        retryKey="admin:culturalProduction.ideas.drawer.loadError.retryCta"
      />
    ),
    idea: idea && <IdeaDrawerBody idea={idea} onOpenTask={onOpenTask} />,
  };

  return (
    <AdminDrawer
      label={drawerLabel}
      onClose={onClose}
      head={
        idea ? (
          <IdeaDrawerHeader idea={idea} />
        ) : view === "loading" ? (
          <SkeletonLine height={24} width="70%" />
        ) : (
          <h2 className={styles.title}>{drawerLabel}</h2>
        )
      }
      foot={idea && <IdeaDrawerFoot idea={idea} onClose={onClose} />}
    >
      <div className={styles.views}>
        <AnimatePresence mode="popLayout" initial={false}>
          <ViewFade key={view}>{content[view]}</ViewFade>
        </AnimatePresence>
      </div>
    </AdminDrawer>
  );
}
