import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, ImageSlot, Reveal } from "../../shared/components/ui";
import { memberName } from "../members/data/members";
import styles from "./MagazinePage.module.css";
import { routes } from "../../app/routeMap";
import type { Card } from "./magazinePage.data";
import {
  FEATURES,
  ESSAYS,
  INTERVIEWS,
  REVIEWS,
  COMMUNITY,
  LETTERS,
  ARCHIVE,
} from "./magazinePage.data";

function ArticleCard({ card }: { card: Card }) {
  return (
    <Reveal
      as={Link}
      {...{ to: `/article?id=${card.id}` }}
      className={styles.ac}
    >
      <div className={styles.acImg}>
        <ImageSlot
          tint={card.tint === "auth" ? "plum" : card.tint}
          height="100%"
          radius={14}
          src={card.src}
          alt={card.imgDesc}
          placeholder={card.imgDesc}
        />
      </div>
      <div className={styles.acKicker}>{card.kicker}</div>
      <div className={styles.acTitle}>{card.title}</div>
      <div className={styles.acExcerpt}>{card.excerpt}</div>
      <div className={styles.acMeta}>
        <Avatar initials={card.initials} tint={card.tint} size={22} />
        {card.author}
        {card.verdict ? (
          <>
            {" · "}
            <span className={`${styles.rv} ${styles[card.verdict]}`}>
              {card.verdict === "essential" ? "Essential" : "Recommended"}
            </span>
          </>
        ) : (
          card.meta && ` · ${card.meta}`
        )}
      </div>
    </Reveal>
  );
}

function SectionHead({
  title,
  label,
  id,
}: {
  title: ReactNode;
  label: string;
  id: string;
}) {
  return (
    <div className={styles.asHead} id={id}>
      <div className={styles.asTitle}>{title}</div>
      <span className={styles.asSeeAll}>All {label} →</span>
    </div>
  );
}

export function MagazineSections() {
  return (
    <main className={styles.body}>
      <div className="wrap">
        <section className={styles.section}>
          <SectionHead
            title={
              <>
                This month's <em>features</em>
              </>
            }
            label="this month's features"
            id="features"
          />
          <div className={styles.grid}>
            {FEATURES.map((card) => (
              <ArticleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <Reveal className={styles.featured}>
          <div>
            <div className={styles.feKicker}>Essay of the month</div>
            <h2 className={styles.feTitle}>
              I didn't come out.
              <br />
              <em>I arrived.</em>
            </h2>
            <div className={styles.feByline}>By {memberName("tomas")}</div>
            <p className={styles.feExcerpt}>
              Coming out implies a before and an after. A door, a room, a
              revelation. What if it was never that clean? What if you just
              quietly became yourself and one day looked around and noticed
              everyone already knew?
            </p>
            <Link className={styles.feRead} to={`${routes.article}?id=i-arrived`}>
              Read the essay <span>→</span>
            </Link>
          </div>
          <div className={styles.fePull}>
            "The community did not follow my identity. My identity followed
            the community."
          </div>
        </Reveal>

        <section className={styles.section}>
          <SectionHead title={<em>Essays</em>} label="essays" id="essays" />
          <div className={styles.essaysGrid}>
            {ESSAYS.map((card) => (
              <Reveal
                as={Link}
                key={card.id}
                {...{ to: `/article?id=${card.id}` }}
                className={styles.ec}
              >
                <div className={styles.ecKicker}>{card.kicker}</div>
                <div className={styles.ecTitle}>{card.title}</div>
                <p className={styles.acExcerpt}>{card.excerpt}</p>
                <div className={styles.acMeta}>
                  <Avatar
                    initials={card.initials}
                    tint={card.tint}
                    size={20}
                  />
                  {card.author} · {card.meta}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <SectionHead
            title={<em>Interviews</em>}
            label="interviews"
            id="interviews"
          />
          <div className={styles.grid}>
            {INTERVIEWS.map((card) => (
              <ArticleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <SectionHead title={<em>Reviews</em>} label="reviews" id="reviews" />
          <div className={styles.grid}>
            {REVIEWS.map((card) => (
              <ArticleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <SectionHead
            title={
              <>
                Community <em>life</em>
              </>
            }
            label="community life"
            id="community-life"
          />
          <div className={styles.grid}>
            {COMMUNITY.map((card) => (
              <ArticleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section className={styles.letters} id="letters">
          <div className={styles.lsHead}>
            Letters to the <em>editors</em>
          </div>
          {LETTERS.map((letter) => (
            <div key={letter.from} className={styles.letter}>
              <div className={styles.letterBody}>"{letter.body}"</div>
              <div className={styles.letterFrom}>{letter.from}</div>
            </div>
          ))}
        </section>

        <section className={styles.section} id="archive">
          <SectionHead
            title={
              <>
                Past <em>issues</em>
              </>
            }
            label="past issues"
            id="archive-head"
          />
          <div className={styles.archiveRow}>
            {ARCHIVE.map((issue) => (
              <Link
                key={issue.title}
                to={routes.issue}
                className={styles.archiveIssue}
              >
                <div
                  className={styles.aiCover}
                  style={{ background: issue.bg }}
                >
                  <div className={styles.aiCoverTitle}>{issue.title}</div>
                </div>
                <div className={styles.aiMonth}>{issue.month}</div>
                <div className={styles.aiCount}>{issue.count}</div>
              </Link>
            ))}
          </div>
        </section>

        <div className={styles.submit}>
          <div className={styles.ssBody}>
            <h3>
              Write for <em>the magazine.</em>
            </h3>
            <p>
              We publish essays, features, reviews, interviews, and criticism
              from community members. No formal credentials required — just
              something worth saying.
            </p>
          </div>
          <Button
            href="mailto:magazine@queerpulse.pt"
            variant="primary"
            size="lg"
            style={{
              background: "var(--accent)",
              color: "var(--cream)",
              borderRadius: 999,
              padding: "15px 30px",
              fontWeight: 600,
              fontFamily: "var(--sans)",
            }}
          >
            Pitch us
          </Button>
        </div>
      </div>
    </main>
  );
}
