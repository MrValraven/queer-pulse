import { useState } from "react";
import { FiMapPin, FiVideo } from "react-icons/fi";
import { ApiError } from "../../shared/api/client";
import { Button, DatePicker } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell, SuccessPanel } from "./ModalKit";
import { useRequestHousingViewing } from "./api/useHousingViewings";
import { useAffirmingPledgeGate } from "./useAffirmingPledgeGate";
import { useStepUpVerificationGate } from "./useStepUpVerificationGate";
import type {
  HousingViewingMode,
  RequestViewingBody,
} from "./api/housingViewings.api";
import styles from "./housingModals.module.css";
import v from "./housingViewings.module.css";

/** Video or in person, as a pair of pressed-state toggles. */
function ViewingModeToggle({
  mode,
  onChange,
}: {
  mode: HousingViewingMode;
  onChange: (mode: HousingViewingMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={v.modeRow}
      role="group"
      aria-label={t("economy:housingViewing.request.modeLabel")}
    >
      <button
        type="button"
        className={[v.modeBtn, mode === "video" && v.modeOn]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={mode === "video"}
        onClick={() => onChange("video")}
      >
        <FiVideo aria-hidden /> {t("economy:housingViewing.request.video")}
      </button>
      <button
        type="button"
        className={[v.modeBtn, mode === "in_person" && v.modeOn]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={mode === "in_person"}
        onClick={() => onChange("in_person")}
      >
        <FiMapPin aria-hidden /> {t("economy:housingViewing.request.inPerson")}
      </button>
    </div>
  );
}

/** A datetime-local value string (`YYYY-MM-DDTHH:mm`) some days from now. */
function defaultSlot(daysAhead: number, hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Request a viewing (video or in person), proposing a couple of times. This
 * is the research-backed anti-scam step: see the home live (or on a video call)
 * before any money changes hands. */
export function RequestViewingModal({
  listingTitle,
  listingRef,
  onClose,
}: {
  listingTitle: string;
  listingRef: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [mode, setMode] = useState<HousingViewingMode>("video");
  const [slotOne, setSlotOne] = useState(() => defaultSlot(2, 18));
  const [slotTwo, setSlotTwo] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const requestViewing = useRequestHousingViewing();
  // A viewing is the most direct route to meeting a lister, so it sits behind
  // the same mandatory affirming pledge as every other housing contact path
  // (HousingEnquiryModal, SayHelloModal, ContactRequestModal, JoinGroupModal…)
  // and the same phone step-up the server checks next: a 403 opens the matching
  // prompt, and the same request is sent again once the member has passed it.
  const { handlePledgeError, pledgeGate } = useAffirmingPledgeGate();
  const { handleStepUpError, stepUpGate } = useStepUpVerificationGate();

  // Proposing a time that has already passed, or a second slot that lands
  // before the first, can only waste the lister's reply.
  const slotOneTime = slotOne ? new Date(slotOne).getTime() : Number.NaN;
  const slotTwoTime = slotTwo ? new Date(slotTwo).getTime() : Number.NaN;
  // The clock is read in the pickers' own change handlers (see `onChange`
  // below) and kept in state, since `Date.now()` is impure,
  // so calling it during render would re-judge "is this in the future" against
  // a different clock on any unrelated re-render. Reading it as the member
  // picks is also the accurate moment to ask, where a mount-time snapshot
  // would still accept a slot that passed while the modal sat open.
  const [nowMs, setNowMs] = useState(() => 0);
  const isSlotOneFuture = Number.isFinite(slotOneTime) && slotOneTime > nowMs;
  const isSlotTwoOrdered =
    slotTwo.trim().length === 0 ||
    (Number.isFinite(slotTwoTime) && slotTwoTime > slotOneTime);
  const slotErrorKey = !slotOne.trim()
    ? null
    : !isSlotOneFuture
      ? "economy:housingViewing.request.slotPastError"
      : !isSlotTwoOrdered
        ? "economy:housingViewing.request.slotOrderError"
        : null;
  const canSend =
    slotOne.trim().length > 0 &&
    isSlotOneFuture &&
    isSlotTwoOrdered &&
    !requestViewing.isPending;

  // A gate's retry resends this exact body, so the slots and note the member
  // chose are the ones that reach the lister.
  const submitRequest = (body: RequestViewingBody) => {
    requestViewing.mutate(body, {
      onSuccess: () => setDone(true),
      onError: (error) => {
        const retry = () => submitRequest(body);
        if (handlePledgeError(error, retry)) return;
        if (handleStepUpError(error, retry)) return;
        // A 404 here means the home is filled, expired or off the board.
        const messageKey =
          error instanceof ApiError && error.status === 404
            ? "economy:housingViewing.request.unavailable"
            : "economy:housingViewing.request.error";
        showToast(t(messageKey), "error");
      },
    });
  };

  const handleSend = () => {
    const proposedSlots = [slotOne, slotTwo]
      .filter((slot) => slot.trim().length > 0)
      .map((slot) => new Date(slot).toISOString());
    submitRequest({
      listingRef: listingRef ?? "",
      mode,
      proposedSlots,
      note: note.trim(),
    });
  };

  const gate = pledgeGate ?? stepUpGate;
  if (gate) return gate;

  return (
    <ModalShell
      onClose={onClose}
      success={done}
      ariaLabel={t("economy:housingViewing.request.ariaLabel")}
    >
      {done ? (
        <SuccessPanel
          title={
            <Translation
              i18nKey="economy:housingViewing.request.successTitle"
              components={{ em: <em /> }}
            />
          }
          onClose={onClose}
          closeLabel={t("economy:housingModal.done")}
        >
          {t("economy:housingViewing.request.successBody")}
        </SuccessPanel>
      ) : (
        <div>
          <div className={styles.eye}>
            {t("economy:housingViewing.request.eyebrow")}
          </div>
          <div className={styles.title}>
            <Translation
              i18nKey="economy:housingViewing.request.title"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.sub}>
            <Translation
              i18nKey="economy:housingViewing.request.body"
              values={{ listingTitle }}
              components={{ strong: <strong /> }}
            />
          </p>

          <ViewingModeToggle mode={mode} onChange={setMode} />

          <div className={v.slots}>
            <div className={v.slotRow}>
              <label className={v.slotLabel} id="viewing-slot-1-label">
                {t("economy:housingViewing.request.slotOne")}
              </label>
              <DatePicker
                mode="datetime"
                id="viewing-slot-1"
                labelledBy="viewing-slot-1-label"
                value={slotOne || null}
                onChange={(value) => {
                  setNowMs(Date.now());
                  setSlotOne(value ?? "");
                }}
              />
            </div>
            <div className={v.slotRow}>
              <label className={v.slotLabel} id="viewing-slot-2-label">
                {t("economy:housingViewing.request.slotTwo")}
              </label>
              <DatePicker
                mode="datetime"
                id="viewing-slot-2"
                labelledBy="viewing-slot-2-label"
                value={slotTwo || null}
                onChange={(value) => {
                  setNowMs(Date.now());
                  setSlotTwo(value ?? "");
                }}
              />
            </div>
            {slotErrorKey && (
              <p className={v.slotError} role="alert">
                {t(slotErrorKey)}
              </p>
            )}
          </div>

          <textarea
            className={styles.textarea}
            placeholder={t("economy:housingViewing.request.notePlaceholder")}
            aria-label={t("economy:housingViewing.request.noteLabel")}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className={styles.note}>
            {t("economy:housingViewing.request.safety")}
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={onClose}>
              {t("economy:housingModal.cancel")}
            </Button>
            <Button
              variant="primary"
              className={styles.full}
              onClick={handleSend}
              disabled={!canSend}
            >
              {t("economy:housingViewing.request.send")}
            </Button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
