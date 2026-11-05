import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { useEvent } from "../../gatherings/api/useEvent";
import {
  gatheringSlugFromParam,
  manageGatheringPath,
} from "../../gatherings/gatheringPaths";
import { QUIZSHOW_MANAGE_TAB } from "../quizshowPaths";
import { eventScope } from "../quizshowScope";
import { QuizshowStudio } from "../studio/QuizshowStudio";

/**
 * `/gatherings/:slug/quizshow/edit`: the event's quiz in the full-screen
 * studio, back to the event's Manage page on its Live game tab. The hosting
 * gate (`isQuizshowHostingPath`) admits only members with Pulse Live, and the
 * quiz read refuses anyone who does not run the event, which the studio names.
 * The event's start feeds the import's series shortcut once it has loaded.
 */
export function QuizshowEventStudioPage() {
  const { t } = useTranslation();
  const { slug: routeParam = "" } = useParams();
  // From the route alone, so the scope is fixed for the life of the studio.
  const slug = gatheringSlugFromParam(routeParam);
  const scope = useMemo(() => eventScope(slug), [slug]);
  // The Manage page's own cache entry, so arriving from it reads no second time.
  const eventQuery = useEvent(routeParam);
  const eventStartAt = eventQuery.data?.gathering.date.toISOString() ?? null;
  const backLink = useMemo(
    () => ({
      to: manageGatheringPath(slug, QUIZSHOW_MANAGE_TAB),
      labelKey: "quizshow:studio.backToManage",
    }),
    [slug],
  );
  return (
    <>
      <PageMeta title={t("quizshow:studio.heading")} noIndex />
      <QuizshowStudio
        scope={scope}
        backLink={backLink}
        eventStartAt={eventStartAt}
      />
    </>
  );
}
