import { Link } from "react-router-dom";
import { ImageSlot, Reveal, SectionHead } from "../../../shared/components/ui";
import { linkToPath } from "../../../app/routeMap";
import { featureStory, storyCards } from "../data/stories";
import styles from "./Stories.module.css";

export function Stories() {
  return (
    <section className={styles.stories} id="stories">
      <div className="wrap">
        <Reveal>
          <SectionHead
            className={styles.head}
            title={
              <>
                The people <em>behind the pulse</em>
              </>
            }
            subtitle="Quiet profiles and field notes from the community. Less newsfeed, more good magazine."
          />
        </Reveal>

        <Reveal>
          <Link to={linkToPath(featureStory.href)} className={styles.feature}>
            <ImageSlot
              tint={featureStory.tint}
              src={featureStory.image}
              height={400}
              radius={18}
              placeholder="Story image"
            />
            <div>
              <div className={styles.cat}>{featureStory.category}</div>
              <h3>{featureStory.title}</h3>
              <p>{featureStory.excerpt}</p>
              <div className={styles.byline}>
                <span className={styles.avMini}>
                  {featureStory.bylineInitials}
                </span>
                {featureStory.byline}
              </div>
            </div>
          </Link>
        </Reveal>

        <div className={styles.row}>
          {storyCards.map((story, index) => (
            <Reveal key={story.href} delay={index * 60}>
              <Link to={linkToPath(story.href)} className={styles.card}>
                <ImageSlot
                  tint={story.tint}
                  src={story.image}
                  height={230}
                  radius={16}
                  placeholder="Story image"
                  style={{ marginBottom: 20 }}
                />
                <div className={styles.cat}>{story.category}</div>
                <h4>{story.title}</h4>
                <div className={styles.byline}>
                  <span className={styles.avMini}>{story.bylineInitials}</span>
                  {story.byline}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
