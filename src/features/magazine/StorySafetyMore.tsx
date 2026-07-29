import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { memberName } from "../members/data/members";
import styles from "./StorySafetyPage.module.css";

/** Article footer: the QueerPulse team author card and the "more stories" grid. */
export function StorySafetyMore() {
  return (
    <>
      <div className={styles.authorCard}>
        <div className={styles.authorAv}>QP</div>
        <div>
          <div className={styles.authorName}>The QueerPulse Team</div>
          <div className={styles.authorRole}>Lisbon · Founded 2023</div>
          <div className={styles.authorBio}>
            QueerPulse was built by a small group of queer professionals in
            Lisbon who kept asking each other why there wasn't a space like this
            already. Questions, concerns, and feedback are always welcome at
            hello@queerpulse.pt.
          </div>
        </div>
      </div>

      <div className={styles.more}>
        <h2>
          <Translation
            i18nKey="magazine:story.moreHeading"
            components={{ em: <em /> }}
          />
        </h2>
        <div className={styles.moreGrid}>
          <Link to={routes.story} className={styles.moreCard}>
            <div className={styles.moreImg} />
            <div className={styles.mcCat}>Field Notes</div>
            <div className={styles.mcTitle}>
              How a Príncipe Real studio became a quiet home for queer designers
            </div>
            <div className={styles.mcBy}>{memberName("ines")} · 6 min read</div>
          </Link>
          <Link to={routes.storyTomas} className={styles.moreCard}>
            <div className={styles.moreImg} />
            <div className={styles.mcCat}>Profiles</div>
            <div className={styles.mcTitle}>
              Leaving the startup grind for a supper club in Mouraria
            </div>
            <div className={styles.mcBy}>{memberName("sofia")} · 4 min read</div>
          </Link>
        </div>
      </div>
    </>
  );
}
