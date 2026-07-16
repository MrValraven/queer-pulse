import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { Button, HubBackLink, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { VENUES } from "./accessibility.data";
import {
  AccessibleSpacesSection,
  CommitmentsSection,
  ResourcesSection,
} from "./AccessibilitySections";
import { AccommodationsModal, FlagVenueModal } from "./AccessibilityModals";
import styles from "./AccessibilityPage.module.css";

const INVITE = routes.requestInvite;

export function AccessibilityPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const loading = useSimulatedLoad();
  const [filter, setFilter] = useState("all");
  const [flagVenue, setFlagVenue] = useState<string | null>(null);
  const [accomOpen, setAccomOpen] = useState(false);

  const venues = VENUES.filter(
    (v) => filter === "all" || v.featureTags.includes(filter),
  );

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <HubBackLink
            to={routes.help}
            label={t("marketing:accessibility.backLabel")}
          />
          <div className={styles.cat}>
            {t("marketing:accessibility.category")}
          </div>
          <h1>
            <Translation
              i18nKey="marketing:accessibility.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.heroSub}>
            {t("marketing:accessibility.hero.sub")}
          </p>
          <div className={styles.heroActions}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setAccomOpen(true)}
            >
              {t("marketing:accessibility.hero.accomCta")}
            </Button>
            <Button href="#spaces" variant="ghost">
              {t("marketing:accessibility.hero.spacesCta")} ↓
            </Button>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.dot} />
            {t("marketing:accessibility.hero.note")}
          </div>
        </div>
      </div>

      <AccessibleSpacesSection
        loading={loading}
        filter={filter}
        setFilter={setFilter}
        venues={venues}
        onFlag={setFlagVenue}
      />

      <CommitmentsSection onRequestAccom={() => setAccomOpen(true)} />

      <ResourcesSection showToast={showToast} />

      <Outro
        title={
          <Translation
            i18nKey="marketing:accessibility.outro.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:accessibility.outro.sub")}
      >
        <Button to={INVITE} variant="primary" size="lg">
          {t("marketing:accessibility.outro.cta")}
        </Button>
      </Outro>

      {flagVenue !== null && (
        <FlagVenueModal venue={flagVenue} onClose={() => setFlagVenue(null)} />
      )}
      {accomOpen && <AccommodationsModal onClose={() => setAccomOpen(false)} />}
    </PageShell>
  );
}
