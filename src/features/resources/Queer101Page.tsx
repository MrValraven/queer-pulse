import { PageShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  PageMeta,
  JsonLd,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import { FAQ } from "./queer101.data";
import {
  Queer101Hero,
  Queer101Faq,
  Queer101Glossary,
  Queer101Resources,
  Queer101TalkOptions,
  Queer101Outro,
} from "./Queer101Sections";

export function Queer101Page() {
  const { t } = useTranslation();
  const pageTitle = t("resources:queer101.meta.title");
  const pageDescription = t("resources:queer101.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildFaqSchema(
          FAQ.map((entry) => ({
            question: t(entry.qKey),
            answer: t(entry.aKey),
          })),
        )}
      />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("nav:resources"), path: "/resources" },
          { name: pageTitle, path: "/resources/101" },
        ])}
      />
      <Queer101Hero />
      <Queer101Faq />
      <Queer101Glossary />
      <Queer101Resources />
      <Queer101TalkOptions />
      <Queer101Outro />
    </PageShell>
  );
}
