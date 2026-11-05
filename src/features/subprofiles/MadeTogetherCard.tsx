import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import type {
  MadeTogetherCardView,
  MadeTogetherPersonaView,
} from "./api/madeTogether.adapters";
import { ACCENT_TOKENS, accentStyle } from "./subprofilePresence.data";
import styles from "./MadeTogetherCard.module.css";

/** Device pixels asked of a resizable image host: the card image is ~320px
 *  wide on a 2x screen, an avatar ~48px on a 2x screen. */
const CARD_IMAGE_SRC_SIZE = 640;
const AVATAR_SRC_SIZE = 96;

function PairAvatar({ persona }: { persona: MadeTogetherPersonaView }) {
  return (
    <span className={styles.avatar} style={accentStyle(persona.accent)}>
      {persona.avatarUrl ? (
        <ImageSlot
          src={persona.avatarUrl}
          alt=""
          shape="circle"
          crop={persona.avatarCrop}
          srcSize={AVATAR_SRC_SIZE}
          width="100%"
          height="100%"
        />
      ) : (
        <span className={styles.initials}>{persona.initials}</span>
      )}
    </span>
  );
}

/** The meta line: both crafts and the month, falling back to what exists
 *  when the date did not parse. */
function useMetaLine(card: MadeTogetherCardView): string {
  const { t } = useTranslation();
  const [firstKind, secondKind] = card.kindLabelKeys.map((key) => t(key));
  if (firstKind && secondKind) {
    return card.dateLabel
      ? t("subprofiles:directory.madeTogether.metaTwo", {
          first: firstKind,
          second: secondKind,
          month: card.dateLabel,
        })
      : `${firstKind}, ${secondKind}`;
  }
  if (!firstKind) return card.dateLabel;
  return card.dateLabel
    ? t("subprofiles:directory.madeTogether.metaOne", {
        kind: firstKind,
        month: card.dateLabel,
      })
    : firstKind;
}

/**
 * One credited piece of work: the two personas' overlapping avatars, "A with
 * B" with a link to each persona, the work's picture (or a wash of both
 * accents when it has none), its title, and a craft and month line.
 */
export function MadeTogetherCard({ card }: { card: MadeTogetherCardView }) {
  const metaLine = useMetaLine(card);
  const { author, partner } = card;
  // The src that failed to load, so a broken link falls back to the monogram
  // wash and a different src gets a fresh try without an effect to reset it.
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const shownImage =
    card.image !== null && card.image.src !== failedImageSrc
      ? card.image
      : null;
  const monogramLetter = Array.from(author.name.trim())[0]?.toUpperCase() ?? "";
  const washStyle = {
    "--author-tint": ACCENT_TOKENS[author.accent].tint,
  } as CSSProperties;
  return (
    <article className={styles.card}>
      <div className={styles.pair}>
        <span className={styles.avatars} aria-hidden="true">
          <PairAvatar persona={author} />
          <PairAvatar persona={partner} />
        </span>
        <span className={styles.names}>
          <Translation
            i18nKey="subprofiles:directory.madeTogether.pair"
            slots={{
              author: (
                <Link className={styles.nameLink} to={author.href}>
                  {author.name}
                </Link>
              ),
              partner: (
                <Link className={styles.nameLink} to={partner.href}>
                  {partner.name}
                </Link>
              ),
            }}
          />
        </span>
      </div>
      <div className={styles.media} style={washStyle}>
        {shownImage ? (
          <ImageSlot
            src={shownImage.src}
            alt=""
            tint="plum"
            placeholder=""
            crop={shownImage.crop}
            srcSize={CARD_IMAGE_SRC_SIZE}
            radius={0}
            width="100%"
            height="100%"
            onLoadError={() => setFailedImageSrc(shownImage.src)}
          />
        ) : (
          <span className={styles.monogram} aria-hidden="true">
            {monogramLetter}
          </span>
        )}
      </div>
      <div className={styles.text}>
        <h3 className={styles.title}>{card.title}</h3>
        {metaLine ? <p className={styles.meta}>{metaLine}</p> : null}
      </div>
    </article>
  );
}
