import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { CHIPS } from "./tag.data";
import styles from "./TagPage.module.css";

const ARTICLE = routes.article;
const NEWSLETTER = routes.newsletter;

export function TagPageHero({
  activeChip,
  onChip,
}: {
  activeChip: number;
  onChip: (i: number) => void;
}) {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Magazine · category</div>
          <h1 className={styles.h1}>
            Long <em>reads.</em>
          </h1>
          <p className={styles.dek}>
            <b>Twenty-minute pieces and up.</b> Reported essays, multi-source
            profiles, and the kind of long-form work that asks something of the
            reader. Slow journalism on purpose. New piece every other Thursday.
          </p>
          <div className={styles.stats}>
            <span>
              <b>
                <em>42</em>
              </b>
              Pieces in this section
            </span>
            <span>
              <b>14</b>Min average read
            </span>
            <span>
              <b>9</b>Issues represented
            </span>
            <span>
              <b>18</b>Contributors
            </span>
          </div>
        </div>
      </section>

      <div className={styles.chipsRow}>
        <div className={styles.chipsInner}>
          <span className={styles.chipsLabel}>Filter</span>
          {CHIPS.map((c, i) => (
            <button
              key={c}
              type="button"
              className={[styles.chip, activeChip === i && styles.chipActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onChip(i)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <section className={styles.featured}>
        <div className={styles.feat}>
          <div>
            <div className={styles.featKicker}>
              Featured · Issue 09 · 14 min read
            </div>
            <h2 className={styles.featH}>
              <Link to={ARTICLE}>
                Five things I learned{" "}
                <em>navigating Lisbon's trans health system.</em>
              </Link>
            </h2>
            <p className={styles.featDek}>
              Six months reporting on the SNS, three regional clinics, and what
              nobody tells you about waiting lists, referrals, and getting a
              hormone prescription without losing a year of your life. The cover
              story of issue 09.
            </p>
            <div className={styles.featByline}>
              <div className="av">SP</div>
              <span>
                By <b>Sara Pinheiro</b> · published 6 Jun 2026 · <b>284</b>{" "}
                reads this week
              </span>
            </div>
          </div>
          <div className={styles.featImg}>Hero · cover essay</div>
        </div>
      </section>

      <div className={styles.curator}>
        <div className={styles.curatorCard}>
          <div>
            <div className={styles.curatorEyebrow}>Editor's note</div>
            <p className={styles.curatorText}>
              Long reads are how we earn permission to ask{" "}
              <em>uncomfortable questions.</em> If you only have time for one
              piece this month, make it the cover.
            </p>
            <p className={styles.curatorBy}>
              — <b>Marta Reis</b>, editor in chief
            </p>
          </div>
          <Button to={NEWSLETTER} variant="ghost-dark">
            Get long reads by email →
          </Button>
        </div>
      </div>
    </>
  );
}
