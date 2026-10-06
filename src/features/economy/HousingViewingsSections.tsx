import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useViewingReviewPair } from "./api/useHousingReviews";
import type {
  HousingViewingDTO,
  HousingViewingParty,
  HousingViewingStatus,
} from "./api/housingViewings.api";
import {
  AcceptedViewingActions,
  ClosedViewingActions,
  RequestedViewingActions,
  SlotChip,
} from "./HousingViewingActions";
import v from "./housingViewings.module.css";

const STATUS_STYLE: Record<HousingViewingStatus, string | undefined> = {
  requested: v.stRequested,
  accepted: v.stAccepted,
  completed: v.stCompleted,
  declined: v.stClosed,
  cancelled: v.stClosed,
};

/**
 * Who wrote `responseNote`, matching the backend's rule: only a
 * counter-proposal or a decline writes it. A proposal moves `proposedBy` to
 * its author, while a decline leaves `proposedBy` on the party turned down,
 * so a declined viewing's note belongs to the other party.
 */
function responseNoteAuthorOf(viewing: HousingViewingDTO): HousingViewingParty {
  if (viewing.status !== "declined") return viewing.proposedBy;
  return viewing.proposedBy === "requester" ? "lister" : "requester";
}

/** One note on the card, led by who wrote it: "You" or the other party. */
function ViewingNote({
  text,
  author,
  viewerRole,
  counterpartyName,
}: {
  text: string;
  author: HousingViewingParty;
  viewerRole: HousingViewingParty;
  counterpartyName: string;
}) {
  const { t } = useTranslation();
  const authorName =
    author === viewerRole ? t("economy:msg.you") : counterpartyName;
  return (
    <p className={v.noteLine}>
      <span className={v.noteAuthor}>{`${authorName}:`}</span> {text}
    </p>
  );
}

export function ViewingCard({
  viewing,
  onReview,
  onActionSucceeded,
}: {
  viewing: HousingViewingDTO;
  onReview: (viewing: HousingViewingDTO) => void;
  /** Called with the updated viewing after an action on this card succeeds. */
  onActionSucceeded?: (updated: HousingViewingDTO) => void;
}) {
  const { t } = useTranslation();
  const isCompleted = viewing.status === "completed";
  // CACHE-ONLY: `isEnabled: false` fires no request. The pair endpoint is one
  // call per viewing and the "past" group is unbounded, so a row must not fetch
  // it just to pick a button label. It reads whatever `ReviewViewingModal`
  // already loaded for this viewing, which is what turns "Leave a review" into
  // "Your review" once the member has written one. Before that it is absent and
  // the button keeps its invitation, which is the right thing to say to
  // somebody who has not reviewed yet.
  const reviewPairQuery = useViewingReviewPair(
    isCompleted ? viewing.id : undefined,
    { isEnabled: false },
  );
  const hasReviewed = Boolean(reviewPairQuery.data?.youReviewed);
  const counterpartyName = viewing.counterparty
    ? `${viewing.counterparty.firstName} ${viewing.counterparty.lastName}`.trim()
    : t("economy:housingViewing.list.someone");

  return (
    <div className={v.card}>
      <div className={v.cardTop}>
        <div>
          <Link
            to={`${routes.housing}/${viewing.listingSlug}`}
            className={v.cardTitle}
          >
            {viewing.listingTitle}
          </Link>
          <div className={v.cardMeta}>
            {t(
              viewing.role === "requester"
                ? "economy:housingViewing.list.withLister"
                : "economy:housingViewing.list.fromEnquirer",
              { name: counterpartyName },
            )}{" "}
            ·{" "}
            {t(
              viewing.mode === "video"
                ? "economy:housingViewing.list.video"
                : "economy:housingViewing.list.inPerson",
            )}
          </div>
        </div>
        <span
          className={[v.statusPill, STATUS_STYLE[viewing.status]].join(" ")}
        >
          {t(`economy:housingViewing.status.${viewing.status}`)}
        </span>
      </div>

      {/* A cancelled viewing keeps its agreed time on the card, so the
          member can still see which slot was called off. */}
      {(viewing.status === "accepted" || viewing.status === "cancelled") &&
      viewing.acceptedSlot ? (
        <div className={v.slotList}>
          <SlotChip slot={viewing.acceptedSlot} />
        </div>
      ) : (
        viewing.status === "requested" && (
          <div className={v.slotList}>
            {viewing.proposedSlots.map((slot) => (
              <SlotChip key={slot} slot={slot} />
            ))}
          </div>
        )
      )}

      {viewing.note && (
        <ViewingNote
          text={viewing.note}
          author="requester"
          viewerRole={viewing.role}
          counterpartyName={counterpartyName}
        />
      )}
      {viewing.responseNote && (
        <ViewingNote
          text={viewing.responseNote}
          author={responseNoteAuthorOf(viewing)}
          viewerRole={viewing.role}
          counterpartyName={counterpartyName}
        />
      )}

      <div className={v.cardActions}>
        {viewing.status === "requested" && (
          <RequestedViewingActions
            viewing={viewing}
            counterpartyName={counterpartyName}
            onActionSucceeded={onActionSucceeded}
          />
        )}
        {viewing.status === "accepted" && (
          <AcceptedViewingActions
            viewing={viewing}
            counterpartyName={counterpartyName}
            onActionSucceeded={onActionSucceeded}
          />
        )}
        {(viewing.status === "declined" || viewing.status === "cancelled") && (
          <ClosedViewingActions viewing={viewing} />
        )}
        {/* A deleted home has nothing left to review; a filled one still has
            the viewing that happened, so it keeps the button. */}
        {isCompleted && viewing.isListingDeleted !== true && (
          <Button variant="primary" size="sm" onClick={() => onReview(viewing)}>
            {t(
              hasReviewed
                ? "economy:housingViewing.list.yourReview"
                : "economy:housingViewing.list.leaveReview",
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
