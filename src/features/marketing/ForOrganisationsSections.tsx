import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useOrgTiers } from "./api/useOrgTiers";
import type { OrgTier } from "./orgTiers.data";
import styles from "./ForOrganisationsPage.module.css";

export function TiersSection() {
  const { t } = useTranslation();
  const { tiers } = useOrgTiers();

  if (tiers.length === 0) return null;

  return (
    <section className={styles.doSection}>
      <div className={styles.doInner}>
        <Reveal as="h2" className={styles.doH2}>
          <Translation
            i18nKey="marketing:forOrgs.tiers.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.doSub} delay={60}>
          {t("marketing:forOrgs.tiers.sub")}
        </Reveal>
        <div className={styles.tierGrid}>
          {tiers.map((tier, index) => (
            <Reveal
              key={tier.slug}
              className={
                tier.featured
                  ? `${styles.tier} ${styles.tierFeatured}`
                  : styles.tier
              }
              delay={index * 60}
            >
              <div className={styles.tierName}>{tier.name}</div>
              <div>
                <div className={styles.tierPrice}>{tier.priceDisplay}</div>
                <div className={styles.tierPricePeriod}>{tier.pricePeriod}</div>
              </div>
              <p className={styles.tierDek}>{tier.dek}</p>
              <ul className={styles.tierList}>
                {tier.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              <p className={styles.tierFootNote}>{tier.footnote}</p>
              <OrgTierCtaButton cta={tier.cta} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OrgTierCtaButton({ cta }: { cta: OrgTier["cta"] }) {
  const { showToast } = useToast();
  if (cta.kind === "link") {
    return (
      <Button to={cta.to} variant="ghost" className={styles.tierBtn}>
        {cta.label}
      </Button>
    );
  }
  if (cta.kind === "propose") {
    return (
      <Button
        href="#start"
        variant="primary"
        className={styles.tierBtn}
        style={{ background: "var(--accent)", color: "var(--cream)" }}
      >
        {cta.label}
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="ghost"
      className={styles.tierBtn}
      onClick={() => showToast(cta.label, "info")}
    >
      {cta.label}
    </Button>
  );
}

export function PartnerContactForm() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  return (
    <section className={styles.ctaSection} id="start">
      <div className={styles.ctaInner}>
        <Reveal>
          <h2>
            <Translation
              i18nKey="marketing:forOrgs.cta.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("marketing:forOrgs.cta.body")}</p>
          <ul className={styles.ctaList}>
            <li>{t("marketing:forOrgs.cta.list1")}</li>
            <li>{t("marketing:forOrgs.cta.list2")}</li>
            <li>
              <Translation
                i18nKey="marketing:forOrgs.cta.pressInquiry"
                components={{ a: <Link to={routes.pressKit} /> }}
              />
            </li>
            <li>
              <Translation
                i18nKey="marketing:forOrgs.cta.partnerQuestion"
                components={{ a: <Link to={routes.contact} /> }}
              />
            </li>
          </ul>
        </Reveal>
        <form
          className={styles.partnerForm}
          onSubmit={(e) => {
            e.preventDefault();
            showToast(t("marketing:forOrgs.form.toast"), "success", 4500);
          }}
        >
          <div className={styles.field}>
            <label>{t("marketing:forOrgs.form.nameLabel")}</label>
            <input
              type="text"
              placeholder={t("marketing:forOrgs.form.namePlaceholder")}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("marketing:forOrgs.form.orgLabel")}</label>
            <input
              type="text"
              placeholder={t("marketing:forOrgs.form.orgPlaceholder")}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("marketing:forOrgs.form.emailLabel")}</label>
            <input
              type="email"
              placeholder={t("marketing:forOrgs.form.emailPlaceholder")}
              required
            />
          </div>
          <div className={styles.field}>
            <label>{t("marketing:forOrgs.form.interestLabel")}</label>
            <select
              defaultValue={t("marketing:forOrgs.form.interest.operational")}
            >
              <option>
                {t("marketing:forOrgs.form.interest.operational")}
              </option>
              <option>{t("marketing:forOrgs.form.interest.employer")}</option>
              <option>{t("marketing:forOrgs.form.interest.funding")}</option>
              <option>{t("marketing:forOrgs.form.interest.other")}</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>{t("marketing:forOrgs.form.messageLabel")}</label>
            <textarea
              placeholder={t("marketing:forOrgs.form.messagePlaceholder")}
              rows={4}
            />
          </div>
          <Button variant="primary" className={styles.formBtn} type="submit">
            {t("marketing:forOrgs.form.submitCta")}
          </Button>
          <p className={styles.formSmall}>
            {t("marketing:forOrgs.form.small")}
          </p>
        </form>
      </div>
    </section>
  );
}
