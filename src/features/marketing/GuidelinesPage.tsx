import { type ReactNode, useMemo } from "react";
import { FiArrowRight } from "react-icons/fi";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import {
  PageMeta,
  JsonLd,
  buildBreadcrumbSchema,
} from "../../shared/seo";
import s from "./GuidelinesPage.module.css";

interface Clause {
  number: string;
  titlePreKey: string;
  titleEmKey: string;
  body: ReactNode;
}

const REVISED_DATE = new Date(2026, 5, 1);

/**
 * i18n Pattern B. Every clause is platform-authored governance chrome (the
 * Community Guidelines), so each paragraph/list item becomes a catalog key;
 * bodies that carry inline `<b>` keep the tag placeholder in the catalog
 * string via `<Translation>` rather than splitting the sentence.
 */
function buildClauses(t: TFunction): Clause[] {
  return [
    {
      number: "01",
      titlePreKey: "guidelines.clause01.titlePre",
      titleEmKey: "guidelines.clause01.titleEm",
      body: (
        <>
          <p>{t("marketing:guidelines.clause01.p1")}</p>
          <p>{t("marketing:guidelines.clause01.p2")}</p>
        </>
      ),
    },
    {
      number: "02",
      titlePreKey: "guidelines.clause02.titlePre",
      titleEmKey: "guidelines.clause02.titleEm",
      body: (
        <>
          <p>{t("marketing:guidelines.clause02.p1")}</p>
          <ul>
            <li>{t("marketing:guidelines.clause02.li1")}</li>
            <li>{t("marketing:guidelines.clause02.li2")}</li>
            <li>{t("marketing:guidelines.clause02.li3")}</li>
            <li>{t("marketing:guidelines.clause02.li4")}</li>
            <li>{t("marketing:guidelines.clause02.li5")}</li>
          </ul>
          <p>{t("marketing:guidelines.clause02.p2")}</p>
        </>
      ),
    },
    {
      number: "03",
      titlePreKey: "guidelines.clause03.titlePre",
      titleEmKey: "guidelines.clause03.titleEm",
      body: (
        <>
          <p>{t("marketing:guidelines.clause03.p1")}</p>
          <p>{t("marketing:guidelines.clause03.p2")}</p>
          <p>
            <b>{t("marketing:guidelines.clause03.p3Lead")}</b>{" "}
            {t("marketing:guidelines.clause03.p3Rest")}
          </p>
        </>
      ),
    },
    {
      number: "04",
      titlePreKey: "guidelines.clause04.titlePre",
      titleEmKey: "guidelines.clause04.titleEm",
      body: (
        <>
          <p>{t("marketing:guidelines.clause04.p1")}</p>
          <p>{t("marketing:guidelines.clause04.p2")}</p>
        </>
      ),
    },
    {
      number: "05",
      titlePreKey: "guidelines.clause05.titlePre",
      titleEmKey: "guidelines.clause05.titleEm",
      body: (
        <>
          <p>{t("marketing:guidelines.clause05.p1")}</p>
          <p>{t("marketing:guidelines.clause05.p2")}</p>
        </>
      ),
    },
    {
      number: "06",
      titlePreKey: "guidelines.clause06.titlePre",
      titleEmKey: "guidelines.clause06.titleEm",
      body: (
        <>
          <p>{t("marketing:guidelines.clause06.p1")}</p>
          <p>{t("marketing:guidelines.clause06.p2")}</p>
        </>
      ),
    },
    {
      number: "07",
      titlePreKey: "guidelines.clause07.titlePre",
      titleEmKey: "guidelines.clause07.titleEm",
      body: (
        <>
          <p>{t("marketing:guidelines.clause07.p1")}</p>
          <div className={s.hardLines}>
            <div className={s.hlHead}>
              {t("marketing:guidelines.clause07.hardLinesHead")}
            </div>
            <ul>
              <li>{t("marketing:guidelines.clause07.li1")}</li>
              <li>{t("marketing:guidelines.clause07.li2")}</li>
              <li>{t("marketing:guidelines.clause07.li3")}</li>
              <li>{t("marketing:guidelines.clause07.li4")}</li>
              <li>{t("marketing:guidelines.clause07.li5")}</li>
              <li>{t("marketing:guidelines.clause07.li6")}</li>
            </ul>
          </div>
        </>
      ),
    },
  ];
}

export function GuidelinesPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const clauses = useMemo(() => buildClauses(t), [t]);
  const revisedDate = fmt.date(REVISED_DATE, {
    month: "long",
    year: "numeric",
  });
  const pageTitle = t("marketing:guidelines.meta.title");
  const pageDescription = t("marketing:guidelines.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.guidelines },
        ])}
      />
      <PageHero
        eyebrow={t("marketing:guidelines.hero.eyebrow")}
        title={
          <Translation
            i18nKey="marketing:guidelines.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:guidelines.hero.sub")}
      />

      <div className="wrap">
        <div className={s.content}>
          <div className={s.updated}>
            <span className={s.uDot} />{" "}
            {t("marketing:guidelines.updatedMeta", { date: revisedDate })}
          </div>
          {clauses.map((c) => (
            <div key={c.number} className={s.clause}>
              <div className={s.clauseNum}>{c.number}</div>
              <div>
                <h2>
                  {t(`marketing:${c.titlePreKey}`)}
                  <em>{t(`marketing:${c.titleEmKey}`)}</em>
                </h2>
                {c.body}
              </div>
            </div>
          ))}
          <hr className={s.divider} />
          <div className={s.clause}>
            <div
              className={s.clauseNum}
              style={{ color: "rgba(74,140,111,.4)" }}
            >
              <FiArrowRight aria-hidden />
            </div>
            <div>
              <h2>
                {t("marketing:guidelines.final.titlePre")}
                <em>{t("marketing:guidelines.final.titleEm")}</em>
              </h2>
              <p>
                <Translation
                  i18nKey="marketing:guidelines.final.p1"
                  components={{ b: <b /> }}
                />
              </p>
              <p>{t("marketing:guidelines.final.p2")}</p>
            </div>
          </div>
        </div>
      </div>

      <Outro
        title={
          <Translation
            i18nKey="marketing:guidelines.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:guidelines.outro.sub")}
      >
        <Button size="lg" to={routes.homepage}>
          {t("marketing:guidelines.outro.backCta")}
        </Button>
      </Outro>
    </PageShell>
  );
}
