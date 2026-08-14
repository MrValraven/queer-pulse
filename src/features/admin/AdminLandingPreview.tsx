import { useRef, useState } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useLandingFeaturesPublic } from "../homepage/api/useLandingFeatures";
import {
  FeaturedSpotlightCard,
  type FeaturedSpotlightCardHandle,
} from "../homepage/sections/FeaturedSpotlightCard";
import { SpotlightRow } from "../homepage/sections/SpotlightRow";
import { FeaturedCommunityCard } from "../homepage/sections/FeaturedCommunityCard";
import { ChangemakerGrid } from "../homepage/sections/ChangemakerGrid";
import { memberFeatureToSpotlightView } from "../homepage/sections/spotlightView";
import { landingCommunityToView } from "../homepage/sections/communitySpotlightView";
import liveStyles from "../homepage/sections/LiveSections.module.css";
import { useLandingFeatures } from "./api/useLandingFeatures";
import type { LandingSection } from "./api/landingFeatures.api";
import {
  bySlug,
  previewChangemakerDTOs,
  previewCommunityDTOs,
  previewMemberDTOs,
  type PendingCommunityPreview,
} from "./api/landingPreview.adapters";
import styles from "./AdminLandingPreview.module.css";

/** The public homepage host, shown in the preview's browser bar so it reads as
 *  "this is the landing page" rather than an admin widget. */
const PUBLIC_HOST = "queerpulse.com";

/**
 * A live preview of how the active `/admin/landing` tab renders on the
 * signed-out homepage, driven by the same admin curation data the editor writes
 * (`useLandingFeatures`) so it reflects every add / remove / reorder / hide /
 * copy edit the instant its mutation settles, with no save round-trip. The
 * public feed (`useLandingFeaturesPublic`) fills in the entity chrome the
 * curation data doesn't author (member tags, community cover / roster / access).
 *
 * It reuses the real homepage section chrome and cards, so what an admin sees
 * here is what a visitor gets. Only *active* slots render, in position order,
 * exactly matching the live page.
 */
export function AdminLandingPreview({ section }: { section: LandingSection }) {
  const { t } = useTranslation();
  const { features, isLoading } = useLandingFeatures(section);
  const publicFeed = useLandingFeaturesPublic();

  return (
    <section className={styles.panel} aria-label={t("admin:landing.preview.eyebrow")}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>{t("admin:landing.preview.eyebrow")}</div>
        <p className={styles.note}>{t("admin:landing.preview.note")}</p>
      </header>

      <div className={styles.browser}>
        <div className={styles.browserBar}>
          <span className={styles.dots} aria-hidden>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
          <span className={styles.url}>{PUBLIC_HOST}</span>
        </div>

        <div className={styles.viewport}>
          {isLoading ? (
            <p className={styles.state}>{t("admin:landing.preview.loading")}</p>
          ) : (
            <PreviewStage
              section={section}
              features={features}
              publicFeed={publicFeed}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function PreviewStage({
  section,
  features,
  publicFeed,
}: {
  section: LandingSection;
  features: ReturnType<typeof useLandingFeatures>["features"];
  publicFeed: ReturnType<typeof useLandingFeaturesPublic>;
}) {
  if (section === "member") {
    const views = previewMemberDTOs(features, bySlug(publicFeed.members)).map(
      memberFeatureToSpotlightView,
    );
    return <MemberStage views={views} />;
  }

  if (section === "community") {
    const split = previewCommunityDTOs(features, bySlug(publicFeed.communities));
    return <CommunityStage split={split} />;
  }

  const changemakers = previewChangemakerDTOs(
    features,
    bySlug(publicFeed.changemakers),
  );
  return <ChangemakerStage items={changemakers} />;
}

function EmptyState() {
  const { t } = useTranslation();
  return <p className={styles.state}>{t("admin:landing.preview.empty")}</p>;
}

function MemberStage({
  views,
}: {
  views: ReturnType<typeof memberFeatureToSpotlightView>[];
}) {
  const { t } = useTranslation();
  const cardRef = useRef<FeaturedSpotlightCardHandle>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  if (views.length === 0) return <EmptyState />;
  return (
    <section className={liveStyles.section}>
      <div className="wrap">
        <div className={liveStyles.eyebrow}>
          {t("homepage:liveDiscovery.eyebrow")}
        </div>
        <h2 className={liveStyles.title}>
          <Translation i18nKey="homepage:discovery.title" components={{ em: <em /> }} />
        </h2>
        <p className={liveStyles.sub}>{t("homepage:discovery.sub")}</p>
        <div className={liveStyles.roster}>
          <div className={liveStyles.rosterFeat}>
            <FeaturedSpotlightCard
              ref={cardRef}
              items={views}
              onActiveChange={setActiveIndex}
            />
          </div>
          <div className={liveStyles.rosterRows}>
            {views.map((view, index) => (
              <SpotlightRow
                key={view.key}
                view={view}
                active={index === activeIndex}
                onSelect={() => cardRef.current?.goTo(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CommunityStage({
  split,
}: {
  split: ReturnType<typeof previewCommunityDTOs>;
}) {
  const { t } = useTranslation();
  if (split.enriched.length === 0 && split.pending.length === 0) {
    return <EmptyState />;
  }
  const views = split.enriched.map(landingCommunityToView);
  return (
    <section className={liveStyles.section}>
      <div className="wrap">
        <div className={liveStyles.head}>
          <div className={liveStyles.headText}>
            <div className={liveStyles.eyebrow}>
              {t("homepage:communities.eyebrow")}
            </div>
            <h2 className={liveStyles.title}>
              <Translation
                i18nKey="homepage:communities.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={liveStyles.sub}>{t("homepage:liveCommunities.sub")}</p>
          </div>
        </div>
        <FeaturedCommunityCard items={views} />
        <PendingCommunities items={split.pending} />
      </div>
    </section>
  );
}

function PendingCommunities({ items }: { items: PendingCommunityPreview[] }) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  return (
    <div className={styles.pending}>
      <div className={styles.pendingTitle}>
        {t("admin:landing.preview.pendingTitle")}
      </div>
      <p className={styles.pendingNote}>{t("admin:landing.preview.pendingNote")}</p>
      <ul className={styles.pendingList}>
        {items.map((item) => (
          <li key={item.id} className={styles.pendingItem}>
            <span className={styles.pendingName}>{item.name}</span>
            {item.blurb && (
              <span className={styles.pendingBlurb}>{item.blurb}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChangemakerStage({
  items,
}: {
  items: ReturnType<typeof previewChangemakerDTOs>;
}) {
  const { t } = useTranslation();
  if (items.length === 0) return <EmptyState />;
  return (
    <section className={[liveStyles.section, liveStyles.sectionPlum].join(" ")}>
      <div className="wrap">
        <div className={liveStyles.head}>
          <div className={liveStyles.headText}>
            <div className={[liveStyles.eyebrow, liveStyles.eyebrowLight].join(" ")}>
              {t("homepage:changeMakers.eyebrow")}
            </div>
            <h2 className={[liveStyles.title, liveStyles.titleLight].join(" ")}>
              <Translation
                i18nKey="homepage:changeMakers.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={[liveStyles.sub, liveStyles.subLight].join(" ")}>
              {t("homepage:changeMakers.sub")}
            </p>
          </div>
        </div>
        <ChangemakerGrid items={items} />
      </div>
    </section>
  );
}
