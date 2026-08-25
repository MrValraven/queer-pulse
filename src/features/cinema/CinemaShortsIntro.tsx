import { Link } from "react-router-dom";
import { FiArrowRight, FiShare2 } from "react-icons/fi";
import { Avatar, Button, ImageSlot } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { ShortsShelf } from "./cinemaShorts.data";
import styles from "./CinemaShortsPage.module.css";

/** Programmer's weekly letter. */
export function CuratorNote() {
  const { t } = useTranslation();
  return (
    <div className={styles.curatorNote}>
      {/* eslint-disable-next-line local/no-literal-string -- curator's initials, derived from their own name (content, not chrome) */}
      <div className={styles.cnAv}>JR</div>
      <div>
        <div className={styles.cnEb}>
          {t("cinema:shorts.curatorNote.eyebrow", { week: 27 })}
        </div>
        {/* eslint-disable local/no-literal-string -- curator's own weekly note and byline; content per the scope rule, arrives over the wire in live mode */}
        <p className={styles.cnBody}>
          This week is about <em>staying</em>: films where nobody leaves the
          room, or wishes they hadn't. Start with <em>The first Sunday</em> if
          you only have half an hour, then let it lead you outward. Everything
          here was made by someone you could meet.
        </p>
        <p className={styles.cnSign}>
          João Reis, community programmer ·{" "}
          {/* eslint-enable local/no-literal-string */}
          <Link to={routes.cinemaAbout}>
            {t("cinema:shorts.curatorNote.readPastNotesCta")}
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Accessibility promise strip. */
export function AccessNote() {
  return (
    <p className={styles.accessNote}>
      <span className={styles.anDot} aria-hidden />
      <span>
        <Translation
          i18nKey="cinema:shorts.accessNote.body"
          components={{ strong: <strong />, em: <em /> }}
        />
      </span>
    </p>
  );
}

/** Most-watched hero film with a live tip goal. */
export function Spotlight({ shelf }: { shelf: ShortsShelf }) {
  const { t } = useTranslation();
  return (
    <div className={styles.spotlight}>
      <div className={styles.spPoster}>
        <ImageSlot
          tint="coral"
          width="100%"
          height="100%"
          placeholder={t("cinema:slot.spotlightPoster")}
          style={{ position: "absolute", inset: 0 }}
        />
        <span className={styles.spBadge}>
          {t("cinema:shorts.spotlight.mostWatchedBadge")}
        </span>
      </div>
      <div className={styles.spText}>
        <div className={styles.spKicker}>
          <span className={styles.live} aria-hidden />
          {t("cinema:shorts.spotlight.communityPickKicker", { week: 23 })}
        </div>
        {/* eslint-disable local/no-literal-string -- spotlighted film's own title, credits, synopsis, maker name, and funding tally; content per the scope rule, arrives over the wire in live mode */}
        <h2 className={styles.spTitle}>
          The first <em>Sunday</em>
        </h2>
        <div className={styles.spMeta}>
          Inês Tavares &amp; collective · documentary · 28 min · 2026
        </div>
        <p className={styles.spDesc}>
          Inside Lisbon's first community-run queer Sunday roast at Casa do
          Comum. Made collectively, funded by 47 sustainers in 11 days through
          the spring micro-campaign. Shows what a room looks like when it
          decides to feed itself.
        </p>
        <div className={styles.spMaker}>
          <Avatar initials="IT" tint="coral" size={34} />
          <div>
            <div className={styles.name}>Inês Tavares &amp; collective</div>
            <div className={styles.grant}>
              Made with sustainer pool funding · Spring 2026
            </div>
          </div>
        </div>
        <div className={styles.spGoal}>
          <div className={styles.spGoalTop}>
            <span className={styles.gLead}>
              Tips so far: <b>€340</b> of €500, funds the collective's next
              shoot
            </span>
            <span className={styles.gPct}>68%</span>
          </div>
          <div className={styles.spGoalBar}>
            <i style={{ width: "68%" }} />
          </div>
        </div>
        {/* eslint-enable local/no-literal-string */}
        <div className={styles.spActions}>
          <Button to={routes.cinemaWatch}>
            {t("cinema:shorts.spotlight.watchNowCta")}
          </Button>
          <Button variant="ghost" to={`${routes.cinemaFilmmaker}/ines-tavares`}>
            {t("cinema:shorts.spotlight.tipCollectiveCta")}
          </Button>
          <button
            type="button"
            className={styles.shareBtn}
            onClick={() => shelf.onShare("The first Sunday")}
          >
            <FiShare2 aria-hidden />
            {t("cinema:film.share.title")}
          </button>
        </div>
        {/* eslint-disable local/no-literal-string -- spotlighted film's own watch/tip stats, a viewer's reaction quote, and its funding-source note; content per the scope rule, arrives over the wire in live mode */}
        <div className={styles.spTip}>
          <strong>819 watches</strong> this week · 94 tips sent · PT spoken / EN
          subs
        </div>
        <div className={styles.spReact}>
          <span className={styles.rNote}>
            “I cried into my coffee. In the good way.”{" "}
            <span className={styles.who}>Marta, sustainer</span>
          </span>
          <span className={styles.rMore}>+ 22 notes</span>
        </div>
        <div className={styles.spNudge}>
          <span className={styles.nDot} aria-hidden />
          <span>
            Sustainers funded this film through the spring pool, and they fund
            the €2.5k open grant. {/* eslint-enable local/no-literal-string */}
            <Link to={routes.cinemaMembership}>
              {t("cinema:shorts.spotlight.becomeSustainerCta")}{" "}
              <FiArrowRight aria-hidden />
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
