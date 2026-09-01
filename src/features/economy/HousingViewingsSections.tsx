import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, DatePicker } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { ModalShell } from "./ModalKit";
import { useViewingAction } from "./api/useHousingViewings";
import { useViewingReviewPair } from "./api/useHousingReviews";
import type {
  HousingViewingDTO,
  HousingViewingStatus,
} from "./api/housingViewings.api";
import v from "./housingViewings.module.css";

const STATUS_STYLE: Record<HousingViewingStatus, string | undefined> = {
  requested: v.stRequested,
  accepted: v.stAccepted,
  completed: v.stCompleted,
  declined: v.stClosed,
  cancelled: v.stClosed,
};

/**
 * A viewing slot as "Sun, 12 Jul, 14:30". Formatted through `fmt` so it
 * follows the app language: the old `toLocaleString(undefined, …)` followed
 * the browser's locale instead, so a member reading QueerPulse in Portuguese
 * could still be shown an English weekday and a 12-hour clock. Letting `Intl`
 * build the whole phrase also keeps the date/time join locale-correct.
 */
function formatSlot(iso: string, fmt: Formatters): string {
  return fmt.date(new Date(iso), {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ViewingCard({
  viewing,
  onReview,
}: {
  viewing: HousingViewingDTO;
  onReview: (viewing: HousingViewingDTO) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const action = useViewingAction();
  const [proposing, setProposing] = useState(false);
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
  const mustRespond =
    viewing.status === "requested" && !viewing.youProposedLast;

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

      {viewing.status === "accepted" && viewing.acceptedSlot ? (
        <div className={v.slotList}>
          <span className={v.slotChip}>
            {formatSlot(viewing.acceptedSlot, fmt)}
          </span>
        </div>
      ) : (
        viewing.status === "requested" && (
          <div className={v.slotList}>
            {viewing.proposedSlots.map((slot) => (
              <span key={slot} className={v.slotChip}>
                {formatSlot(slot, fmt)}
              </span>
            ))}
          </div>
        )
      )}

      {viewing.note && <p className={v.noteLine}>{viewing.note}</p>}
      {viewing.responseNote && (
        <p className={v.noteLine}>{viewing.responseNote}</p>
      )}

      <div className={v.cardActions}>
        {mustRespond &&
          viewing.proposedSlots.map((slot) => (
            <Button
              key={slot}
              variant="jade"
              size="sm"
              onClick={() =>
                action.mutate({ id: viewing.id, action: "accept", slot })
              }
              disabled={action.isPending}
            >
              {t("economy:housingViewing.list.acceptAt", {
                time: formatSlot(slot, fmt),
              })}
            </Button>
          ))}
        {mustRespond && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setProposing(true)}
              disabled={action.isPending}
            >
              {t("economy:housingViewing.list.propose")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                action.mutate({ id: viewing.id, action: "decline" })
              }
              disabled={action.isPending}
            >
              {t("economy:housingViewing.list.decline")}
            </Button>
          </>
        )}
        {viewing.status === "requested" && viewing.youProposedLast && (
          <>
            <span className={v.noteLine}>
              {t("economy:housingViewing.list.waiting", {
                name: counterpartyName,
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                action.mutate({ id: viewing.id, action: "cancel" })
              }
              disabled={action.isPending}
            >
              {t("economy:housingViewing.list.cancel")}
            </Button>
          </>
        )}
        {viewing.status === "accepted" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              action.mutate({ id: viewing.id, action: "complete" })
            }
            disabled={action.isPending}
          >
            {t("economy:housingViewing.list.markCompleted")}
          </Button>
        )}
        {isCompleted && (
          <Button variant="primary" size="sm" onClick={() => onReview(viewing)}>
            {t(
              hasReviewed
                ? "economy:housingViewing.list.yourReview"
                : "economy:housingViewing.list.leaveReview",
            )}
          </Button>
        )}
      </div>

      {proposing && (
        <ProposeTimesModal
          viewingId={viewing.id}
          onClose={() => setProposing(false)}
        />
      )}
    </div>
  );
}

/** Counter-propose new times for a viewing (the lister's "propose an
 * alternative" path). */
function ProposeTimesModal({
  viewingId,
  onClose,
}: {
  viewingId: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const action = useViewingAction();
  const [slotOne, setSlotOne] = useState("");
  const [slotTwo, setSlotTwo] = useState("");

  const submit = () => {
    const slots = [slotOne, slotTwo]
      .filter((slot) => slot.trim().length > 0)
      .map((slot) => new Date(slot).toISOString());
    if (slots.length === 0) return;
    action.mutate(
      { id: viewingId, action: "propose", slots },
      { onSuccess: onClose },
    );
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:housingViewing.propose.ariaLabel")}
    >
      <div className={v.pageTitle}>
        {t("economy:housingViewing.propose.title")}
      </div>
      <p className={v.pageSub}>{t("economy:housingViewing.propose.body")}</p>
      <div className={v.slots}>
        <div className={v.slotRow}>
          <label className={v.slotLabel} id="propose-slot-1-label">
            {t("economy:housingViewing.request.slotOne")}
          </label>
          <DatePicker
            mode="datetime"
            id="propose-slot-1"
            labelledBy="propose-slot-1-label"
            value={slotOne || null}
            onChange={(value) => setSlotOne(value ?? "")}
          />
        </div>
        <div className={v.slotRow}>
          <label className={v.slotLabel} id="propose-slot-2-label">
            {t("economy:housingViewing.request.slotTwo")}
          </label>
          <DatePicker
            mode="datetime"
            id="propose-slot-2"
            labelledBy="propose-slot-2-label"
            value={slotTwo || null}
            onChange={(value) => setSlotTwo(value ?? "")}
          />
        </div>
      </div>
      <div className={v.cardActions}>
        <Button variant="ghost" onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </Button>
        <Button
          variant="primary"
          onClick={submit}
          disabled={action.isPending || slotOne.trim().length === 0}
        >
          {t("economy:housingViewing.propose.send")}
        </Button>
      </div>
    </ModalShell>
  );
}
