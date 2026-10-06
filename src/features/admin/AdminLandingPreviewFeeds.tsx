import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOMEPAGE_GATHERING_LIMIT } from "../homepage/api/useHomepageGatherings";
import { HOMEPAGE_STORY_LIMIT } from "../homepage/api/useHomepageStories";
import { LiveGatheringsView } from "../homepage/sections/LiveGatherings";
import { LiveStoriesView } from "../homepage/sections/LiveStories";
import { landingGatheringToGatheringRow } from "../homepage/sections/liveGatherings.adapters";
import { landingStoryToStoryCard } from "../homepage/sections/liveStories.adapters";
import type {
  LandingGatheringFeatureDTO,
  LandingStoryFeatureDTO,
} from "./api/landingFeatures.api";
import type {
  PendingCommunityPreview,
  TitledPreviewSplit,
} from "./api/landingPreview.adapters";
import styles from "./AdminLandingPreview.module.css";

/**
 * The `/admin/landing` preview stages that need the public feed's chrome to
 * render a real card (gatherings, stories), plus the two small states every
 * stage shares. Gathering and story stages render the homepage's own
 * `LiveGatheringsView` / `LiveStoriesView` through the same adapters the
 * signed-out homepage uses, so the preview is the visitor's markup.
 */

export function PreviewEmptyState() {
  const { t } = useTranslation();
  return <p className={styles.state}>{t("admin:landing.preview.empty")}</p>;
}

/** Featured slots the public feed has not enriched yet, listed by name. */
export function PendingPreviewList({
  items,
  section,
}: {
  items: PendingCommunityPreview[];
  /** Omitted for communities, whose note keeps the original wording. */
  section?: "gathering" | "story";
}) {
  const { t } = useTranslation();
  if (items.length === 0) return null;
  return (
    <div className={styles.pending}>
      <div className={styles.pendingTitle}>
        {t("admin:landing.preview.pendingTitle")}
      </div>
      <p className={styles.pendingNote}>
        {section
          ? t(`admin:landing.preview.pendingNote.${section}`)
          : t("admin:landing.preview.pendingNote")}
      </p>
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

export function GatheringStage({
  split,
}: {
  split: TitledPreviewSplit<LandingGatheringFeatureDTO>;
}) {
  const { t } = useTranslation();
  if (split.enriched.length === 0 && split.pending.length === 0) {
    return <PreviewEmptyState />;
  }
  // The same cap the homepage applies, so the preview never shows a row a
  // visitor would not see.
  const rows = split.enriched
    .slice(0, HOMEPAGE_GATHERING_LIMIT)
    .map((feature) => landingGatheringToGatheringRow(feature, t));
  return (
    <>
      {rows.length > 0 && <LiveGatheringsView rows={rows} />}
      <div className={`wrap ${styles.pendingStage}`}>
        <PendingPreviewList items={split.pending} section="gathering" />
      </div>
    </>
  );
}

export function StoryStage({
  split,
}: {
  split: TitledPreviewSplit<LandingStoryFeatureDTO>;
}) {
  const { t } = useTranslation();
  if (split.enriched.length === 0 && split.pending.length === 0) {
    return <PreviewEmptyState />;
  }
  // The same cap the homepage applies, so the preview never shows a card a
  // visitor would not see.
  const stories = split.enriched
    .slice(0, HOMEPAGE_STORY_LIMIT)
    .map((feature) => landingStoryToStoryCard(feature, t));
  return (
    <>
      {stories.length > 0 && <LiveStoriesView stories={stories} />}
      <div className={`wrap ${styles.pendingStage}`}>
        <PendingPreviewList items={split.pending} section="story" />
      </div>
    </>
  );
}
