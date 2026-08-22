import { FiLoader, FiWifiOff } from "react-icons/fi";
import { useCardToken } from "./api/useCardToken";
import type { CardSkin, MyCardDTO } from "./api/cards.api";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CardQr } from "./CardQr";
import styles from "./MembershipCardFace.module.css";

// Depends on the CSS module import, so it stays in this file rather than a
// colocated .data.ts (see the repo's decomposition rule).
const SKIN_CLASS: Record<CardSkin, string | undefined> = {
  plum: styles.skinPlum,
  cream: styles.skinCream,
  jade: styles.skinJade,
  coral: styles.skinCoral,
  ink: styles.skinInk,
};

function verifyUrl(token: string): string {
  return `${window.location.origin}/cards/verify/${encodeURIComponent(token)}`;
}

/**
 * One membership card, front face.
 *
 * `isActive` gates the QR: the token only mints while the card is genuinely
 * on screen and unlocked. A card that is expired, suspended, or revoked shows
 * no QR at all, because there is nothing valid to prove.
 */
export function MembershipCardFace({
  card,
  isActive,
}: {
  card: MyCardDTO;
  isActive: boolean;
}) {
  const { t } = useTranslation();
  const canProve = card.status === "active";
  const { token, isMinting, error } = useCardToken(card.id, {
    isActive: isActive && canProve,
  });

  return (
    <article
      className={`${styles.card} ${SKIN_CLASS[card.program.skin]}`}
      // Threads the community's chosen accent token through as a CSS custom
      // property so the card face can actually render it (see
      // MembershipCardFace.module.css's `.cardName`/`.meta dt`, and the
      // comment there on why it's blended rather than swapped in outright).
      style={{ ["--card-accent" as string]: `var(--${card.program.accentToken})` }}
      aria-label={t("cards:face.ariaLabel", {
        community: card.communityName,
      })}
    >
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

      <div className={styles.qrSlot}>
        {!canProve ? (
          <p className={styles.qrNotice}>{t(`cards:qrNotice.${card.status}`)}</p>
        ) : error ? (
          <p className={styles.qrNotice}>
            <FiWifiOff aria-hidden="true" /> {t("cards:qrNotice.offline")}
          </p>
        ) : token ? (
          <CardQr
            url={verifyUrl(token)}
            ariaLabel={t("cards:face.qrAriaLabel", {
              community: card.communityName,
            })}
          />
        ) : isMinting ? (
          <p className={styles.qrNotice}>
            <FiLoader aria-hidden="true" /> {t("cards:qrNotice.minting")}
          </p>
        ) : null}
      </div>

      <footer className={styles.foot}>
        <p className={styles.holder}>{card.holderName}</p>
        <dl className={styles.meta}>
          <div>
            <dt>{t("cards:face.serial")}</dt>
            <dd>{card.serial}</dd>
          </div>
          <div>
            <dt>{t("cards:face.memberSince")}</dt>
            <dd>{new Date(card.issuedAt).getFullYear()}</dd>
          </div>
        </dl>
      </footer>
    </article>
  );
}
