import { FiCheck } from "react-icons/fi";
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  Button,
  LoadErrorState,
  Reveal,
  Select,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useOrgTiers } from "./api/useOrgTiers";
import { useSubmitInquiry } from "./api/useSubmitInquiry";
import type { OrgTier } from "./orgTiers.data";
import styles from "./ForOrganisationsPage.module.css";

export function TiersSection() {
  const { t } = useTranslation();
  const { tiers, isError, refetch } = useOrgTiers();

  // DES-22: the tiers ARE this section. A failed read that returned nothing
  // would hide the whole thing, reading as "we offer no partnerships".
  if (isError) {
    return (
      <section className={styles.doSection}>
        <div className={styles.doInner}>
          <LoadErrorState onRetry={refetch} />
        </div>
      </section>
    );
  }

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
                  <li key={bullet}>
                    <FiCheck className={styles.tierMark} aria-hidden />
                    {bullet}
                  </li>
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
        style={{ background: "var(--accent)", color: "rgb(var(--cream-rgb))" }}
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

const INTEREST_KEYS = ["operational", "employer", "funding", "other"] as const;
type InterestKey = (typeof INTEREST_KEYS)[number];

export function PartnerContactForm() {
  const { t } = useTranslation();
  const fieldId = useId();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const submitInquiry = useSubmitInquiry();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    org: string;
    email: string;
    interest: InterestKey;
    message: string;
  }>({ name: "", org: "", email: "", interest: "operational", message: "" });

  const handleSubmit = () => {
    if (submitInquiry.isPending) return;
    // Demo keeps the prototype's toast-only acknowledgement; live persists the
    // inquiry and then shows an honest success panel.
    if (demoMode) {
      showToast(t("marketing:forOrgs.form.toast"), "success", 4500);
      return;
    }
    submitInquiry.mutate(
      {
        kind: "partner",
        name: form.name.trim(),
        email: form.email.trim(),
        orgName: form.org.trim() || undefined,
        subject: t(`marketing:forOrgs.form.interest.${form.interest}`),
        body: form.message.trim(),
      },
      {
        onSuccess: () => setSent(true),
        onError: () => showToast(t("marketing:forOrgs.form.error"), "error"),
      },
    );
  };

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
        {sent ? (
          <div className={styles.partnerForm}>
            <h3>
              <Translation
                i18nKey="marketing:forOrgs.form.sent.title"
                components={{ em: <em /> }}
              />
            </h3>
            <p>{t("marketing:forOrgs.form.sent.body")}</p>
          </div>
        ) : (
          <form
            className={styles.partnerForm}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className={styles.field}>
              <label htmlFor={`${fieldId}-name`}>
                {t("marketing:forOrgs.form.nameLabel")}
              </label>
              <input
                id={`${fieldId}-name`}
                type="text"
                placeholder={t("marketing:forOrgs.form.namePlaceholder")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${fieldId}-org`}>
                {t("marketing:forOrgs.form.orgLabel")}
              </label>
              <input
                id={`${fieldId}-org`}
                type="text"
                placeholder={t("marketing:forOrgs.form.orgPlaceholder")}
                value={form.org}
                onChange={(e) => setForm({ ...form, org: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${fieldId}-email`}>
                {t("marketing:forOrgs.form.emailLabel")}
              </label>
              <input
                id={`${fieldId}-email`}
                type="email"
                placeholder={t("marketing:forOrgs.form.emailPlaceholder")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${fieldId}-interest`}>
                {t("marketing:forOrgs.form.interestLabel")}
              </label>
              <Select
                id={`${fieldId}-interest`}
                options={INTEREST_KEYS.map((interestKey) => ({
                  value: interestKey,
                  label: t(`marketing:forOrgs.form.interest.${interestKey}`),
                }))}
                value={form.interest}
                onChange={(value) =>
                  setForm({ ...form, interest: value as InterestKey })
                }
              />
            </div>
            <div className={styles.field}>
              <label htmlFor={`${fieldId}-message`}>
                {t("marketing:forOrgs.form.messageLabel")}
              </label>
              <textarea
                id={`${fieldId}-message`}
                placeholder={t("marketing:forOrgs.form.messagePlaceholder")}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={4}
                required
              />
            </div>
            <Button
              variant="primary"
              className={styles.formBtn}
              type="submit"
              disabled={submitInquiry.isPending}
            >
              {submitInquiry.isPending
                ? t("marketing:forOrgs.form.sendingCta")
                : t("marketing:forOrgs.form.submitCta")}
            </Button>
            <p className={styles.formSmall}>
              {t("marketing:forOrgs.form.small")}
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
