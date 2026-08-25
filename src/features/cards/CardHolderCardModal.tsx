import { Link } from "react-router-dom";
import { Button, Modal, Tag } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CardProgramDTO, IssuerCardDTO } from "./api/cards.api";
import { CardHolderActions, type PendingCardStatus } from "./CardHolderActions";
import { cardRoleLabelKey } from "./cardRoles";
import { MembershipCardFace } from "./MembershipCardFace";
import { holderCardFace } from "./holderCard.data";
import styles from "./CardHolderCardModal.module.css";

/**
 * One holder's card, at full size, as their community's owner or mod sees it.
 *
 * The point of the roster row is to find a card; the point of this is to look
 * at one. So it draws the real `MembershipCardFace` — both sides, the flip,
 * the ground, the photo the card actually prints — rather than a mod-only
 * rendering of the same facts, which would drift from what the member holds
 * the moment either changed.
 *
 * That includes the scannable code. It is a permanent property of the card
 * rather than a live assertion about who is holding a phone, so an issuer
 * checking a member's card scans the very symbol that member shows. What
 * `isIssuerView` still carries is the naming: "your card" is wrong when a mod
 * is reading someone else's.
 *
 * The status actions come along, so a mod who opened a card to check it can
 * act on it without closing it first. They raise a `PendingCardStatus` or a
 * replace request rather than mutating: the panel above owns both
 * confirmations.
 */
export function CardHolderCardModal({
  holder,
  program,
  communityName,
  communitySlug,
  onRequestStatus,
  onRequestReplace,
  onClose,
}: {
  holder: IssuerCardDTO;
  program: CardProgramDTO;
  communityName: string;
  communitySlug: string;
  onRequestStatus: (pending: PendingCardStatus) => void;
  onRequestReplace: (holder: IssuerCardDTO) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const format = useFormat();

  const dateOf = (iso: string) =>
    format.date(new Date(iso), {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Modal
      wide
      className={styles.dialog}
      title={holder.holderName}
      sub={holder.serial}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("cards:holders.card.close")}
          </Button>
          <CardHolderActions
            holder={holder}
            onRequestStatus={onRequestStatus}
            onRequestReplace={onRequestReplace}
            className={styles.footerActions}
          />
        </>
      }
    >
      <div className={styles.layout}>
        <div className={styles.cardSlot}>
          <MembershipCardFace
            card={holderCardFace(holder, program, {
              name: communityName,
              slug: communitySlug,
            })}
            isActive
            isIssuerView
          />
          <p className={styles.caption}>{t("cards:holders.card.caption")}</p>
        </div>

        <div className={styles.detail}>
          <Tag>{t(`cards:status.tag.${holder.status}`)}</Tag>

          <dl className={styles.meta}>
            <div>
              <dt>{t("cards:holders.card.issued")}</dt>
              <dd>{dateOf(holder.issuedAt)}</dd>
            </div>
            <div>
              <dt>{t("cards:face.validUntil")}</dt>
              <dd>
                {holder.expiresAt
                  ? dateOf(holder.expiresAt)
                  : t("cards:face.neverExpires")}
              </dd>
            </div>
            <div>
              <dt>{t("cards:face.role")}</dt>
              <dd>{t(cardRoleLabelKey(holder.role))}</dd>
            </div>
            {holder.revokedAt ? (
              <div>
                <dt>{t("cards:holders.card.changedOn")}</dt>
                <dd>{dateOf(holder.revokedAt)}</dd>
              </div>
            ) : null}
          </dl>

          {/* Issuer-only, exactly as it is in the roster row: it is written by
              this community's staff for this community's staff, and appears on
              neither the card nor the public verify page. */}
          {holder.revokedReason ? (
            <div className={styles.reason}>
              <p className={styles.reasonLabel}>
                {t("cards:holders.reasonLabel")}
              </p>
              <p className={styles.reasonBody}>{holder.revokedReason}</p>
            </div>
          ) : null}

          {/* A holder whose profile has since gone leaves this empty, so the
              link is offered only when there is somewhere for it to go. */}
          {holder.holderSlug ? (
            <Link
              to={`/members/${holder.holderSlug}`}
              className={styles.profileLink}
            >
              {t("cards:holders.card.viewProfile")}
            </Link>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
