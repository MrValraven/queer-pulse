import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { lisbonLeadDay } from "../leads/leadDates";
import type { CulturalIdeaDTO } from "./api/culturalProduction.types";
import { TaskFormDialog } from "./TaskFormDialog";
import { TaskRow } from "./TaskRow";
import styles from "./IdeaDrawer.module.css";

/**
 * The tasks linked to the idea, in the task list's order, as compact rows
 * that open the task drawer. Add task opens the task dialog with this idea
 * already linked; the new task joins the list once the idea reads again.
 */
export function IdeaLinkedTasks({
  idea,
  onOpenTask,
}: {
  idea: CulturalIdeaDTO;
  onOpenTask: (taskId: string) => void;
}) {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);
  // The Lisbon day the overdue and due-today states read, as the badge does.
  const today = useMemo(() => lisbonLeadDay(), []);
  const headingId = `cultural-idea-${idea.id}-tasks`;
  const initialIdea = useMemo(
    () => ({ id: idea.id, title: idea.title }),
    [idea.id, idea.title],
  );

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.sectionHead}>
        <h3 id={headingId} className={styles.sectionTitle}>
          {t("admin:culturalProduction.ideas.drawer.linkedTasksHeading")}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className={styles.phoneTarget}
          onClick={() => setIsAddOpen(true)}
        >
          <FiPlus aria-hidden />
          {t("admin:culturalProduction.ideas.drawer.addTaskCta")}
        </Button>
      </div>
      <ul className={styles.taskList}>
        <AnimatePresence initial={false}>
          {idea.linkedTasks.map((task) => (
            <CollapseListItem key={task.id}>
              <TaskRow
                task={task}
                today={today}
                onOpen={onOpenTask}
                isCompact
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={idea.linkedTasks.length === 0}>
        <p className={styles.empty}>
          {t("admin:culturalProduction.ideas.drawer.linkedTasksNone")}
        </p>
      </Collapse>
      <AnimatePresence>
        {isAddOpen && (
          <TaskFormDialog
            initialIdea={initialIdea}
            onClose={() => setIsAddOpen(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
