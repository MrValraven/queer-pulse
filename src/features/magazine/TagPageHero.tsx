import { Link } from "react-router-dom";
import { Button, HubBackLink } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AuthorLink } from "./AuthorLink";
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
  const { t } = useTranslation();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <HubBackLink
            to={routes.magazine}
            label={t("magazine:coverGallery.backLink")}
            tone="light"
          />
          <div className={styles.eyebrow}>{t("magazine:tag.hero.eyebrow")}</div>
          <h1 className={styles.h1}>
            <Translation
              i18nKey="magazine:tag.hero.h1"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.dek}>
            <Translation
              i18nKey="magazine:tag.hero.dek"
              components={{ b: <b /> }}
            />
          </p>
          <div className={styles.stats}>
            <span>
              <b>
                <em>42</em>
              </b>
              {t("magazine:tag.hero.stats.piecesInSection")}
            </span>
            <span>
              <b>14</b>
              {t("magazine:tag.hero.stats.minAverageRead")}
            </span>
            <span>
              <b>9</b>
              {t("magazine:tag.hero.stats.issuesRepresented")}
            </span>
            <span>
              <b>18</b>
              {t("magazine:tag.hero.stats.contributors")}
            </span>
          </div>
        </div>
      </section>

      <div className={styles.chipsRow}>
        <div className={styles.chipsInner}>
          <span className={styles.chipsLabel}>
            {t("magazine:tag.hero.filterLabel")}
          </span>
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
                By <AuthorLink name="Sara Pinheiro" /> · published 6 Jun 2026 ·{" "}
                <b>284</b> reads this week
              </span>
            </div>
          </div>
          <div className={styles.featImg}>Hero · cover essay</div>
        </div>
      </section>

      <div className={styles.curator}>
        <div className={styles.curatorCard}>
          <div>
            <div className={styles.curatorEyebrow}>
              {t("magazine:tag.hero.curatorEyebrow")}
            </div>
            {/* Content: the editor's own note text and byline. */}
            <p className={styles.curatorText}>
              Long reads are how we earn permission to ask{" "}
              <em>uncomfortable questions.</em> If you only have time for one
              piece this month, make it the cover.
            </p>
            <p className={styles.curatorBy}>
              — <AuthorLink name="Marta Reis" />, editor in chief
            </p>
          </div>
          <Button to={NEWSLETTER} variant="ghost-dark">
            {t("magazine:tag.hero.getLongReadsCta")}
          </Button>
        </div>
      </div>
    </>
  );
}
