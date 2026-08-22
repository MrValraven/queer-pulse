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
import { routes } from "../../../app/routeMap";
import type { ArticleListItemDTO } from "../../magazine/api/magazine.api";
import { useHomepageStories } from "../api/useHomepageStories";
import styles from "./Stories.module.css";

/** Published pieces carry no cover image on the list DTO, so the tinted
 *  placeholder rotates through the palette instead of repeating one colour. */
const STORY_TINTS: ImageSlotTint[] = ["coral", "jade", "plum"];

function tintForIndex(index: number): ImageSlotTint {
  return STORY_TINTS[index % STORY_TINTS.length] ?? "plum";
}

function articlePath(article: ArticleListItemDTO): string {
  return `${routes.article}?id=${article.slug}`;
}

function Byline({ article }: { article: ArticleListItemDTO }) {
  const { t } = useTranslation();
  return (
    <div className={styles.byline}>
      <span className={styles.avMini}>
        {initialsFromName(article.author.displayName, "QP")}
      </span>
      {t("homepage:liveStories.byline", {
        author: article.author.displayName,
        minutes: article.readMinutes,
      })}
    </div>
  );
}

/**
 * Live-mode counterpart to `Stories`: the most recently published magazine
 * pieces, in the same feature-plus-two-cards layout the demo teaser uses.
 * Titles, deks and bylines all come off the published article, so none of the
 * prototype's invented stories can reach a live visitor.
 *
 * Renders nothing while loading and nothing when nothing has been published
 * yet (see `useHomepageStories` for why the data is gated on a signed-in
 * session).
 */
export function LiveStories() {
  const { t } = useTranslation();
  const { stories, isLoading } = useHomepageStories();

  if (isLoading || stories.length === 0) return null;

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
          <Link to={articlePath(feature)} className={styles.feature}>
            <ImageSlot
              tint={tintForIndex(0)}
              height={400}
              radius={18}
              alt={feature.title}
              placeholder={t("homepage:stories.imagePlaceholder")}
            />
            <div>
              <div className={styles.cat}>
                {feature.issueNumber
                  ? t("homepage:liveStories.issueKicker", {
                      number: feature.issueNumber,
                    })
                  : t("homepage:liveStories.magazineKicker")}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.dek}</p>
              <Byline article={feature} />
            </div>
          </Link>
        </Reveal>

        {cards.length > 0 && (
          <div className={styles.row}>
            {cards.map((story, index) => (
              <Reveal key={story.slug} delay={index * 60}>
                <Link to={articlePath(story)} className={styles.card}>
                  <ImageSlot
                    tint={tintForIndex(index + 1)}
                    height={230}
                    radius={16}
                    alt={story.title}
                    placeholder={t("homepage:stories.imagePlaceholder")}
                    style={{ marginBottom: 20 }}
                  />
                  <div className={styles.cat}>
                    {story.issueNumber
                      ? t("homepage:liveStories.issueKicker", {
                          number: story.issueNumber,
                        })
                      : t("homepage:liveStories.magazineKicker")}
                  </div>
                  <h4>{story.title}</h4>
                  <Byline article={story} />
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
