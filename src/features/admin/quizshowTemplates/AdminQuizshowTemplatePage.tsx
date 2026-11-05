import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { templateScope } from "../../quizshow/quizshowScope";
import { QuizshowStudio } from "../../quizshow/studio/QuizshowStudio";

const BACK_LINK = {
  to: routes.adminQuizshowTemplates,
  labelKey: "quizshow:templates.page.back",
};

/**
 * `/admin/quizshow/templates/:templateId`: one Pulse Live quiz template in
 * the full-screen studio, in place of the admin console, for moderators and
 * admins with Pulse Live access (the staff gate in `authGate.ts` and
 * `AppRoutes` is unchanged). The back link returns to the templates list.
 * The page offers no delete, so it never outlives its own template's cache
 * entry.
 */
export function AdminQuizshowTemplatePage() {
  const { t } = useTranslation();
  const { templateId = "" } = useParams<{ templateId: string }>();
  const scope = useMemo(() => templateScope(templateId), [templateId]);
  return (
    <>
      <PageMeta title={t("quizshow:templates.list.breadcrumb")} noIndex />
      {/* Keyed so moving between templates starts each draft afresh. */}
      <QuizshowStudio key={templateId} scope={scope} backLink={BACK_LINK} />
    </>
  );
}
