import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { MyCardDTO } from "./api/cards.api";
import { cardRoleLabelKey } from "./cardRoles";
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
 * The code is the card's own permanent value and arrives on the card object,
 * so turning the card over costs nothing and an issuer reading a member's
 * card draws the same symbol that member shows.
 */
export function CardBackFace({
  card,
  isPreview,
}: {
  card: MyCardDTO;
  isPreview: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const canProve = card.status === "active";
  const roleKey = cardRoleLabelKey(card.role);

  return (
    <>
      <div className={styles.backQrSlot}>
        {isPreview ? (
          <span className={styles.qrPlaceholder} aria-hidden="true">
            <CardQr url={PREVIEW_QR_URL} ariaLabel="" />
          </span>
        ) : !canProve ? (
          <p className={styles.qrNotice}>{t(`cards:qrNotice.${card.status}`)}</p>
        ) : card.token ? (
          <CardQr
            url={verifyUrl(card.token)}
            ariaLabel={t("cards:face.qrAriaLabel", {
              community: card.communityName,
            })}
          />
        ) : (
          /* Only reachable when the platform has no card signing key at all,
             so no card anywhere has a code. Says so plainly rather than
             leaving an empty slot. */
          <p className={styles.qrNotice}>{t("cards:qrNotice.unavailable")}</p>
        )}
      </div>

      <div className={styles.backDetail}>
        <header className={styles.backHead}>
          <p className={styles.backCommunity}>{card.communityName}</p>
          <span className={styles.backStatus}>
            {t(`cards:status.tag.${card.status}`)}
          </span>
        </header>

        {/* Each pair wrapped, so the label sits over its value and the set
            reads straight down as one field per row. Packed across the
            column they crowded each other and the longest value truncated,
            which on a credential is the line you least want cut. */}
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
            <dd>{t(roleKey)}</dd>
          </div>
        </dl>
      </div>

      {/* A row of its own under both columns rather than the last item in the
          detail column: it is an instruction about the card, and the detail
          column is too narrow to hold a host name on one line.

          Only shown when there is a code to scan: telling someone where to
          verify a card that currently has no symbol on it is an instruction
          they cannot follow. */}
      {canProve && card.token && (
        <p className={styles.backScan}>
          {t("cards:face.scanToVerify", {
            host: `${window.location.host}/cards`,
          })}
        </p>
      )}
    </>
  );
}
