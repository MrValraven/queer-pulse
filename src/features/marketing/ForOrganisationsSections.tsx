import { FiCheck } from "react-icons/fi";
import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, LoadErrorState, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useOrgTiers } from "./api/useOrgTiers";
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

/**
 * The For Organisations page's partner ask (PRD-266).
 *
 * This section used to POST an `inquiries` row with `kind: "partner"`: a
 * second, parallel intake for the same request the real pipeline already
 * handles at `/about/partners/apply`. An organisation that used it got no
 * profile, no queue with a due clock, no triage assignment and no decision
 * notification, and staff worked two lists for one pipeline. The row was also
 * the last thing on the platform promising an email reply, which QueerPulse
 * does not send.
 *
 * IT HANDS OFF RATHER THAN SUBMITTING INLINE. The application endpoint
 * (`POST /partner-applications`) sits behind `ActiveMemberGuard` and writes a
 * NOT NULL `submitted_by_id`; the whole "you will hear back" half of the flow
 * — `GET /partner-applications/mine` and the decision notification — is
 * addressed to that member id, and the in-app bell is the only reply path
 * there is. Submitting the full application inline from a public marketing
 * page would therefore mean either an anonymous application nobody could ever
 * be told the answer to, or an authentication wall in the middle of a
 * marketing form. Sending the organisation to the real form keeps ONE intake.
 *
 * WHAT CARRIES ACROSS is the organisation's name, as `?org=`, and nothing
 * else. The application form asks for city, tagline, description, tags and
 * contact details in its own words; the old marketing form's "interested in"
 * enum maps onto none of them, and bending it into one would put a
 * mistranslated value in a field a reviewer reads as fact.
 *
 * An organisation that wants to ASK something rather than apply still has the
 * contact intake, linked in the list above — the same tracked `inquiries`
 * queue, under the `contact` kind, with its own admin console.
 */
export function PartnerApplyStart() {
  const { t } = useTranslation();
  const fieldId = useId();
  const navigate = useNavigate();
  const [organisationName, setOrganisationName] = useState("");

  const startApplication = () => {
    const trimmedName = organisationName.trim();
    void navigate(
      trimmedName
        ? `${routes.partnerApply}?org=${encodeURIComponent(trimmedName)}`
        : routes.partnerApply,
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
          <p>{t("marketing:forOrgs.apply.lead")}</p>
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
          onSubmit={(event) => {
            event.preventDefault();
            startApplication();
          }}
        >
          <div className={styles.field}>
            <label htmlFor={`${fieldId}-org`}>
              {t("marketing:forOrgs.form.orgLabel")}
            </label>
            <input
              id={`${fieldId}-org`}
              type="text"
              autoComplete="organization"
              placeholder={t("marketing:forOrgs.form.orgPlaceholder")}
              value={organisationName}
              onChange={(event) => setOrganisationName(event.target.value)}
            />
          </div>
          <Button variant="primary" className={styles.formBtn} type="submit">
            {t("marketing:partners.become.applyCta")}
          </Button>
          <p className={styles.formSmall}>
            {t("marketing:forOrgs.apply.note")}
          </p>
        </form>
      </div>
    </section>
  );
}
