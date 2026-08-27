import { PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta } from "../../shared/seo";
import { CrisisStrip } from "./CrisisStrip";

/**
 * What a guide page shows while no editor has signed off on it.
 *
 * The guides are gated on editorial review because these are the pages people
 * open in a crisis, and unchecked crisis information is worse than none. That
 * same reasoning rules out the two cheap ways to hide a page. A redirect to
 * the guide index takes away the URL somebody came for and says nothing, and
 * the index is empty until reviews land, so they arrive at nothing. A 404
 * claims the guide never existed, which is untrue.
 *
 * So the page states plainly what happened, and carries the crisis lines
 * above the explanation: somebody who reached `/resources/harm-reduction` from
 * a search result at 3am needs a phone number on this screen more than they
 * need to understand our editorial process.
 */
export function GuideUnderReview() {
  const { t } = useTranslation();

  return (
    <PageShell>
      <PageMeta
        title={t("resources:guide.underReview.meta.title")}
        description={t("resources:guide.underReview.meta.description")}
        noIndex
      />
      <CrisisStrip />
      <Outro
        title={
          <Translation
            i18nKey="resources:guide.underReview.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("resources:guide.underReview.sub")}
      >
        <Button to={routes.guideIndex} variant="primary" size="lg">
          {t("resources:guide.underReview.indexCta")}
        </Button>
        <Button to={routes.resources} variant="ghost" size="lg">
          {t("resources:guide.underReview.libraryCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
