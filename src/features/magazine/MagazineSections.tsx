import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, ImageSlot, Reveal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberName } from "../members/data/members";
import { AuthorLink } from "./AuthorLink";
import { issueArticlesText } from "./magazineFormat";
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

/** A translated heading that carries the coral `<em>` emphasis run. */
function EmHeading({ i18nKey }: { i18nKey: string }) {
  return <Translation i18nKey={i18nKey} components={{ em: <em /> }} />;
}

function ArticleCard({ card }: { card: Card }) {
  const { t } = useTranslation();
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
      {/* Content: kicker/title/excerpt/author/meta are the article's own
          editorial fields — arrive from the API in live mode. */}
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
              {card.verdict === "essential"
                ? t("magazine:sections.verdict.essential")
                : t("magazine:sections.verdict.recommended")}
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
  allCtaKey,
  id,
}: {
  title: ReactNode;
  allCtaKey: string;
  id: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.asHead} id={id}>
      <div className={styles.asTitle}>{title}</div>
      <span className={styles.asSeeAll}>{t(allCtaKey)}</span>
    </div>
  );
}

/** The hand-picked "essay of the month" hero block. */
function FeaturedEssay() {
  const { t } = useTranslation();
  return (
    <Reveal className={styles.featured}>
      <div>
        <div className={styles.feKicker}>
          {t("magazine:sections.essayOfMonthKicker")}
        </div>
        {/* Content: the featured essay's own headline/excerpt/pull-quote. */}
        <h2 className={styles.feTitle}>
          I didn't come out.
          <br />
          <em>I arrived.</em>
        </h2>
        <div className={styles.feByline}>
          By <AuthorLink name={memberName("tomas")} />
        </div>
        <p className={styles.feExcerpt}>
          Coming out implies a before and an after. A door, a room, a
          revelation. What if it was never that clean? What if you just
          quietly became yourself and one day looked around and noticed
          everyone already knew?
        </p>
        <Link className={styles.feRead} to={`${routes.article}?id=i-arrived`}>
          {t("magazine:sections.readEssayCta")} <span>→</span>
        </Link>
      </div>
      <div className={styles.fePull}>
        "The community did not follow my identity. My identity followed the
        community."
      </div>
    </Reveal>
  );
}

/** Reader letters — content, kept in English (a reader's own words). */
function LettersSection() {
  return (
    <section className={styles.letters} id="letters">
      <div className={styles.lsHead}>
        <EmHeading i18nKey="magazine:sections.letters.title" />
      </div>
      {LETTERS.map((letter) => (
        <div key={letter.from} className={styles.letter}>
          <div className={styles.letterBody}>"{letter.body}"</div>
          <div className={styles.letterFrom}>{letter.from}</div>
        </div>
      ))}
    </section>
  );
}

/** Past-issues archive row. */
function ArchiveSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <section className={styles.section} id="archive">
      <SectionHead
        title={<EmHeading i18nKey="magazine:sections.archive.title" />}
        allCtaKey="magazine:sections.archive.allCta"
        id="archive-head"
      />
      <div className={styles.archiveRow}>
        {ARCHIVE.map((issue) => (
          <Link key={issue.title} to={routes.issue} className={styles.archiveIssue}>
            <div className={styles.aiCover} style={{ background: issue.bg }}>
              {/* Content: the issue's own cover title. */}
              <div className={styles.aiCoverTitle}>{issue.title}</div>
            </div>
            <div className={styles.aiMonth}>
              {fmt.date(issue.date, { month: "long", year: "numeric" })}
            </div>
            <div className={styles.aiCount}>
              {issueArticlesText(issue.issueNumber, issue.articleCount, t)}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** "Write for the magazine" pitch banner. */
function SubmitBanner() {
  const { t } = useTranslation();
  return (
    <div className={styles.submit}>
      <div className={styles.ssBody}>
        <h3>
          <EmHeading i18nKey="magazine:sections.submit.title" />
        </h3>
        <p>{t("magazine:sections.submit.body")}</p>
      </div>
      <Button to={routes.submitStory} variant="primary" size="lg">
        {t("magazine:sections.submit.cta")}
      </Button>
    </div>
  );
}

export function MagazineSections() {
  return (
    <main className={styles.body}>
      <div className="wrap">
        <section className={styles.section}>
          <SectionHead
            title={<EmHeading i18nKey="magazine:sections.features.title" />}
            allCtaKey="magazine:sections.features.allCta"
            id="features"
          />
          <div className={styles.grid}>
            {FEATURES.map((card) => (
              <ArticleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <FeaturedEssay />

        <section className={styles.section}>
          <SectionHead
            title={<EmHeading i18nKey="magazine:sections.essays.title" />}
            allCtaKey="magazine:sections.essays.allCta"
            id="essays"
          />
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
                  <Avatar initials={card.initials} tint={card.tint} size={20} />
                  {card.author} · {card.meta}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <SectionHead
            title={<EmHeading i18nKey="magazine:sections.interviews.title" />}
            allCtaKey="magazine:sections.interviews.allCta"
            id="interviews"
          />
          <div className={styles.grid}>
            {INTERVIEWS.map((card) => (
              <ArticleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <SectionHead
            title={<EmHeading i18nKey="magazine:sections.reviews.title" />}
            allCtaKey="magazine:sections.reviews.allCta"
            id="reviews"
          />
          <div className={styles.grid}>
            {REVIEWS.map((card) => (
              <ArticleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <SectionHead
            title={
              <EmHeading i18nKey="magazine:sections.communityLife.title" />
            }
            allCtaKey="magazine:sections.communityLife.allCta"
            id="community-life"
          />
          <div className={styles.grid}>
            {COMMUNITY.map((card) => (
              <ArticleCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <LettersSection />
        <ArchiveSection />
        <SubmitBanner />
      </div>
    </main>
  );
}
