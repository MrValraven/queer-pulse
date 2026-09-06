import { FiArrowRight } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import {
  NeighbourhoodsSection,
  HealthSection,
  HousingSection,
  OrgsSection,
} from "./ArrivingSections";
import { ArrivingChecklistSection } from "./ArrivingChecklist";
import { ArrivingGatheringsSection } from "./ArrivingGatherings";
import { ArrivingCommunitiesSection } from "./ArrivingCommunities";
import { PageReviewStamp } from "./PageReviewStamp";

/** The day a person last read this page through. Built from local date parts
 *  so the stamp never renders a day early west of Greenwich. Bump it when the
 *  page is read through again. */
const LAST_REVIEWED_ON = new Date(2026, 8, 6);

export function ArrivingPage() {
  const { t } = useTranslation();
  const pageTitle = t("marketing:arriving.meta.title");
  const pageDescription = t("marketing:arriving.meta.description");
  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          {
            name: t("shared:megaNav.lisbon.title"),
            path: routes.safeSpaces,
          },
          { name: pageTitle, path: routes.arriving },
        ])}
      />
      {/* Compact: the arrival checklist is the first thing a newcomer needs,
          and the full display hero pushed it below the fold. */}
      <PageHero
        compact
        eyebrow={t("marketing:arriving.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:arriving.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:arriving.hero.body")}
      >
        <PageReviewStamp
          reviewedOn={LAST_REVIEWED_ON}
          verifyKey="marketing:arriving.review.verify"
        />
      </PageHero>

      <ArrivingChecklistSection />
      <NeighbourhoodsSection />
      <HealthSection />
      <HousingSection />
      <OrgsSection />
      <ArrivingGatheringsSection />
      <ArrivingCommunitiesSection />

      <Outro
        title={
          <Translation
            i18nKey="marketing:arriving.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:arriving.outro.sub")}
      >
        <Button to={requestInvitePath("arriving")} variant="primary" size="lg">
          {t("marketing:arriving.outro.cta")} <FiArrowRight aria-hidden />
        </Button>
      </Outro>
    </PageShell>
  );
}
