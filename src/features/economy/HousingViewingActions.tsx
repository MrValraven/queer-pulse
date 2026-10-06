import { useState } from "react";
import { routes } from "../../app/routeMap";
import { Button, ConfirmDialog, DatePicker } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { ModalShell } from "./ModalKit";
import { useViewingAction, type ViewingAction } from "./api/useHousingViewings";
import type { HousingViewingDTO } from "./api/housingViewings.api";
import v from "./housingViewings.module.css";

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

/** One proposed or agreed slot, as a chip on the viewing card. */
export function SlotChip({ slot }: { slot: string }) {
  const fmt = useFormat();
  return <span className={v.slotChip}>{formatSlot(slot, fmt)}</span>;
}

/** True once an accepted slot is in the past by this device's clock. Covers a
 * card loaded before the slot passed; the backend re-checks on complete. */
function hasSlotPassedNow(slot: string | null): boolean {
  return slot !== null && new Date(slot).getTime() <= Date.now();
}

/**
 * `useViewingAction` is `silentError` (no global toast), so every action on
 * the card reports its own failure here. A click that fails says so. A
 * success hands the updated viewing to `onActionSucceeded`, which the page
 * uses to move focus to the group the card lands in.
 */
function useViewingActionRunner(
  onActionSucceeded?: (updated: HousingViewingDTO) => void,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const action = useViewingAction();
  const run = (
    input: ViewingAction,
    callbacks: { onSuccess?: () => void; onSettled?: () => void } = {},
  ) =>
    action.mutate(input, {
      onSuccess: (updated) => {
        if (updated) onActionSucceeded?.(updated);
        callbacks.onSuccess?.();
      },
      onSettled: () => callbacks.onSettled?.(),
      onError: () =>
        showToast(t("economy:housingViewing.list.actionError"), "error"),
    });
  return { run, isPending: action.isPending };
}

interface ViewingActionsProps {
  viewing: HousingViewingDTO;
  /** The other party's display name, already resolved by the card. */
  counterpartyName: string;
  /** Called with the server's updated viewing after any action succeeds. */
  onActionSucceeded?: (updated: HousingViewingDTO) => void;
}

/**
 * The action row for a requested viewing: accept a slot, counter-propose or
 * decline when it is your turn; wait or call it off when it is theirs. The
 * requester withdraws their request; a lister who counter-proposed cancels
 * the viewing. Each of these, and declining, notifies the other side, so it
 * asks first.
 */
export function RequestedViewingActions({
  viewing,
  counterpartyName,
  onActionSucceeded,
}: ViewingActionsProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { run, isPending } = useViewingActionRunner(onActionSucceeded);
  const [isProposing, setIsProposing] = useState(false);
  const [isConfirmingWithdraw, setIsConfirmingWithdraw] = useState(false);
  const [isConfirmingDecline, setIsConfirmingDecline] = useState(false);

  if (viewing.youProposedLast) {
    const isRequester = viewing.role === "requester";
    return (
      <>
        <span className={v.actionHint}>
          {t("economy:housingViewing.list.waiting", { name: counterpartyName })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsConfirmingWithdraw(true)}
          disabled={isPending}
        >
          {t(
            isRequester
              ? "economy:housingViewing.list.withdrawRequest"
              : "economy:housingViewing.list.cancelViewing",
          )}
        </Button>
        <ConfirmDialog
          open={isConfirmingWithdraw}
          onClose={() => setIsConfirmingWithdraw(false)}
          onConfirm={() =>
            run(
              { id: viewing.id, action: "cancel" },
              { onSettled: () => setIsConfirmingWithdraw(false) },
            )
          }
          title={t(
            isRequester
              ? "economy:housingViewing.withdrawConfirm.title"
              : "economy:housingViewing.cancelConfirm.title",
          )}
          // A member whose profile is gone gets no notification, so the body
          // that promises one is left out for them.
          description={
            viewing.counterparty
              ? t(
                  isRequester
                    ? "economy:housingViewing.withdrawConfirm.body"
                    : "economy:housingViewing.cancelConfirm.bodyAsLister",
                  { name: counterpartyName },
                )
              : undefined
          }
          confirmLabel={t(
            isRequester
              ? "economy:housingViewing.withdrawConfirm.confirm"
              : "economy:housingViewing.cancelConfirm.confirm",
          )}
          cancelLabel={t("economy:housingViewing.cancelConfirm.keep")}
          tone="destructive"
          initialFocus="cancel"
          loading={isPending}
        />
      </>
    );
  }

  return (
    <>
      {/* The accept buttons get a full-width row of their own; the two answers
          that keep the conversation going sit together on the line below. */}
      {viewing.proposedSlots.length > 0 && (
        <div className={v.acceptRow}>
          {viewing.proposedSlots.map((slot) => (
            <Button
              key={slot}
              variant="jade"
              size="sm"
              onClick={() => run({ id: viewing.id, action: "accept", slot })}
              disabled={isPending}
            >
              {t("economy:housingViewing.list.acceptAt", {
                time: formatSlot(slot, fmt),
              })}
            </Button>
          ))}
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsProposing(true)}
        disabled={isPending}
      >
        {t("economy:housingViewing.list.propose")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsConfirmingDecline(true)}
        disabled={isPending}
      >
        {t("economy:housingViewing.list.decline")}
      </Button>
      <ConfirmDialog
        open={isConfirmingDecline}
        onClose={() => setIsConfirmingDecline(false)}
        onConfirm={() =>
          run(
            { id: viewing.id, action: "decline" },
            { onSettled: () => setIsConfirmingDecline(false) },
          )
        }
        title={t("economy:housingViewing.declineConfirm.title")}
        // A member whose profile is gone gets no notification, so the body
        // that promises one is left out for them.
        description={
          viewing.counterparty
            ? t("economy:housingViewing.declineConfirm.body", {
                name: counterpartyName,
              })
            : undefined
        }
        confirmLabel={t("economy:housingViewing.declineConfirm.confirm")}
        cancelLabel={t("economy:housingViewing.cancelConfirm.keep")}
        tone="destructive"
        initialFocus="cancel"
        loading={isPending}
      />
      {isProposing && (
        <ProposeTimesModal
          viewingId={viewing.id}
          onClose={() => setIsProposing(false)}
          onActionSucceeded={onActionSucceeded}
        />
      )}
    </>
  );
}

/**
 * The action row for an accepted viewing. "Mark completed" waits until the
 * slot has passed (PRD-446) and says it opens then; either side can call the
 * viewing off before then, behind a confirm (ENG-467). Once the slot has
 * passed, marking it done is the only action left. A backend that sends
 * neither flag gets the old row, with "Mark completed" straight away as its
 * only action.
 */
export function AcceptedViewingActions({
  viewing,
  counterpartyName,
  onActionSucceeded,
}: ViewingActionsProps) {
  const { t } = useTranslation();
  const { run, isPending } = useViewingActionRunner(onActionSucceeded);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const canComplete =
    (viewing.canComplete ?? true) || hasSlotPassedNow(viewing.acceptedSlot);
  const canCancel = viewing.canCancel === true && !canComplete;

  return (
    <>
      {canComplete ? (
        <Button
          variant="primary"
          size="sm"
          onClick={() => run({ id: viewing.id, action: "complete" })}
          disabled={isPending}
        >
          {t("economy:housingViewing.list.markCompleted")}
        </Button>
      ) : (
        viewing.acceptedSlot && (
          <span className={v.actionHint}>
            {t("economy:housingViewing.list.completeAfter")}
          </span>
        )
      )}
      {canCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsConfirmingCancel(true)}
          disabled={isPending}
        >
          {t("economy:housingViewing.list.cancelViewing")}
        </Button>
      )}
      <ConfirmDialog
        open={isConfirmingCancel}
        onClose={() => setIsConfirmingCancel(false)}
        onConfirm={() =>
          run(
            { id: viewing.id, action: "cancel" },
            { onSettled: () => setIsConfirmingCancel(false) },
          )
        }
        title={t("economy:housingViewing.cancelConfirm.title")}
        // A member whose profile is gone gets no notification, so the body
        // that promises one is left out for them.
        description={
          viewing.counterparty
            ? t(
                viewing.role === "requester"
                  ? "economy:housingViewing.cancelConfirm.bodyAsRequester"
                  : "economy:housingViewing.cancelConfirm.bodyAsLister",
                { name: counterpartyName },
              )
            : undefined
        }
        confirmLabel={t("economy:housingViewing.cancelConfirm.confirm")}
        cancelLabel={t("economy:housingViewing.cancelConfirm.keep")}
        tone="destructive"
        initialFocus="cancel"
        loading={isPending}
      />
    </>
  );
}

/**
 * The requester's way back in once a viewing is off (declined or cancelled):
 * a short line saying so and a link to the listing, where a new request
 * starts. The lister side has nothing to do here, so it renders nothing.
 *
 * The offer stands only while the server says the home is still open to this
 * member (`isListingOpen`): a filled, deleted, expired or taken-down home, or
 * one behind a block either way, would answer the link with a 404 or invite
 * contact the block forbids. The hint itself points at the listing, so it
 * shows only alongside the link.
 */
export function ClosedViewingActions({
  viewing,
}: {
  viewing: HousingViewingDTO;
}) {
  const { t } = useTranslation();
  if (viewing.role !== "requester" || viewing.isListingOpen !== true) {
    return null;
  }
  return (
    <>
      <span className={v.actionHint}>
        {t("economy:housingViewing.list.offHint")}
      </span>
      <Button
        variant="ghost"
        size="sm"
        to={`${routes.housing}/${viewing.listingSlug}`}
      >
        {t("economy:housingViewing.list.requestAgain")}
      </Button>
    </>
  );
}

/** Counter-propose new times for a viewing (the lister's "propose an
 * alternative" path). */
function ProposeTimesModal({
  viewingId,
  onClose,
  onActionSucceeded,
}: {
  viewingId: string;
  onClose: () => void;
  onActionSucceeded?: (updated: HousingViewingDTO) => void;
}) {
  const { t } = useTranslation();
  const { run, isPending } = useViewingActionRunner(onActionSucceeded);
  const [slotOne, setSlotOne] = useState("");
  const [slotTwo, setSlotTwo] = useState("");

  const submit = () => {
    const slots = [slotOne, slotTwo]
      .filter((slot) => slot.trim().length > 0)
      .map((slot) => new Date(slot).toISOString());
    if (slots.length === 0) return;
    run({ id: viewingId, action: "propose", slots }, { onSuccess: onClose });
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
          disabled={isPending || slotOne.trim().length === 0}
        >
          {t("economy:housingViewing.propose.send")}
        </Button>
      </div>
    </ModalShell>
  );
}
