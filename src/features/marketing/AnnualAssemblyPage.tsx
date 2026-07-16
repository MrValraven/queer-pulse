import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button, HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  AgendaSection,
  VoteSection,
  AttendCard,
  PastAssembliesSection,
} from "./AnnualAssemblySections";
import styles from "./AnnualAssemblyPage.module.css";

const TOTAL_SPOTS = 120;
const SPOTS_TAKEN = 87;

export function AnnualAssemblyPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [rsvped, setRsvped] = useState(false);
  const spotsLeft = TOTAL_SPOTS - (rsvped ? SPOTS_TAKEN + 1 : SPOTS_TAKEN);

  const toggleRsvp = () => {
    if (rsvped) {
      setRsvped(false);
      showToast(t("marketing:annualAssembly.toast.rsvpCancelled"), "info");
    } else {
      setRsvped(true);
      showToast(t("marketing:annualAssembly.toast.rsvpConfirmed"), "success");
    }
  };

  return (
    <PageShell>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <HubBackLink
            to={routes.governance}
            label={t("marketing:hub.governanceLabel")}
            tone="dark"
          />
          <div className={styles.eyebrow}>
            {t("marketing:annualAssembly.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="marketing:annualAssembly.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="marketing:annualAssembly.hero.dek"
              components={{ em: <em /> }}
            />
          </p>
          <div className={styles.meta}>
            <span>
              <b>14 — 15 Nov</b>
              {t("marketing:annualAssembly.hero.meta.datesLabel")}
            </span>
            <span>
              <b>
                <em>Atelier Pulso</em>
              </b>
              {t("marketing:annualAssembly.hero.meta.videoLink")}
            </span>
            <span>
              <b>1,847</b>
              {t("marketing:annualAssembly.hero.meta.eligibleLabel")}
            </span>
            <span>
              <b>
                <em>184</em>
              </b>
              {t("marketing:annualAssembly.hero.meta.quorumLabel")}
            </span>
          </div>
          <div className={styles.ctaRow}>
            <Button href="#vote" variant="primary">
              {t("marketing:annualAssembly.hero.voteCta", { count: 11 })}
            </Button>
            <Button
              type="button"
              variant={rsvped ? "jade" : "ghost-dark"}
              onClick={toggleRsvp}
            >
              {rsvped ? (
                <>
                  <FiCheck
                    aria-hidden
                    style={{ marginRight: 6, verticalAlign: "-2px" }}
                  />
                  {t("marketing:annualAssembly.hero.rsvpGoing")}
                </>
              ) : (
                t("marketing:annualAssembly.hero.rsvpCta", {
                  spotsLeft,
                  totalSpots: TOTAL_SPOTS,
                })
              )}
            </Button>
            <Button
              type="button"
              variant="ghost-dark"
              onClick={() =>
                showToast(t("marketing:annualAssembly.toast.openingZoom"), "info")
              }
            >
              {t("marketing:annualAssembly.hero.joinOnlineCta")}
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.page}>
        <AgendaSection />
        <VoteSection />
        <AttendCard />
        <PastAssembliesSection />
        <div className={styles.footer}>
          {t("marketing:annualAssembly.footer.eligibility")}{" "}
          <Link to={routes.help}>
            {t("marketing:annualAssembly.footer.helpCta")}
          </Link>{" "}
          · {t("marketing:annualAssembly.footer.proposal")}{" "}
          <Link to={routes.contact}>
            {t("marketing:annualAssembly.footer.writeCta")}
          </Link>
          .
        </div>
      </div>
    </PageShell>
  );
}
