import { useMemo } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useQuizshowQuiz } from "../../quizshow/api/useQuizshowQuiz";
import { QuizshowBuilder } from "../../quizshow/builder/QuizshowBuilder";
import { templateScope } from "../../quizshow/quizshowScope";
import {
  templateCardTitleOf,
  templateMetaOf,
} from "../../quizshow/templates/quizshowTemplateResponse";
import { AdminPageHeader } from "../ui";
import styles from "./AdminQuizshowTemplatePage.module.css";

/**
 * The page heading: the saved card title in the viewer's language, or the
 * untitled label for a saved blank one. Until a template has loaded it shows
 * a placeholder bar, and after a failed load nothing, so it never repeats the
 * breadcrumb on screen; the list's name stays as its accessible name either
 * way (the builder below names the reason a load failed).
 */
function TemplatePageHeading({ templateId }: { templateId: string }) {
  const { t, language } = useTranslation();
  const scope = useMemo(() => templateScope(templateId), [templateId]);
  // The same cache entry the builder reads, so the heading follows each save.
  const query = useQuizshowQuiz(scope, { isEnabled: true });
  const meta = query.data ? templateMetaOf(query.data) : null;
  if (meta) {
    const cardTitle = templateCardTitleOf(meta.card.title, language);
    return cardTitle === "" ? t("quizshow:templates.row.untitled") : cardTitle;
  }
  return (
    <>
      <span className="visuallyHidden">
        {t("quizshow:templates.list.breadcrumb")}
      </span>
      {/* A failed load fades the bar out and keeps its line, so the
          builder's error below does not jump. */}
      <span
        className={styles.titlePending}
        data-failed={query.isError || undefined}
        aria-hidden
      />
    </>
  );
}

/**
 * `/admin/quizshow/templates/:templateId`: one Pulse Live quiz template in the
 * builder, for moderators and admins with Pulse Live access. The top bar
 * stops at the list's name, since the heading carries the template's title,
 * which keeps the phone header to one line. The page offers no delete, so it
 * never outlives its own template's cache entry.
 */
export function AdminQuizshowTemplatePage() {
  const { t } = useTranslation();
  const { templateId = "" } = useParams<{ templateId: string }>();
  return (
    <AdminShell
      title={t("quizshow:templates.list.breadcrumb")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <div className={styles.page}>
        <Link to={routes.adminQuizshowTemplates} className={styles.back}>
          <FiArrowLeft aria-hidden fill="none" />
          {t("quizshow:templates.page.back")}
        </Link>
        <AdminPageHeader
          eyebrow={t("quizshow:templates.list.eyebrow")}
          title={<TemplatePageHeading templateId={templateId} />}
        />
        {/* Keyed so moving between templates starts each draft afresh. */}
        <QuizshowBuilder
          key={templateId}
          scope={templateScope(templateId)}
          eventStartAt={null}
        />
      </div>
    </AdminShell>
  );
}
