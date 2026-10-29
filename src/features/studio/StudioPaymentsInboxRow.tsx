import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import {
  Avatar,
  Button,
  CollapseListItem,
  ImageSlot,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import type { StudioSellerPurchaseView } from "./api/studioPurchases.adapters";
import { StudioEuroAmount } from "./StudioEuroAmount";
import css from "./StudioPayments.module.css";

const BUYER_AVATAR_SIZE = 28;
const COVER_SIZE = 56;

/** One payment a member says they made: what they bought and for how much,
 *  the reference and payer name the artist matches against their bank or
 *  MB WAY, who claimed it and when, then Confirm and Decline. The row folds
 *  in and out through `CollapseListItem`, inert while it leaves. The Confirm
 *  button carries the purchase id, so the inbox can move focus to the next
 *  row's Confirm once a row leaves. */
export function StudioPaymentsInboxRow({
  purchase,
  isBusy,
  onConfirm,
  onDecline,
}: {
  purchase: StudioSellerPurchaseView;
  isBusy: boolean;
  onConfirm: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { item, buyer } = purchase;
  const buyerName = buyer?.name ?? t("studio:purchase.inbox.deletedAccount");
  const ariaValues = { name: buyerName, title: item.title };
  return (
    <CollapseListItem>
      <div className={css.row}>
        {item.coverUrl && (
          <span className={css.thumb}>
            <ImageSlot
              src={item.coverUrl}
              width={COVER_SIZE}
              height={COVER_SIZE}
              radius={8}
              placeholder=""
            />
          </span>
        )}
        <div className={css.rowMain}>
          <p className={css.format}>{t(item.formatLabelKey)}</p>
          <div className={css.titleLine}>
            <p className={css.itemTitle}>
              {item.href ? (
                <Link to={item.href} className={css.link}>
                  {item.title}
                </Link>
              ) : (
                item.title
              )}
            </p>
            <p className={css.amount}>
              <StudioEuroAmount
                value={purchase.amountCents / 100}
                shouldEmphasizeNumber
              />
            </p>
          </div>
          <p className={css.meta}>
            <Translation
              i18nKey="studio:purchase.inbox.reference"
              values={{ code: purchase.referenceCode }}
              slots={{
                code: (
                  <span className={css.code} translate="no">
                    {purchase.referenceCode}
                  </span>
                ),
              }}
            />
          </p>
          {purchase.payerName && (
            <p className={css.meta}>
              {t("studio:purchase.inbox.payerName", {
                name: purchase.payerName,
              })}
            </p>
          )}
          <div className={css.buyer}>
            <div className={css.buyerName}>
              <Avatar
                initials={initialsFromName(buyerName)}
                src={buyer?.avatarUrl ?? undefined}
                size={BUYER_AVATAR_SIZE}
              />
              {buyer?.href ? (
                <Link to={buyer.href} className={css.link}>
                  {buyer.name}
                </Link>
              ) : (
                <span>{buyerName}</span>
              )}
            </div>
            <span>
              {t("studio:purchase.inbox.claimedOn", {
                date: fmt.date(purchase.createdAt, { dateStyle: "medium" }),
              })}
            </span>
          </div>
        </div>
        <div className={css.actions}>
          <Button
            variant="primary"
            size="sm"
            data-purchase-confirm={purchase.id}
            aria-label={t("studio:purchase.inbox.confirmAria", ariaValues)}
            aria-disabled={isBusy || undefined}
            onClick={() => {
              if (!isBusy) onConfirm();
            }}
          >
            <FiCheck aria-hidden /> {t("studio:purchase.inbox.confirmCta")}
          </Button>
          <Button
            variant="quiet"
            size="sm"
            aria-label={t("studio:purchase.inbox.declineAria", ariaValues)}
            aria-disabled={isBusy || undefined}
            onClick={() => {
              if (!isBusy) onDecline();
            }}
          >
            {t("studio:purchase.inbox.declineCta")}
          </Button>
        </div>
      </div>
    </CollapseListItem>
  );
}
