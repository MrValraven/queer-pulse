import { FiLoader, FiWifiOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { MyCardDTO } from "./api/cards.api";
import { CardQr } from "./CardQr";
import styles from "./MembershipCardFace.module.css";

function verifyUrl(token: string): string {
  return `${window.location.origin}/cards/verify/${encodeURIComponent(token)}`;
}

// The designer's stand-in symbol. A real URL shape so the module grid has a
// realistic density, and a token the backend will never recognise, so anyone
// who does scan a screenshot of a preview lands on the honest "could not be
// verified" screen rather than on someone's live card.
const PREVIEW_QR_URL = `${window.location.origin}/cards/verify/preview`;

/** The catalog only names the three roles a card can actually carry. */
const KNOWN_ROLES: readonly string[] = ["owner", "mod", "member"];

/**
 * The credential side of a membership card: the scannable code beside the
 * details a door, or the holder, actually needs to read off it.
 *
 * Two things shape this face. It is ALWAYS the flat skin, never the flag or
 * the uploaded photo: a ground here would put a scrim between a scanner and
 * the code and would sit under six lines of small type, so the design lives
 * on the front and the proof gets a clean surface. And the code sits in its
 * own column rather than above the text, because a card is 1.59:1 — stacked,
 * the square symbol gets whatever vertical space the type leaves it, which at
 * phone widths is too small to scan; beside it, it gets the card's full
 * height.
 *
 * The token is minted by the shell rather than here, so one card mints one
 * token no matter how many times it is turned over.
 */
export function CardBackFace({
  card,
  token,
  isMinting,
  hasError,
  isPreview,
  isIssuerView = false,
}: {
  card: MyCardDTO;
  token: string | null;
  isMinting: boolean;
  hasError: boolean;
  isPreview: boolean;
  /** An owner or mod reading a member's real card. See `MembershipCardFace`. */
  isIssuerView?: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const canProve = card.status === "active";
  const roleKey = KNOWN_ROLES.includes(card.role) ? card.role : "member";

  return (
    <>
      <div className={styles.backQrSlot}>
        {isPreview ? (
          <span className={styles.qrPlaceholder} aria-hidden="true">
            <CardQr url={PREVIEW_QR_URL} ariaLabel="" />
          </span>
        ) : !canProve ? (
          <p className={styles.qrNotice}>{t(`cards:qrNotice.${card.status}`)}</p>
        ) : isIssuerView ? (
          /* Deliberately a sentence rather than the preview's decoy symbol:
             this IS a live card, and drawing a code on it that no scanner
             would accept would teach a mod the card is broken. Why the code
             is absent is a fact about who is holding the phone. */
          <p className={styles.qrNotice}>{t("cards:qrNotice.holderOnly")}</p>
        ) : hasError ? (
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

      <div className={styles.backDetail}>
        <header className={styles.backHead}>
          <p className={styles.backCommunity}>{card.communityName}</p>
          <span className={styles.backStatus}>
            {t(`cards:status.tag.${card.status}`)}
          </span>
        </header>

        {/* Each pair wrapped, so the label can sit over its value and the
            whole set can reflow from two columns to one on a narrow card
            without a label ever being separated from what it names. */}
        <dl className={styles.backMeta}>
          <div>
            <dt>{t("cards:face.serial")}</dt>
            <dd>{card.serial}</dd>
          </div>
          <div>
            <dt>{t("cards:face.memberSince")}</dt>
            <dd>{new Date(card.issuedAt).getFullYear()}</dd>
          </div>
          <div>
            <dt>{t("cards:face.validUntil")}</dt>
            <dd>
              {card.expiresAt
                ? format.date(new Date(card.expiresAt), {
                    month: "short",
                    year: "numeric",
                  })
                : t("cards:face.neverExpires")}
            </dd>
          </div>
          <div>
            <dt>{t("cards:face.role")}</dt>
            <dd>{t(`cards:role.${roleKey}`)}</dd>
          </div>
        </dl>

        {/* Only shown when there is a code to scan: telling someone where to
            verify a card that currently has no symbol on it is an instruction
            they cannot follow. */}
        {canProve && !isIssuerView && (
          <p className={styles.backScan}>
            {t("cards:face.scanToVerify", {
              host: `${window.location.host}/cards`,
            })}
          </p>
        )}
      </div>
    </>
  );
}
