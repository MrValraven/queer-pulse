import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  buildDecisionRows,
  buildDeedParagraphs,
  buildLedgerRows,
  buildPrinciples,
  buildSplitLegend,
  curators,
  splitSegments,
} from "./cinemaAbout.data";
import styles from "./CinemaAboutPage.module.css";

export function AboutHero() {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <div className={styles.heroEb}>{t("cinema:about.hero.eyebrow")}</div>
        <h1 className={styles.heroTitle}>
          <Translation
            i18nKey="cinema:about.hero.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.heroSub}>
          <Translation
            i18nKey="cinema:about.hero.sub"
            components={{ em: <em /> }}
          />
        </p>
      </div>
    </section>
  );
}

export function TheDeed() {
  const { t } = useTranslation();
  const deedParagraphs = useMemo(() => buildDeedParagraphs(t), [t]);

  return (
    <section className={styles.deed}>
      <div className={`wrap ${styles.deedInner}`}>
        <div className={styles.deedLabel}>
          <Translation
            i18nKey="cinema:about.deed.label"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.deedText}>{deedParagraphs}</div>
      </div>
    </section>
  );
}

export function Principles() {
  const principles = useMemo(() => buildPrinciples(), []);

  return (
    <section className={styles.principles}>
      <div className="wrap">
        <div className={styles.prHead}>
          <h2>
            <Translation
              i18nKey="cinema:about.principles.title"
              components={{ em: <em /> }}
            />
          </h2>
        </div>
        <div className={styles.prGrid}>
          {principles.map((p) => (
            <div key={p.num} className={styles.prCard}>
              <div className={styles.prNum}>{p.num}</div>
              <div className={styles.prTitle}>{p.title}</div>
              <div className={styles.prBody}>{p.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SplitVisual() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const splitLegend = useMemo(() => buildSplitLegend(fmt, t), [fmt, t]);
  const rentPrice = fmt.currency(3);
  const buyPrice = fmt.currency(8);

  const segClass: Record<string, string | undefined> = {
    fm: styles.segFm,
    pay: styles.segPay,
    host: styles.segHost,
  };
  return (
    <section className={styles.split}>
      <div className={`wrap ${styles.splitInner}`}>
        <div className={styles.svText}>
          <h2>
            <Translation
              i18nKey="cinema:about.split.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>
            {t("cinema:about.split.body1", {
              rentPrice,
              filmmakerShare: fmt.currency(2.4),
            })}
          </p>
          <p>
            <Translation
              i18nKey="cinema:about.split.body2"
              components={{ em: <em /> }}
              values={{ buyPrice, buyFilmmakerShare: fmt.currency(6.4) }}
            />
          </p>
          <p>{t("cinema:about.split.body3")}</p>
          <Link to={routes.governance} className={styles.svLink}>
            {t("cinema:about.split.viewAccountsCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
        <div className={styles.svVisual}>
          <div className={styles.svvHead}>
            {t("cinema:about.split.exampleHeading", { price: rentPrice })}
          </div>
          <div className={styles.svvLabel}>
            {t("cinema:about.split.divideLabel", { price: rentPrice })}
          </div>
          <div className={styles.svvBar}>
            {splitSegments.map((s) => (
              <div
                key={s.tone}
                className={`${styles.svvSeg} ${segClass[s.tone]}`}
                style={{ flex: `0 0 ${s.pct}%` }}
              />
            ))}
          </div>
          <div className={styles.svvLegend}>
            {splitLegend.map((item) => (
              <div key={item.label}>
                <div className={styles.svvV}>{item.value}</div>
                <div className={styles.svvK}>{item.label}</div>
              </div>
            ))}
          </div>
          <div className={styles.svvNote}>
            {t("cinema:about.split.tipsNote")}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CuratorsCouncil() {
  const { t } = useTranslation();
  const avClass: Record<string, string | undefined> = {
    coral: styles.avCoral,
    jade: styles.avJade,
    plum: styles.avPlum,
  };
  return (
    <section className={styles.council}>
      <div className="wrap">
        <h2>
          <Translation
            i18nKey="cinema:about.council.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.councilSub}>{t("cinema:about.council.sub")}</p>
        <div className={styles.councilGrid}>
          {curators.map((c) => (
            <Link
              key={c.initials}
              to={`${routes.cinemaCurator}/${c.slug}`}
              className={styles.curatorCard}
            >
              <div className={styles.ccHead}>
                <div className={`${styles.ccAv} ${avClass[c.tone]}`}>
                  {c.initials}
                </div>
                <div>
                  <div className={styles.ccName}>{c.name}</div>
                  <div className={styles.ccRole}>{c.role}</div>
                  <div className={styles.ccPron}>{c.pronouns}</div>
                </div>
              </div>
              <div className={styles.ccBio}>{c.bio}</div>
              <div className={styles.ccFocus}>
                {c.focus.map((tag) => (
                  <span key={tag} className={styles.focusTag}>
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Governance() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const ledgerRows = useMemo(() => buildLedgerRows(t, fmt), [t, fmt]);
  const decisionRows = useMemo(() => buildDecisionRows(t), [t]);
  const ledgerMonth = fmt.date(new Date(2026, 5, 1), {
    month: "long",
    year: "numeric",
  });

  return (
    <section className={styles.gov}>
      <div className={`wrap ${styles.govInner}`}>
        <div className={styles.govBlock}>
          <h3>
            <Translation
              i18nKey="cinema:about.gov.ledgerTitle"
              components={{ em: <em /> }}
              values={{ month: ledgerMonth }}
            />
          </h3>
          {ledgerRows.map((row) => (
            <div key={row.k} className={styles.govRow}>
              <span className="k">{row.k}</span>
              <span className="v">{row.v}</span>
            </div>
          ))}
          <div className={styles.govAction}>
            <Button variant="ghost-dark" to={routes.governance}>
              {t("cinema:about.gov.fullAccountsCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
        <div className={styles.govBlock}>
          <h3>
            <Translation
              i18nKey="cinema:about.gov.decisionsTitle"
              components={{ em: <em /> }}
            />
          </h3>
          {decisionRows.map((row) => (
            <div key={row.k} className={styles.govRow}>
              <span className="k">{row.k}</span>
              <span className="v">{row.v}</span>
            </div>
          ))}
          <div className={styles.govAction}>
            <Button variant="ghost-dark" to={routes.cinemaMembership}>
              {t("cinema:about.gov.rightsCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
