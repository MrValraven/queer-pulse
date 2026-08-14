import { FiArrowRight } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import {
  NeighbourhoodsSection,
  HealthSection,
  HousingSection,
  OrgsSection,
  FirstStepSection,
  CommQuickSection,
} from "./ArrivingSections";

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
      <PageHero
        eyebrow={t("marketing:arriving.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:arriving.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:arriving.hero.body")}
      />

      <NeighbourhoodsSection />
      <HealthSection />
      <HousingSection />
      <OrgsSection />
      <FirstStepSection />
      <CommQuickSection />

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
