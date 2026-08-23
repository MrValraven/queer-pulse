import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { initialsFromName } from "../../shared/lib/initials";
import type { MyCardDTO } from "./api/cards.api";
import { CARD_PORTRAIT_PX } from "./useCardImagesReady";
import styles from "./MembershipCardFace.module.css";

/**
 * The identity side of a membership card: who issued it, what that community
 * calls its members, whose card this is, and — where the programme runs photo
 * cards and the holder has not vetoed theirs — their face.
 *
 * It carries the community's chosen ground (a pride flag, an uploaded photo,
 * or the flat skin) and the gloss laminate on top of it. The credential
 * itself, the code and the dates, lives on `CardBackFace`, the way it does on
 * a physical card: this side is the object, that side is the proof.
 *
 * The portrait is here rather than on the back for room. A CR80 back already
 * carries a QR sized to be scanned plus four fields of small type; a face
 * that also has to be big enough to check against a person does not fit
 * beside them at phone widths. The front has an empty half designed for it,
 * which is where every physical photo-ID card puts it too.
 *
 * `holderAvatarUrl` arrives from the backend already gated by BOTH switches
 * (programme allows photos, member has not hidden theirs), so a non-null
 * value is permission to draw. There is no second check here on purpose:
 * one boundary, not two. `holderPronouns` arrives on exactly the same terms.
 */
export function CardFrontFace({
  card,
  isPreview,
}: {
  card: MyCardDTO;
  /**
   * Designer/preview rendering. An owner who has just switched photos on must
   * see the composition change, and an owner whose own profile carries no
   * avatar would otherwise see nothing at all happen — so the preview fills
   * the slot with a monogram stand-in. A REAL card never does this: an empty
   * slot there means the member has no photo, and inventing a mark for them
   * would be inventing an identity the card does not hold.
   */
  isPreview: boolean;
}) {
  // The size is a shared constant because `resolveAvatarSrc` bakes it into
  // the URL: the preload that holds the card back until every image has
  // decoded has to ask for the very same one, or it would wait on a
  // different file than the one drawn here.
  const portraitSrc = resolveAvatarSrc(
    card.holderAvatarUrl ?? undefined,
    CARD_PORTRAIT_PX,
  );
  const hasPreviewStandIn =
    isPreview && !portraitSrc && card.program.allowsMemberPhoto;

  return (
    <>
      <header className={styles.head}>
        {card.program.crestUrl ? (
          <img
            className={styles.crest}
            src={card.program.crestUrl}
            alt=""
            width={36}
            height={36}
          />
        ) : null}
        <span className={styles.accentBar} aria-hidden="true" />
        <div>
          <p className={styles.community}>{card.communityName}</p>
          <p className={styles.cardName}>{card.program.cardName}</p>
        </div>
      </header>

      {portraitSrc ? (
        <img
          className={[
            styles.portrait,
            // The programme's choice, applied to a real face only: the
            // designer's monogram stand-in has no colour to take away, and
            // desaturating it would suggest the setting does less than it does.
            card.program.photoStyle === "mono" ? styles.portraitMono : "",
          ]
            .filter(Boolean)
            .join(" ")}
          src={portraitSrc}
          /* Empty on purpose: the holder's name is printed directly below it,
             so announcing the photo would repeat what the card already says.
             `referrerPolicy` for the Google-hosted case, which 403s the image
             when a referrer is sent. */
          alt=""
          referrerPolicy="no-referrer"
        />
      ) : hasPreviewStandIn ? (
        <span
          className={[styles.portrait, styles.portraitStandIn].join(" ")}
          aria-hidden="true"
        >
          {initialsFromName(card.holderName)}
        </span>
      ) : null}

      <footer className={styles.foot}>
        {/* Pronouns sit inside the name's own line rather than under it: they
            qualify the name, and a card this size has no room for a second
            baseline that would push the name off the ground it is set on. The
            parentheses are written here rather than in the catalogue so no
            translation can lose half a pair, and the pronouns carry their own
            `nowrap` so the closing bracket never lands on the next line. */}
        <p className={styles.holder}>
          {card.holderName}
          {card.holderPronouns ? (
            <span className={styles.holderPronouns}>
              {" "}
              ({card.holderPronouns})
            </span>
          ) : null}
        </p>
      </footer>

      {/* Last in the stacking order so the laminate sits over the print and
          the photo too, the way a real one does. Purely decorative and never
          interactive: `pointer-events: none` in the CSS keeps the flip button
          underneath it reachable. */}
      <span className={styles.gloss} aria-hidden="true">
        <span className={styles.glossSheen} />
      </span>
    </>
  );
}
