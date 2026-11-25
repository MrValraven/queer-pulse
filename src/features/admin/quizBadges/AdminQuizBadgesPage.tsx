import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiAward, FiPlus } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import {
  Button,
  Collapse,
  CollapseListItem,
  EmptyState,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import type { QuizBadgeDefinitionDTO } from "../../../shared/contracts/quizWinBadges";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizWinBadgeErrorText } from "../../quizshow/winBadges/quizWinBadgeErrors";
import { QuizshowPickerFade } from "../../quizshow/builder/QuizshowPickerFade";
import { AdminPageHeader, AdminPanel } from "../ui";
import { useHeaderActionFold } from "../ui/adminListPageHelpers";
import { useQuizBadgeLibrary } from "./api/useQuizBadgeLibrary";
import {
  AdminQuizBadgeFormDialog,
  type AdminQuizBadgeFormMode,
} from "./AdminQuizBadgeFormDialog";
import { AdminQuizBadgeDeleteConfirm } from "./AdminQuizBadgeDeleteConfirm";
import { AdminQuizBadgeRow } from "./AdminQuizBadgeRow";
import styles from "./AdminQuizBadges.module.css";

/** The page heading's DOM id: focus lands here after a delete takes its row away. */
const QUIZ_BADGES_HEADING_ID = "admin-quiz-badges-heading";
const SKELETON_ROW_KEYS = ["first", "second", "third"] as const;

type BodyState = "loading" | "error" | "empty" | "list";

function bodyStateOf(
  library: ReturnType<typeof useQuizBadgeLibrary>,
): BodyState {
  // A failed background refetch keeps the rows already on screen.
  if (library.isPending) return "loading";
  if (library.data === undefined) return "error";
  return library.data.items.length === 0 ? "empty" : "list";
}

/**
 * The quiz badge library for our team: live badges by name, then archived
 * ones, in the order the server sends. Each row edits, archives or restores,
 * and deletes a badge nobody holds; Create badge opens the form.
 */
export function AdminQuizBadgesPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const library = useQuizBadgeLibrary();
  const bodyState = bodyStateOf(library);
  const [formMode, setFormMode] = useState<AdminQuizBadgeFormMode | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<QuizBadgeDefinitionDTO | null>(null);
  // The empty panel carries its own Create badge, so the header's folds away.
  const headerAction = useHeaderActionFold(bodyState !== "empty");
  const openCreate = () => setFormMode({ kind: "create" });

  return (
    <AdminShell
      title={t("quizshow:winBadges.admin.library.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          titleId={QUIZ_BADGES_HEADING_ID}
          eyebrow={t("shared:adminNav.sections.editorial")}
          title={t("quizshow:winBadges.admin.library.title")}
          sub={t("quizshow:winBadges.admin.library.sub")}
          actions={
            headerAction.isFolded ? undefined : (
              <Collapse
                isOpen={headerAction.isOpen}
                isInitialSkipped={headerAction.isInitialSkipped}
                onExitComplete={headerAction.markFolded}
              >
                <Button variant="primary" onClick={openCreate}>
                  <FiPlus aria-hidden fill="none" />
                  {t("quizshow:winBadges.admin.library.create")}
                </Button>
              </Collapse>
            )
          }
        />
      </FadeIn>

      <FadeIn delay={60}>
        <QuizshowPickerFade stateKey={bodyState}>
          {bodyState === "loading" ? (
            <BadgeRowsSkeleton />
          ) : bodyState === "error" ? (
            <LoadErrorState
              className={styles.panel}
              headingLevel={2}
              title={t("quizshow:winBadges.admin.library.loadError")}
              description={quizWinBadgeErrorText(library.error, t, fmt)}
              onRetry={() => void library.refetch()}
              isRetrying={library.isFetching}
            />
          ) : bodyState === "empty" ? (
            <EmptyState
              className={styles.panel}
              compact
              headingLevel={2}
              icon={<FiAward aria-hidden fill="none" />}
              title={t("quizshow:winBadges.admin.library.emptyTitle")}
              description={t("quizshow:winBadges.admin.library.emptyBody")}
              action={{
                label: t("quizshow:winBadges.admin.library.create"),
                onClick: openCreate,
              }}
            />
          ) : (
            <BadgeRows
              definitions={library.data?.items ?? []}
              onEdit={(definition) => setFormMode({ kind: "edit", definition })}
              onDelete={setDeleteTarget}
            />
          )}
        </QuizshowPickerFade>
      </FadeIn>

      <AnimatePresence>
        {formMode !== null && (
          <AdminQuizBadgeFormDialog
            key="quiz-badge-form"
            mode={formMode}
            onClose={() => setFormMode(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {deleteTarget !== null && (
          <AdminQuizBadgeDeleteConfirm
            key="delete-quiz-badge"
            definition={deleteTarget}
            headingId={QUIZ_BADGES_HEADING_ID}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

function BadgeRows({
  definitions,
  onEdit,
  onDelete,
}: {
  definitions: QuizBadgeDefinitionDTO[];
  onEdit: (definition: QuizBadgeDefinitionDTO) => void;
  onDelete: (definition: QuizBadgeDefinitionDTO) => void;
}) {
  return (
    <AdminPanel as="div" padding="flush" className={styles.rowsPanel}>
      <ul className={styles.rows}>
        <AnimatePresence initial={false}>
          {definitions.map((definition) => (
            <CollapseListItem key={definition.id}>
              <AdminQuizBadgeRow
                definition={definition}
                onEdit={() => onEdit(definition)}
                onDelete={() => onDelete(definition)}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
    </AdminPanel>
  );
}

function BadgeRowsSkeleton() {
  return (
    <div className={styles.skeletonRows} aria-hidden>
      {SKELETON_ROW_KEYS.map((rowKey) => (
        <SkeletonLine
          key={rowKey}
          height={96}
          style={{ borderRadius: "var(--radius-card)" }}
        />
      ))}
    </div>
  );
}
