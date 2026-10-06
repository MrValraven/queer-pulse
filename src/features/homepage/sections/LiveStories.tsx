import { Link } from "react-router-dom";
import {
  ImageSlot,
  Reveal,
  SectionHead,
  type ImageSlotTint,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { initialsFromName } from "../../../shared/lib/initials";
import { useHomepageStories } from "../api/useHomepageStories";
import type { HomepageStoryCard } from "./liveStories.adapters";
import styles from "./Stories.module.css";

/** A piece without lead art falls back to the tinted placeholder, which
 *  rotates through the palette so neighbouring cards differ in colour. */
const STORY_TINTS: ImageSlotTint[] = ["coral", "jade", "plum"];

function tintForIndex(index: number): ImageSlotTint {
  return STORY_TINTS[index % STORY_TINTS.length] ?? "plum";
}

function Byline({ story }: { story: HomepageStoryCard }) {
  const { t } = useTranslation();
  return (
    <div className={styles.byline}>
      <span className={styles.avMini}>
        {initialsFromName(story.authorName, "QP")}
      </span>
      {t("homepage:liveStories.byline", {
        author: story.authorName,
        minutes: story.readMinutes,
      })}
    </div>
  );
}

/**
 * Live-mode counterpart to `Stories`: real published magazine pieces, in the
 * same feature-plus-two-cards layout the demo teaser uses. A signed-in member
 * sees the latest ones; a signed-out visitor sees the ones the admin team
 * curated (see `useHomepageStories`). Titles, deks and bylines all come off
 * the published article, so none of the prototype's invented stories can
 * reach a live visitor.
 *
 * Renders nothing while loading and nothing when the source is empty.
 */
export function LiveStories() {
  const { stories, isLoading, isError } = useHomepageStories();

  // A failed fetch renders nothing, like an empty slice does. This is the
  // marketing homepage: a visitor has no stake in this teaser row and cannot
  // act on a failure here, and an alert panel between the curated plum and
  // cream sections would cost more than the row is worth. The real board is a
  // click away in the nav. The flag is read explicitly so the choice is a
  // decision rather than an accident.
  if (isLoading || isError || stories.length === 0) return null;

  return <LiveStoriesView stories={stories} />;
}

/** The section itself, fed already-adapted cards. Exported so the
 *  `/admin/landing` preview renders the exact markup a visitor gets. */
export function LiveStoriesView({ stories }: { stories: HomepageStoryCard[] }) {
  const { t } = useTranslation();
  const [feature, ...cards] = stories;
  if (!feature) return null;

  return (
    <section className={styles.stories} id="stories">
      <div className="wrap">
        <Reveal>
          <SectionHead
            className={styles.head}
            title={
              <Translation
                i18nKey="homepage:stories.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:stories.subtitle")}
          />
        </Reveal>

        <Reveal>
          <Link to={feature.to} className={styles.feature}>
            <ImageSlot
              src={feature.coverImageUrl ?? undefined}
              tint={tintForIndex(0)}
              height="clamp(220px, 56vw, 400px)"
              radius={18}
              alt=""
              placeholder={t("homepage:stories.imagePlaceholder")}
            />
            <div>
              <div className={styles.cat}>{feature.kicker}</div>
              <h3>{feature.title}</h3>
              <p>{feature.dek}</p>
              <Byline story={feature} />
            </div>
          </Link>
        </Reveal>

        {cards.length > 0 && (
          <div className={styles.row}>
            {cards.map((story, index) => (
              <Reveal key={story.key} delay={index * 60}>
                <Link to={story.to} className={styles.card}>
                  <ImageSlot
                    src={story.coverImageUrl ?? undefined}
                    tint={tintForIndex(index + 1)}
                    height={230}
                    radius={16}
                    alt=""
                    placeholder={t("homepage:stories.imagePlaceholder")}
                    style={{ marginBottom: 20 }}
                  />
                  <div className={styles.cat}>{story.kicker}</div>
                  <h4>{story.title}</h4>
                  <Byline story={story} />
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
