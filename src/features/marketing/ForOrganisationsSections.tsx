import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./ForOrganisationsPage.module.css";

export function TiersSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
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
          <Reveal className={styles.tier} delay={0}>
            <div className={styles.tierName}>
              {t("marketing:forOrgs.tiers.employer.name")}
            </div>
            <div>
              <div className={styles.tierPrice}>
                €<em>2.4</em>k
              </div>
              <div className={styles.tierPricePeriod}>
                {t("marketing:forOrgs.tiers.employer.pricePeriod")}
              </div>
            </div>
            <p className={styles.tierDek}>
              {t("marketing:forOrgs.tiers.employer.dek")}
            </p>
            <ul className={styles.tierList}>
              <li>
                <Translation
                  i18nKey="marketing:forOrgs.tiers.employer.list1"
                  components={{ b: <b /> }}
                />
              </li>
              <li>{t("marketing:forOrgs.tiers.employer.list2")}</li>
              <li>{t("marketing:forOrgs.tiers.employer.list3")}</li>
              <li>{t("marketing:forOrgs.tiers.employer.list4")}</li>
              <li>{t("marketing:forOrgs.tiers.employer.list5")}</li>
            </ul>
            <p className={styles.tierFootNote}>
              {t("marketing:forOrgs.tiers.employer.footnote")}
            </p>
            <Button
              type="button"
              variant="ghost"
              className={styles.tierBtn}
              onClick={() =>
                showToast(
                  t("marketing:forOrgs.tiers.employer.reviewToast"),
                  "info",
                )
              }
            >
              {t("marketing:forOrgs.tiers.employer.reviewCta")}
            </Button>
            <Link
              to={`${routes.company}/atelier-pulso`}
              className={styles.tierExample}
            >
              {t("marketing:forOrgs.tiers.employer.exampleCta")}
            </Link>
          </Reveal>

          <Reveal
            className={`${styles.tier} ${styles.tierFeatured}`}
            delay={60}
          >
            <div className={styles.tierName}>
              <Translation
                i18nKey="marketing:forOrgs.tiers.partner.name"
                components={{ em: <em /> }}
              />
            </div>
            <div>
              <div className={styles.tierPrice}>
                <Translation
                  i18nKey="marketing:forOrgs.tiers.partner.price"
                  components={{ em: <em /> }}
                />
              </div>
              <div className={styles.tierPricePeriod}>
                {t("marketing:forOrgs.tiers.partner.pricePeriod")}
              </div>
            </div>
            <p className={styles.tierDek}>
              {t("marketing:forOrgs.tiers.partner.dek")}
            </p>
            <ul className={styles.tierList}>
              <li>
                <Translation
                  i18nKey="marketing:forOrgs.tiers.partner.list1"
                  components={{ b: <b /> }}
                />
              </li>
              <li>{t("marketing:forOrgs.tiers.partner.list2")}</li>
              <li>{t("marketing:forOrgs.tiers.partner.list3")}</li>
              <li>{t("marketing:forOrgs.tiers.partner.list4")}</li>
              <li>
                <Translation
                  i18nKey="marketing:forOrgs.tiers.partner.list5"
                  components={{ b: <b /> }}
                />
              </li>
            </ul>
            <p className={styles.tierFootNote}>
              <Translation
                i18nKey="marketing:forOrgs.tiers.partner.footnote"
                components={{ b: <b /> }}
              />
            </p>
            <Button
              href="#start"
              variant="primary"
              className={styles.tierBtn}
              style={{ background: "var(--accent)", color: "var(--cream)" }}
            >
              {t("marketing:forOrgs.tiers.partner.proposeCta")}
            </Button>
          </Reveal>

          <Reveal className={styles.tier} delay={120}>
            <div className={styles.tierName}>
              {t("marketing:forOrgs.tiers.funder.name")}
            </div>
            <div>
              <div className={styles.tierPrice}>
                €<em>15</em>k+
              </div>
              <div className={styles.tierPricePeriod}>
                {t("marketing:forOrgs.tiers.funder.pricePeriod")}
              </div>
            </div>
            <p className={styles.tierDek}>
              {t("marketing:forOrgs.tiers.funder.dek")}
            </p>
            <ul className={styles.tierList}>
              <li>{t("marketing:forOrgs.tiers.funder.list1")}</li>
              <li>{t("marketing:forOrgs.tiers.funder.list2")}</li>
              <li>{t("marketing:forOrgs.tiers.funder.list3")}</li>
              <li>{t("marketing:forOrgs.tiers.funder.list4")}</li>
              <li>{t("marketing:forOrgs.tiers.funder.list5")}</li>
            </ul>
            <p className={styles.tierFootNote}>
              {t("marketing:forOrgs.tiers.funder.footnote")}
            </p>
            <Button
              type="button"
              variant="ghost"
              className={styles.tierBtn}
              onClick={() =>
                showToast(
                  t("marketing:forOrgs.tiers.funder.discussToast"),
                  "info",
                )
              }
            >
              {t("marketing:forOrgs.tiers.funder.discussCta")}
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
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
