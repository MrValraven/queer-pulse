import { useState } from "react";
import { FiMapPin, FiVideo } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell } from "./ModalKit";
import { useRequestHousingViewing } from "./api/useHousingViewings";
import type { HousingViewingMode } from "./api/housingViewings.api";
import styles from "./housingModals.module.css";
import v from "./housingViewings.module.css";

const Check = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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

/** Request a viewing — video or in person — proposing a couple of times. This
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

  const canSend = slotOne.trim().length > 0 && !requestViewing.isPending;

  const handleSend = () => {
    const proposedSlots = [slotOne, slotTwo]
      .filter((slot) => slot.trim().length > 0)
      .map((slot) => new Date(slot).toISOString());
    requestViewing.mutate(
      { listingRef: listingRef ?? "", mode, proposedSlots, note: note.trim() },
      {
        onSuccess: () => setDone(true),
        onError: () =>
          showToast(t("economy:housingViewing.request.error"), "error"),
      },
    );
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:housingViewing.request.ariaLabel")}
    >
      {done ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <Check />
          </div>
          <div className={styles.title}>
            <Translation
              i18nKey="economy:housingViewing.request.successTitle"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.sub}>
            {t("economy:housingViewing.request.successBody")}
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" className={styles.full} onClick={onClose}>
              {t("economy:housingModal.done")}
            </Button>
          </div>
        </div>
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

          <div className={v.modeRow} role="group" aria-label={t("economy:housingViewing.request.modeLabel")}>
            <button
              type="button"
              className={[v.modeBtn, mode === "video" && v.modeOn]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={mode === "video"}
              onClick={() => setMode("video")}
            >
              <FiVideo aria-hidden /> {t("economy:housingViewing.request.video")}
            </button>
            <button
              type="button"
              className={[v.modeBtn, mode === "in_person" && v.modeOn]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={mode === "in_person"}
              onClick={() => setMode("in_person")}
            >
              <FiMapPin aria-hidden />{" "}
              {t("economy:housingViewing.request.inPerson")}
            </button>
          </div>

          <div className={v.slots}>
            <div className={v.slotRow}>
              <label className={v.slotLabel} htmlFor="viewing-slot-1">
                {t("economy:housingViewing.request.slotOne")}
              </label>
              <input
                id="viewing-slot-1"
                type="datetime-local"
                className={v.slotInput}
                value={slotOne}
                onChange={(event) => setSlotOne(event.target.value)}
              />
            </div>
            <div className={v.slotRow}>
              <label className={v.slotLabel} htmlFor="viewing-slot-2">
                {t("economy:housingViewing.request.slotTwo")}
              </label>
              <input
                id="viewing-slot-2"
                type="datetime-local"
                className={v.slotInput}
                value={slotTwo}
                onChange={(event) => setSlotTwo(event.target.value)}
              />
            </div>
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
