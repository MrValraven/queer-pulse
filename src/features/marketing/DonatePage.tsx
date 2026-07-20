import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, Outro, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { DonateModal } from "./DonateModal";
import { ALLOCATION, AMOUNTS, TRUST } from "./donate.data";
import styles from "./DonatePage.module.css";

export function DonatePage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [monthly, setMonthly] = useState(true);
  const [selected, setSelected] = useState(1);
  const [giving, setGiving] = useState(false);

  const selectedAmount = AMOUNTS[selected]!.value;
  const pageTitle = t("marketing:donate.meta.title");
  const pageDescription = t("marketing:donate.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: pageTitle, path: routes.donate },
        ])}
      />
      <header className={styles.hero}>
        <div className="wrap">
          <Reveal className={styles.eyebrow}>
            {t("marketing:donate.hero.eyebrow")}
          </Reveal>
          <Reveal as="h1" className={styles.title} delay={60}>
            <Translation
              i18nKey="marketing:donate.hero.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.lead} delay={120}>
            {t("marketing:donate.hero.lead")}
          </Reveal>

          <Reveal className={styles.card} delay={160}>
            <div className={styles.toggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${monthly ? styles.toggleOn : ""}`}
                onClick={() => setMonthly(true)}
              >
                {t("marketing:donate.toggle.monthly")}
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${!monthly ? styles.toggleOn : ""}`}
                onClick={() => setMonthly(false)}
              >
                {t("marketing:donate.toggle.oneOff")}
              </button>
            </div>
            <div className={styles.amounts}>
              {AMOUNTS.map((amount, index) => (
                <button
                  key={amount.value}
                  type="button"
                  className={`${styles.amount} ${selected === index ? styles.amountOn : ""}`}
                  onClick={() => setSelected(index)}
                >
                  {amount.featured && (
                    <span className={styles.ribbon}>{t(amount.noteKey)}</span>
                  )}
                  <div className={styles.amountVal}>
                    {fmt.currency(amount.value)}
                  </div>
                  {!amount.featured && (
                    <div className={styles.amountNote}>{t(amount.noteKey)}</div>
                  )}
                </button>
              ))}
            </div>
            <Button
              variant="jade"
              size="lg"
              onClick={() => setGiving(true)}
              style={{ width: "100%" }}
            >
              {monthly
                ? t("marketing:donate.giveCta.monthly", {
                    amount: fmt.currency(selectedAmount),
                  })
                : t("marketing:donate.giveCta.oneOff", {
                    amount: fmt.currency(selectedAmount),
                  })}
            </Button>
          </Reveal>
        </div>
      </header>

      <section className={styles.section}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            <Translation
              i18nKey="marketing:donate.allocation.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            {t("marketing:donate.allocation.lead")}
          </Reveal>
          <div className={styles.alloc}>
            {ALLOCATION.map((row, index) => (
              <Reveal
                key={row.labelKey}
                className={styles.allocRow}
                delay={index * 50}
              >
                <div className={styles.allocPct}>{row.pct}</div>
                <div>
                  <div className={styles.allocLabel}>{t(row.labelKey)}</div>
                  <div className={styles.allocBody}>{t(row.bodyKey)}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionPaper}`}>
        <div className="wrap">
          <Reveal as="h2" className={styles.h2}>
            <Translation
              i18nKey="marketing:donate.trust.title"
              components={{ em: <em /> }}
            />
          </Reveal>
          <Reveal as="p" className={styles.leadP} delay={60}>
            {t("marketing:donate.trust.lead")}
          </Reveal>
          <div className={styles.trust}>
            {TRUST.map((item, index) => (
              <Reveal
                key={item.titleKey}
                className={styles.trustCard}
                delay={index * 55}
              >
                <div className={styles.trustIcon}>
                  <item.icon />
                </div>
                <div className={styles.trustTitle}>{t(item.titleKey)}</div>
                <div className={styles.trustBody}>{t(item.bodyKey)}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Outro
        title={
          <Translation
            i18nKey="marketing:donate.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:donate.outro.sub")}
      >
        <Button to={routes.volunteer} variant="primary" size="lg">
          {t("marketing:donate.outro.volunteerCta")}
        </Button>
        <Button to={routes.transparencyReport} variant="ghost-dark" size="lg">
          {t("marketing:donate.outro.readFiguresCta")}
        </Button>
      </Outro>

      {giving && (
        <DonateModal
          amount={AMOUNTS[selected]!.value}
          monthly={monthly}
          onClose={() => setGiving(false)}
        />
      )}
    </PageShell>
  );
}
