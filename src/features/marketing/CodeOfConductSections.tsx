import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PACT, LADDER } from "./codeOfConductPage.data";
import styles from "./CodeOfConductPage.module.css";

export function CocPactSection() {
  const { t } = useTranslation();
  return (
    <>
      <section className={styles.sec} id="scope">
        <div className={styles.secNum}>
          §<em>01</em>
        </div>
        <h2>
          <Translation
            i18nKey="marketing:coc.scope.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>
          <Translation
            i18nKey="marketing:coc.scope.p1"
            components={{ strong: <strong /> }}
          />
        </p>
        <p>
          <Translation
            i18nKey="marketing:coc.scope.p2"
            components={{ em: <em /> }}
          />
        </p>
        <p>
          <Translation
            i18nKey="marketing:coc.scope.p3"
            components={{ em: <em /> }}
          />
        </p>
      </section>

      <section className={styles.sec} id="pact">
        <div className={styles.secNum}>
          §<em>02</em>
        </div>
        <h2>
          <Translation
            i18nKey="marketing:coc.pact.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>{t("marketing:coc.pact.lead")}</p>
        <div className={styles.pactList}>
          {PACT.map((p) => (
            <div className={styles.pactRow} key={p.n}>
              <div className={styles.pactNum}>
                {p.n[0]}
                <em>{p.n[1]}</em>
              </div>
              <div>
                <b>{t(`marketing:${p.titleKey}`)}</b>
                <p>{t(`marketing:${p.bodyKey}`)}</p>
              </div>
            </div>
          ))}
        </div>
        <p>{t("marketing:coc.pact.closing")}</p>
      </section>
    </>
  );
}

export function CocHarmSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec} id="harm">
      <div className={styles.secNum}>
        §<em>03</em>
      </div>
      <h2>
        <Translation
          i18nKey="marketing:coc.harm.title"
          components={{ em: <em /> }}
        />
      </h2>
      <h3>{t("marketing:coc.harm.actOnHeading")}</h3>
      <ul className={styles.list}>
        <li>
          <b>{t("marketing:coc.harm.actOn.personalAttacks.lead")}</b>{" "}
          {t("marketing:coc.harm.actOn.personalAttacks.rest")}
        </li>
        <li>
          <b>{t("marketing:coc.harm.actOn.sustainedHarassment.lead")}</b>{" "}
          {t("marketing:coc.harm.actOn.sustainedHarassment.rest")}
        </li>
        <li>
          <b>{t("marketing:coc.harm.actOn.doxxing.lead")}</b>{" "}
          {t("marketing:coc.harm.actOn.doxxing.rest")}
        </li>
        <li>
          <b>{t("marketing:coc.harm.actOn.intimidation.lead")}</b>{" "}
          {t("marketing:coc.harm.actOn.intimidation.rest")}
        </li>
        <li>
          <b>{t("marketing:coc.harm.actOn.badFaithFraming.lead")}</b>{" "}
          {t("marketing:coc.harm.actOn.badFaithFraming.rest")}
        </li>
      </ul>
      <h3>{t("marketing:coc.harm.frictionHeading")}</h3>
      <ul className={styles.list}>
        <li>
          <b>{t("marketing:coc.harm.friction.disagreement.lead")}</b>{" "}
          <Translation
            i18nKey="marketing:coc.harm.friction.disagreement.rest"
            components={{ em: <em /> }}
          />
        </li>
        <li>
          <b>{t("marketing:coc.harm.friction.hurtFeelings.lead")}</b>{" "}
          {t("marketing:coc.harm.friction.hurtFeelings.rest")}
        </li>
        <li>
          <b>{t("marketing:coc.harm.friction.criticism.lead")}</b>{" "}
          {t("marketing:coc.harm.friction.criticism.rest")}
        </li>
        <li>
          <b>{t("marketing:coc.harm.friction.politicalViews.lead")}</b>{" "}
          {t("marketing:coc.harm.friction.politicalViews.rest")}
        </li>
      </ul>
      <p>
        <Translation
          i18nKey="marketing:coc.harm.closing"
          components={{ em: <em /> }}
        />
      </p>
    </section>
  );
}

export function CocEnforceSection() {
  const { t } = useTranslation();
  return (
    <section className={styles.sec} id="enforce">
      <div className={styles.secNum}>
        §<em>04</em>
      </div>
      <h2>
        <Translation
          i18nKey="marketing:coc.enforce.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p>{t("marketing:coc.enforce.lead")}</p>
      <div className={styles.ladder}>
        {LADDER.map((l, i) => (
          <div className={styles.ladderStep} key={l.n}>
            <div
              className={[styles.ladderN, i >= 3 && styles.ladderNPlum]
                .filter(Boolean)
                .join(" ")}
            >
              {l.n}
            </div>
            <div>
              <b>{t(`marketing:${l.titleKey}`)}</b>
              <p>
                <Translation
                  i18nKey={`marketing:${l.bodyKey}`}
                  components={{ em: <em /> }}
                />
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface CocReportCtaProps {
  reportPath: string;
  emergencyPath: string;
  onCrisisChat: () => void;
}

export function CocReportCta({
  reportPath,
  emergencyPath,
  onCrisisChat,
}: CocReportCtaProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.reportCta}>
      <h3>
        <Translation
          i18nKey="marketing:coc.report.title"
          components={{ em: <em /> }}
        />
      </h3>
      <p>{t("marketing:coc.report.body")}</p>
      <div className={styles.reportActions}>
        <Button to={reportPath} variant="primary">
          {t("marketing:coc.report.fileCta")}
        </Button>
        <Button type="button" variant="ghost-dark" onClick={onCrisisChat}>
          {t("marketing:coc.report.crisisCta")}
        </Button>
        <Button to={emergencyPath} variant="ghost-dark">
          {t("marketing:coc.report.emergencyCta")}
        </Button>
      </div>
    </div>
  );
}

interface CocChangesProps {
  changelogPath: string;
  onDownload: () => void;
}

const PUBLISHED_DATE = new Date(2026, 0, 14);
const CHANGELOG_V21_DATE = new Date(2026, 0, 1);
const CHANGELOG_V20_DATE = new Date(2025, 7, 1);
const CHANGELOG_V14_DATE = new Date(2025, 2, 1);
const CHANGELOG_V10_DATE = new Date(2024, 2, 1);
const RATIFIED_DATE = new Date(2026, 0, 14);

export function CocChangesSection({
  changelogPath,
  onDownload,
}: CocChangesProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const monthYear = { month: "short", year: "numeric" } as const;
  return (
    <>
      <section className={styles.sec} id="appeal">
        <div className={styles.secNum}>
          §<em>05</em>
        </div>
        <h2>
          <Translation
            i18nKey="marketing:coc.appeal.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>
          <Translation
            i18nKey="marketing:coc.appeal.p1"
            components={{ strong: <strong /> }}
          />
        </p>
        <p>
          <Translation
            i18nKey="marketing:coc.appeal.p2"
            components={{ strong: <strong /> }}
          />
        </p>
      </section>

      <section className={styles.sec} id="offplatform">
        <div className={styles.secNum}>
          §<em>06</em>
        </div>
        <h2>
          <Translation
            i18nKey="marketing:coc.offplatform.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>{t("marketing:coc.offplatform.lead")}</p>
        <ul className={styles.list}>
          <li>
            <b>{t("marketing:coc.offplatform.case1.lead")}</b>{" "}
            {t("marketing:coc.offplatform.case1.rest")}
          </li>
          <li>
            <b>{t("marketing:coc.offplatform.case2.lead")}</b>{" "}
            <Translation
              i18nKey="marketing:coc.offplatform.case2.rest"
              components={{ em: <em /> }}
            />
          </li>
        </ul>
        <p>
          <Translation
            i18nKey="marketing:coc.offplatform.closing"
            components={{ em: <em /> }}
          />
        </p>
      </section>

      <section className={styles.sec} id="changes">
        <div className={styles.secNum}>
          §<em>07</em>
        </div>
        <h2>
          <Translation
            i18nKey="marketing:coc.changes.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p>
          {t("marketing:coc.changes.p1", {
            date: fmt.date(PUBLISHED_DATE, {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
          })}
        </p>
        <ul className={styles.list}>
          <li>
            <b>
              {t("marketing:coc.changelog.v21.lead", {
                date: fmt.date(CHANGELOG_V21_DATE, monthYear),
              })}
            </b>{" "}
            {t("marketing:coc.changelog.v21.rest")}
          </li>
          <li>
            <b>
              {t("marketing:coc.changelog.v20.lead", {
                date: fmt.date(CHANGELOG_V20_DATE, monthYear),
              })}
            </b>{" "}
            {t("marketing:coc.changelog.v20.rest")}
          </li>
          <li>
            <b>
              {t("marketing:coc.changelog.v14.lead", {
                date: fmt.date(CHANGELOG_V14_DATE, monthYear),
              })}
            </b>{" "}
            {t("marketing:coc.changelog.v14.rest")}
          </li>
          <li>
            <b>
              {t("marketing:coc.changelog.v10.lead", {
                date: fmt.date(CHANGELOG_V10_DATE, monthYear),
              })}
            </b>{" "}
            {t("marketing:coc.changelog.v10.rest")}
          </li>
        </ul>
        <p>
          <Translation
            i18nKey="marketing:coc.changes.seeChangelog"
            components={{ changelogLink: <Link to={changelogPath} /> }}
          />
        </p>
      </section>

      <div className={styles.version}>
        <b>{t("marketing:coc.version.label")}</b>{" "}
        {t("marketing:coc.version.ratifiedMeta", {
          date: fmt.date(RATIFIED_DATE, {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        })}{" "}
        · <a onClick={onDownload}>{t("marketing:coc.version.downloadCta")}</a> ·{" "}
        {t("marketing:coc.version.readManifesto")}
      </div>
    </>
  );
}
