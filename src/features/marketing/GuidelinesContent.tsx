import { type ReactNode, useMemo } from "react";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import s from "./GuidelinesPage.module.css";

interface Clause {
  titlePreKey: string;
  titleEmKey: string;
  body: ReactNode;
}

const REVISED_DATE = new Date(2026, 5, 1);

/**
 * i18n Pattern B. Every clause is platform-authored governance chrome (the
 * Community Guidelines), so each paragraph/list item becomes a catalog key;
 * bodies that need emphasis split into lead/rest key pairs (e.g.
 * `reportLead`/`reportBody`, `p3Lead`/`p3Rest`) rather than one string.
 *
 * Order is content-authored, not the catalog key order: the hard-lines clause
 * (catalog key `clause07`) leads so the enforceable lines come first, followed
 * by `clause01`..`clause06`. Display numbers are derived from array position
 * in the render below, not from the catalog key suffix.
 */
function buildClauses(t: TFunction): Clause[] {
  return [
    {
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
          <p>
            <b>{t("marketing:guidelines.clause07.reportLead")}</b>{" "}
            {t("marketing:guidelines.clause07.reportBody")}
          </p>
        </>
      ),
    },
    {
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
      titlePreKey: "guidelines.clause06.titlePre",
      titleEmKey: "guidelines.clause06.titleEm",
      body: (
        <>
          <p>{t("marketing:guidelines.clause06.p1")}</p>
          <p>{t("marketing:guidelines.clause06.p2")}</p>
        </>
      ),
    },
  ];
}

/**
 * The Community Guidelines body — the "last updated" stamp, the numbered
 * clauses, and a closing thanks line. Deliberately free of page chrome (no
 * hero/meta/outro) so it renders identically inside the full `GuidelinesPage`
 * and inside the bottom-up `GuidelinesModal` opened from the invite form and
 * onboarding. The caller owns the surrounding wrapper.
 */
export function GuidelinesContent() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const clauses = useMemo(() => buildClauses(t), [t]);
  const revisedDate = fmt.date(REVISED_DATE, {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className={s.updated}>
        <span className={s.uDot} />{" "}
        {t("marketing:guidelines.updatedMeta", { date: revisedDate })}
      </div>
      {clauses.map((clause, index) => (
        <div key={clause.titleEmKey} className={s.clause}>
          <div className={s.clauseNum}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <div>
            <h2>
              {t(`marketing:${clause.titlePreKey}`)}
              <em>{t(`marketing:${clause.titleEmKey}`)}</em>
            </h2>
            {clause.body}
          </div>
        </div>
      ))}
      <hr className={s.divider} />
      <p className={s.thanks}>{t("marketing:guidelines.final.p2")}</p>
    </>
  );
}
