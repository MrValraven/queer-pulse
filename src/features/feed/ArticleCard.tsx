import { Link } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Avatar, Button, ImageSlot } from "../../shared/components/ui";
import { tintForSlug } from "../../shared/api/refs";
import { initials, relativeTime } from "./api/feed.adapters";
import type { FeedItem } from "./api/feed.api";
import { FeedReasonLine } from "./FeedPostActions";
import styles from "./FeedCard.module.css";
import {
  FeedActionLink,
  FeedActions,
  FeedCardHead,
  FeedCardShell,
  FeedIdentity,
  FeedQuote,
  FeedStat,
} from "./FeedCard";

/** The magazine publishes in these two languages, and `common:` already names
 *  them for the language switcher. Mapped rather than interpolated into the
 *  key so every key this card uses stays greppable. */
const LANGUAGE_LABEL_KEY: Record<string, string> = {
  en: "common:language.en",
  pt: "common:language.pt",
};

/** The lead art strip's rendered height. Passed to `ImageSlot` as a number so
 *  the slot reserves the box before the file arrives and the card never jumps. */
const ART_HEIGHT = 148;

/** The widest a feed card's art strip is ever rendered, at 2x, for hosts that
 *  can resize on request. */
const ART_SRC_WIDTH = 720;

/**
 * "Magazine piece" card for the feed's `article` `FeedItem`s (PRD-107).
 *
 * Live data only, like `ForumThreadCard`: the design prototype never scripted
 * a magazine card for the feed, so there is no `DEMO_*` mock to fall back to.
 *
 * Backend mapping: `title` = the headline, `summary` = the dek, `link` =
 * `/magazine/article?id={slug}`, and the magazine's own furniture arrives
 * beside them: `kicker`/`section`, `readMinutes`, `imageUrl` and `byline`.
 *
 * The BYLINE is not `actor`. A magazine credit is a `magazine_author` row that
 * often belongs to no member account, and its slug addresses
 * `/magazine/author/:slug`, so it gets its own field and its own link. `actor`
 * is present only when the byline is linked to a member, and is what the
 * block/mute filter reads.
 *
 * No "show me less of this" menu: the mute list holds communities and forum
 * threads, and a magazine piece is neither. Quieting the magazine would be a
 * publication-wide preference rather than a per-card one.
 */
export function ArticleCard({ item }: { item: FeedItem }) {
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const byline = item.byline ?? null;
  const bylineName = byline?.name ?? t("feed:card.article.anonymousByline");
  const bylineTint = byline ? tintForSlug(byline.slug) : "coral";
  const timestamp = relativeTime(item.createdAt, fmt);
  // The desk's kicker wins over the section: it is the line an editor wrote
  // for this piece, and the section is the shelf it sits on.
  const strapline = item.kicker || item.section || "";
  const readMinutes = item.readMinutes ?? 0;
  // Say which language the reader got, and only when it is not the one they
  // are reading the app in. A piece with no translation in their language is
  // served as written rather than withheld, so the card should not pretend.
  const otherLanguageKey =
    item.locale && item.locale !== language
      ? LANGUAGE_LABEL_KEY[item.locale]
      : undefined;

  return (
    <FeedCardShell accent="coral">
      <FeedCardHead
        label={t("feed:card.eyebrow.article")}
        timestamp={timestamp}
      />
      {item.imageUrl && (
        <div className={styles.articleArt}>
          <ImageSlot
            src={item.imageUrl}
            /* Decorative here: the headline sits directly beneath it and says
               everything this image is standing in for, so an alt would only
               repeat it to a screen reader. */
            alt=""
            width="100%"
            height={ART_HEIGHT}
            /* The feed grid packs two-up, so a card is never wider than about
               half the column. Saying so stops a resizable host being asked
               for a viewport-width file for a strip this size. */
            srcSize={ART_SRC_WIDTH}
            shape="rounded"
          />
        </div>
      )}
      <FeedIdentity
        lead={
          <Avatar
            initials={initials(bylineName)}
            tint={bylineTint}
            size={46}
            src={byline?.avatarUrl ?? undefined}
            alt={bylineName}
          />
        }
        name={item.title}
        meta={
          <FeedStat icon={<FiBookOpen aria-hidden />}>
            {byline ? (
              <Link
                className={styles.bylineLink}
                to={`${routes.author}/${byline.slug}`}
              >
                {t("feed:article.byline", { name: byline.name })}
              </Link>
            ) : (
              t("feed:article.byline", { name: bylineName })
            )}
            {readMinutes > 0 && (
              <>
                {" · "}
                {t("magazine:format.minRead", { count: readMinutes })}
              </>
            )}
            {strapline && (
              <>
                {" · "}
                {strapline}
              </>
            )}
          </FeedStat>
        }
      />
      <FeedQuote>{item.summary}</FeedQuote>
      {otherLanguageKey && (
        <p className={styles.articleLanguage}>
          {t("feed:article.inLanguage", { language: t(otherLanguageKey) })}
        </p>
      )}
      <FeedReasonLine reason={item.reason} subject={item.reasonSubject} />
      <FeedActions
        primary={
          <Button variant="ghost" size="sm" to={item.link}>
            {t("feed:action.readPiece")}
          </Button>
        }
        link={
          <FeedActionLink to={item.link}>
            {t("feed:action.readPiece")}
          </FeedActionLink>
        }
      />
    </FeedCardShell>
  );
}
