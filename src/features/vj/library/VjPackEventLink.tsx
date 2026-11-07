import { useRef, useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertTriangle, FiCalendar } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type {
  VjEventCardUnavailableReason,
  VjPackDTO,
} from "../../../shared/contracts/vj";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../../shared/components/ui";
import { intlLocale } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useSetVjPackEvent } from "../api/useSetVjPackEvent";
import { useVjPackEvent } from "../api/useVjPackEvent";
import { VjReasonLine } from "../VjReasonLine";
import { vjEventWhenOf } from "./vjEventOptionLabel";
import { VjPackEventPicker } from "./VjPackEventPicker";
import styles from "./VjPackEvent.module.css";

/** `--ease` and `--dur-fast`, for the swap between linked and unlinked. */
const SWAP_EASE = [0.22, 0.68, 0.16, 1] as const;
const SWAP_SECONDS = 0.15;

/** Why the projector hides the linked event's card, kept while the line
 *  folds away so its words never vanish mid-motion. */
function UnavailableLine({
  reason,
}: {
  reason: VjEventCardUnavailableReason | null;
}): JSX.Element {
  const { t } = useTranslation();
  const [lastReason, setLastReason] = useState(reason);
  if (reason !== null && reason !== lastReason) setLastReason(reason);
  const shownReason = reason ?? lastReason;
  return (
    <Collapse isOpen={reason !== null}>
      <p className={styles.warning} role="status">
        <FiAlertTriangle
          className={styles.warningIcon}
          aria-hidden="true"
          fill="none"
          focusable="false"
        />
        <span>
          {shownReason === null
            ? ""
            : t(`vj:packEvent.unavailable.${shownReason}`)}
        </span>
      </p>
    </Collapse>
  );
}

/** "Event: title, date" or "No event linked", fading from one to the next. */
function LinkedEventText({ pack }: { pack: VjPackDTO }): JSX.Element {
  const { t, language } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const text =
    pack.event === null
      ? t("vj:packEvent.none")
      : t("vj:packEvent.linked", {
          title: pack.event.title,
          date: vjEventWhenOf(pack.event.startAt, intlLocale(language)),
        });
  return (
    <span className={styles.event}>
      <FiCalendar
        className={styles.eventIcon}
        aria-hidden="true"
        fill="none"
        focusable="false"
      />
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={pack.event?.id ?? "no-event"}
          className={styles.eventText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : SWAP_SECONDS,
            ease: SWAP_EASE,
          }}
        >
          {text}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * The pack's event, under the pack header's meta line: the linked event and
 * its date, "Link event" or "Change event" (a fold with the picker) and,
 * while linked, "Unlink event", which unlinks at once with an Undo in its
 * toast. A linked event the projector may not show gets a line naming why.
 */
export function VjPackEventLink({ pack }: { pack: VjPackDTO }): JSX.Element {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { reducedMotion } = useMotionPrefs();
  const setPackEvent = useSetVjPackEvent();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [unlinkRefusal, setUnlinkRefusal] = useState<unknown>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const isUnavailable = pack.event?.isAvailable === false;
  const packEvent = useVjPackEvent(pack.id, { isEnabled: isUnavailable });
  const unavailableReason = isUnavailable
    ? (packEvent.data?.unavailableReason ?? null)
    : null;

  const closePicker = () => {
    setIsPickerOpen(false);
    // The picker that held focus folds away; focus goes back to its opener.
    openerRef.current?.focus({ preventScroll: true });
  };

  const relink = async (eventId: string) => {
    setUnlinkRefusal(null);
    try {
      await setPackEvent.mutateAsync({ packId: pack.id, eventId });
    } catch (cause) {
      setUnlinkRefusal(cause);
    }
  };

  const unlink = async () => {
    if (setPackEvent.isPending || pack.event === null) return;
    const unlinkedEventId = pack.event.id;
    setUnlinkRefusal(null);
    setIsPickerOpen(false);
    try {
      const unlinkedPack = await setPackEvent.mutateAsync({
        packId: pack.id,
        eventId: null,
      });
      // Unlink event leaves with the link; focus moves to Link event.
      openerRef.current?.focus({ preventScroll: true });
      showToast(
        t("vj:packEvent.toast.unlinked", { pack: unlinkedPack.name }),
        "success",
        undefined,
        {
          label: t("admin:common.undo"),
          onClick: () => void relink(unlinkedEventId),
        },
      );
    } catch (cause) {
      setUnlinkRefusal(cause);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.line}>
        <LinkedEventText pack={pack} />
        <div className={styles.actions}>
          <Button
            ref={openerRef}
            variant="quiet"
            size="sm"
            className={styles.action}
            aria-expanded={isPickerOpen}
            onClick={() => {
              setUnlinkRefusal(null);
              setIsPickerOpen((wasOpen) => !wasOpen);
            }}
          >
            {pack.event === null
              ? t("vj:packEvent.link")
              : t("vj:packEvent.change")}
          </Button>
          <AnimatePresence initial={false}>
            {pack.event !== null && (
              <m.span
                key="unlink"
                className={styles.actions}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: reducedMotion ? 0 : SWAP_SECONDS,
                  ease: SWAP_EASE,
                }}
              >
                <Button
                  variant="quiet"
                  size="sm"
                  className={styles.action}
                  aria-disabled={setPackEvent.isPending || undefined}
                  onClick={() => void unlink()}
                >
                  {t("vj:packEvent.unlink")}
                </Button>
              </m.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <UnavailableLine reason={unavailableReason} />
      <VjReasonLine error={unlinkRefusal} />
      <Collapse isOpen={isPickerOpen}>
        <VjPackEventPicker pack={pack} onDone={closePicker} />
      </Collapse>
    </div>
  );
}
