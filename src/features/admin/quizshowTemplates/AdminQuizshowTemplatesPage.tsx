import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiLayers, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { adminQuizshowTemplatePath, routes } from "../../../app/routeMap";
import { useToast } from "../../../shared/components/feedback/useToast";
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
import type { QuizshowTemplateRow } from "../../../shared/contracts/quizshow";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useCreateQuizshowTemplate,
  useQuizshowTemplateRows,
} from "../../quizshow/api/useQuizshowTemplates";
import { QuizshowPickerFade } from "../../quizshow/builder/QuizshowTemplatePicker";
import { quizshowTemplateErrorKeyOf } from "../../quizshow/templates/quizshowTemplateErrors";
import { AdminPageHeader } from "../ui";
import { AdminQuizshowTemplateRow } from "./AdminQuizshowTemplateRow";
import {
  QUIZSHOW_TEMPLATES_HEADING_ID,
  TEMPLATE_SKELETON_ROW_KEYS,
} from "./quizshowTemplateList.data";
import styles from "./AdminQuizshowTemplates.module.css";

interface NewTemplateAction {
  start: () => void;
  isPending: boolean;
}

/** Creates a blank draft, says so, and opens it in the builder; a refusal names its reason. */
function useNewTemplateAction(): NewTemplateAction {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const createTemplate = useCreateQuizshowTemplate();

  const create = async () => {
    if (createTemplate.isPending) return;
    try {
      const detail = await createTemplate.mutateAsync();
      showToast(t("quizshow:templates.list.created"), "success");
      void navigate(adminQuizshowTemplatePath(detail.id));
    } catch (error) {
      showToast(t(quizshowTemplateErrorKeyOf(error)), "error");
    }
  };

  return { start: () => void create(), isPending: createTemplate.isPending };
}

/**
 * Every Pulse Live quiz template for our team (moderators and admins), drafts
 * first, in the order the server sends. Rows open the builder, copy, publish
 * or unpublish and delete; New template starts a blank draft in the builder.
 */
export function AdminQuizshowTemplatesPage() {
  const { t } = useTranslation();
  const newTemplate = useNewTemplateAction();
  const templateList = useTemplateList();
  // The empty panel carries its own New template, so the header's folds away.
  const headerAction = useHeaderActionFold(templateList.bodyState !== "empty");

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="quizshow:templates.list.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          titleId={QUIZSHOW_TEMPLATES_HEADING_ID}
          eyebrow={t("quizshow:templates.list.eyebrow")}
          title={
            <Translation
              i18nKey="quizshow:templates.list.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("quizshow:templates.list.sub")}
          actions={
            headerAction.isFolded ? undefined : (
              <Collapse
                isOpen={headerAction.isOpen}
                isInitialSkipped={headerAction.isInitialSkipped}
                onExitComplete={headerAction.markFolded}
              >
                <Button
                  variant="primary"
                  aria-disabled={newTemplate.isPending || undefined}
                  onClick={newTemplate.start}
                >
                  <FiPlus aria-hidden fill="none" />
                  {t("quizshow:templates.list.new")}
                </Button>
              </Collapse>
            )
          }
        />
      </FadeIn>

      <FadeIn delay={60}>
        <TemplatesBody templateList={templateList} newTemplate={newTemplate} />
      </FadeIn>
    </AdminShell>
  );
}

type BodyState = "loading" | "error" | "empty" | "list";

interface TemplateList {
  templateRows: ReturnType<typeof useQuizshowTemplateRows>;
  rows: QuizshowTemplateRow[];
  bodyState: BodyState;
}

/** The rows and which panel shows them; the header reads it too. */
function useTemplateList(): TemplateList {
  const templateRows = useQuizshowTemplateRows();
  const rows = templateRows.data?.items ?? [];
  // A failed background refetch keeps the rows already on screen.
  const bodyState: BodyState = templateRows.isPending
    ? "loading"
    : templateRows.data === undefined
      ? "error"
      : rows.length === 0
        ? "empty"
        : "list";
  return { templateRows, rows, bodyState };
}

interface HeaderActionFold {
  isOpen: boolean;
  /** True once the fold has finished, so the header drops its empty slot. */
  isFolded: boolean;
  isInitialSkipped: boolean;
  markFolded: () => void;
}

/**
 * Folds the header action away and back. Once folded the slot leaves the
 * header, so the phone layout keeps no gap for it; a return grows it back in.
 */
function useHeaderActionFold(isOpen: boolean): HeaderActionFold {
  const [isFolded, setIsFolded] = useState(!isOpen);
  const [hasReturned, setHasReturned] = useState(false);
  // Adjusted during render: the slot must be back before the fold-in starts.
  if (isOpen && isFolded) {
    setIsFolded(false);
    setHasReturned(true);
  }
  return {
    isOpen,
    isFolded,
    isInitialSkipped: !hasReturned,
    markFolded: () => setIsFolded(true),
  };
}

function TemplatesBody({
  templateList,
  newTemplate,
}: {
  templateList: TemplateList;
  newTemplate: NewTemplateAction;
}) {
  const { t } = useTranslation();
  const { templateRows, rows, bodyState } = templateList;
  // One live region, mounted the whole time, so a screen reader hears the
  // load finish and the count change. The error and empty panels speak for
  // themselves, so it goes quiet while either shows.
  const isCountShown = bodyState === "list";

  return (
    <>
      <p
        className={isCountShown ? styles.statusLine : "visuallyHidden"}
        role="status"
      >
        {isCountShown
          ? t("quizshow:templates.list.count", { count: rows.length })
          : ""}
      </p>
      <QuizshowPickerFade stateKey={bodyState}>
        {bodyState === "loading" ? (
          <TemplateRowsSkeleton />
        ) : bodyState === "error" ? (
          <LoadErrorState
            className={styles.panel}
            headingLevel={2}
            title={t("quizshow:templates.loadError")}
            description={t(quizshowTemplateErrorKeyOf(templateRows.error))}
            onRetry={() => void templateRows.refetch()}
            isRetrying={templateRows.isFetching}
          />
        ) : bodyState === "empty" ? (
          <EmptyState
            className={styles.panel}
            compact
            headingLevel={2}
            icon={<FiLayers aria-hidden fill="none" />}
            title={t("quizshow:templates.list.emptyTitle")}
            description={t("quizshow:templates.list.emptyBody")}
            action={{
              label: t("quizshow:templates.list.new"),
              onClick: newTemplate.start,
              isBusy: newTemplate.isPending,
            }}
          />
        ) : (
          <TemplateRows rows={rows} />
        )}
      </QuizshowPickerFade>
    </>
  );
}

function TemplateRows({ rows }: { rows: QuizshowTemplateRow[] }) {
  return (
    <ul className={styles.rows}>
      <AnimatePresence initial={false}>
        {rows.map((row) => (
          <CollapseListItem key={row.id}>
            <AdminQuizshowTemplateRow row={row} />
          </CollapseListItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function TemplateRowsSkeleton() {
  return (
    <div className={styles.skeletonRows} aria-hidden>
      {TEMPLATE_SKELETON_ROW_KEYS.map((rowKey) => (
        <SkeletonLine
          key={rowKey}
          height={120}
          style={{ borderRadius: "var(--radius-card)" }}
        />
      ))}
    </div>
  );
}
