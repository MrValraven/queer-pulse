import { useState } from "react";
import { PageHero, PageShell } from "../../shared/components/layout";
import { Button, HubBackLink, Outro } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { PageMeta, JsonLd, buildBreadcrumbSchema } from "../../shared/seo";
import { VENUES } from "./accessibility.data";
import {
  AccessibleSpacesSection,
  CommitmentsSection,
  ResourcesSection,
} from "./AccessibilitySections";
import { AccommodationsModal, FlagVenueModal } from "./AccessibilityModals";
import styles from "./AccessibilityPage.module.css";

const INVITE = requestInvitePath("accessibility");

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
  const pageTitle = t("marketing:accessibility.meta.title");
  const pageDescription = t("marketing:accessibility.meta.description");

  return (
    <PageShell>
      <PageMeta title={pageTitle} description={pageDescription} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: t("shared:megaNav.about.title"), path: routes.about },
          { name: t("marketing:help.meta.title"), path: routes.help },
          { name: pageTitle, path: routes.accessibility },
        ])}
      />
      <PageHero
        plum={false}
        eyebrow={
          <>
            <span style={{ textTransform: "none", letterSpacing: "normal" }}>
              <HubBackLink
                to={routes.help}
                label={t("marketing:accessibility.backLabel")}
              />
            </span>
            {t("marketing:accessibility.category")}
          </>
        }
        title={
          <Translation
            i18nKey="marketing:accessibility.hero.title"
            components={{ em: <em /> }}
          />
        }
        sub={t("marketing:accessibility.hero.sub")}
      >
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
      </PageHero>

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
