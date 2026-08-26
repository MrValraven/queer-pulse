import { Badge, Button, MemberIdentity } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  isCommunitySupportOption,
  SUPPORT_OPTION_LABEL_KEY,
  type CommunitySupportOfferDTO,
  type CommunitySupportOfferResponse,
} from "./api/communitySupportOffers.api";
import styles from "./ModToolsPanels.module.css";

/** A member ref's display name, the write-time snapshot, or the caller's
 *  placeholder when the staff account behind the offer has been erased. */
function offerAuthorName(
  offer: CommunitySupportOfferDTO,
  fallback: string,
): string {
  if (offer.offeredBy) {
    const { firstName, lastName } = offer.offeredBy;
    const name = `${firstName} ${lastName}`.trim();
    if (name) return name;
  }
  return offer.offeredByName ?? fallback;
}

/**
 * One offer of support: who from the platform made it, when, what exactly they
 * offered, the note they wrote, and the two answers this community can give.
 *
 * The offer used to be the emptiest thing on the platform. An admin picked
 * from four options, wrote a note, saw "Support sent" and the community never
 * heard a word. Everything on this row is what that toast was claiming.
 *
 * An answered offer keeps its row. "We said no thanks in March" is worth as
 * much to the next moderator reading this pane as an open offer is.
 */
export function SupportOfferRow({
  offer,
  isPending,
  onRespond,
  formatDate,
}: {
  offer: CommunitySupportOfferDTO;
  isPending: boolean;
  onRespond: (offerId: string, response: CommunitySupportOfferResponse) => void;
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();
  const authorName = offerAuthorName(
    offer,
    t("communities:detail.modtools.support.formerStaff"),
  );
  const isOpen = offer.status === "new";
  const options = offer.options.filter(isCommunitySupportOption);

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <MemberIdentity
          person={{
            slug: offer.offeredBy?.slug,
            name: authorName,
            avatarUrl: offer.offeredBy?.avatarUrl ?? undefined,
          }}
          size={36}
        />
        <p className={styles.meta}>
          {t("communities:detail.modtools.support.byOn", {
            name: authorName,
            date: formatDate(offer.createdAt),
          })}
        </p>
        <div>
          {isOpen ? (
            <Badge tone="amber">
              {t("communities:detail.modtools.support.status.new")}
            </Badge>
          ) : offer.status === "acknowledged" ? (
            <Badge tone="jade">
              {t("communities:detail.modtools.support.status.acknowledged")}
            </Badge>
          ) : (
            <Badge tone="ghost">
              {t("communities:detail.modtools.support.status.declined")}
            </Badge>
          )}
        </div>
        <ul className={styles.offerOptions}>
          {options.map((option) => (
            <li key={option}>{t(SUPPORT_OPTION_LABEL_KEY[option])}</li>
          ))}
        </ul>
        {offer.note && (
          <p className={styles.reason}>
            {t("communities:detail.modtools.support.note", {
              note: offer.note,
            })}
          </p>
        )}
        {!isOpen && offer.respondedAt && (
          <p className={styles.hint}>
            {t("communities:detail.modtools.support.answeredOn", {
              date: formatDate(offer.respondedAt),
            })}
          </p>
        )}
      </div>
      {isOpen && (
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="sm"
            disabled={isPending}
            aria-busy={isPending}
            onClick={() => onRespond(offer.id, "acknowledged")}
          >
            {t("communities:detail.modtools.support.acceptCta")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            aria-busy={isPending}
            onClick={() => onRespond(offer.id, "declined")}
          >
            {t("communities:detail.modtools.support.declineCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
