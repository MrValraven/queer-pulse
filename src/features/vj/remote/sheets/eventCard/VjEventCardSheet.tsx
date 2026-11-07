import { AnimatePresence, m } from "motion/react";
import { useState, type ReactNode } from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiEyeOff,
  FiMapPin,
  FiMaximize,
} from "react-icons/fi";
import { routes } from "../../../../../app/routeMap";
import { useMotionPrefs } from "../../../../../app/providers/motionPrefs";
import {
  Button,
  Collapse,
  SkeletonCard,
} from "../../../../../shared/components/ui";
import type {
  VjEventCard,
  VjEventCardDTO,
  VjEventCardKind,
  VjPackEventDTO,
} from "../../../../../shared/contracts/vj";
import type { TranslateOptions } from "../../../../../shared/i18n/types";
import { useFormat, type Formatters } from "../../../../../shared/i18n/format";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { useVjPackEvent } from "../../../api/useVjPackEvent";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { vjErrorKeyOf, vjErrorValuesOf } from "../../../vjErrors";
import { VjSheetFrame } from "../../kit/VjSheetFrame";
import type { VjRun } from "../../useVjCommandRunner";
import { VjSheetAlert } from "../../VjSheetAlert";
import styles from "./VjEventCardSheet.module.css";

/** The same date parts the projector's card prints. */
const VJ_EVENT_CARD_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "numeric",
  minute: "2-digit",
};

const VIEW_FADE_SECONDS = 0.2;

const UNAVAILABLE_KEY: Record<
  NonNullable<VjPackEventDTO["unavailableReason"]>,
  string
> = {
  cancelled: "vj:eventCard.unavailable.cancelled",
  not_listed: "vj:eventCard.unavailable.notListed",
};

const SHOWN_STATUS_KEY: Record<VjEventCardKind, string> = {
  qr: "vj:eventCard.status.qr",
  nextEvent: "vj:eventCard.status.nextEvent",
};

/** The start in the event's own time zone; the device zone stands in for an unknown zone name. */
function vjEventCardDateLine(card: VjEventCardDTO, format: Formatters): string {
  const start = new Date(card.startAt);
  if (Number.isNaN(start.getTime())) return "";
  try {
    return format.date(start, {
      ...VJ_EVENT_CARD_DATE_OPTIONS,
      timeZone: card.timezone,
    });
  } catch {
    return format.date(start, VJ_EVENT_CARD_DATE_OPTIONS);
  }
}

/** What the screen will print: title, start and place, plus where the QR code leads. */
function VjEventCardPreview({ card }: { card: VjEventCardDTO }) {
  const { t } = useTranslation();
  const format = useFormat();
  const dateLine = vjEventCardDateLine(card, format);
  const area = card.area?.trim() ?? "";
  const placeLine = card.isOnline
    ? t("vj:packEvent.online")
    : area === ""
      ? null
      : area;
  return (
    <div className={styles.preview} data-vj-event-card-preview="">
      <p className={styles.eyebrow}>{t("vj:eventCard.linked")}</p>
      <p className={styles.title}>{card.title}</p>
      {dateLine === "" ? null : (
        <p className={styles.line}>
          <FiCalendar aria-hidden fill="none" className={styles.lineIcon} />
          <span>{dateLine}</span>
        </p>
      )}
      {placeLine === null ? null : (
        <p className={styles.line}>
          <FiMapPin aria-hidden fill="none" className={styles.lineIcon} />
          <span>{placeLine}</span>
        </p>
      )}
      <p className={styles.hint}>
        {t(
          card.publicUrl === null
            ? "vj:eventCard.noQrLink"
            : "vj:eventCard.qrHint",
        )}
      </p>
    </div>
  );
}

/** Why there is no card to show, and the way to the library where packs get their event. */
function VjEventCardMissing({ messageKey }: { messageKey: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.missing} data-vj-event-card-missing="">
      <p className={styles.missingText}>{t(messageKey)}</p>
      <Button
        variant="stage-ghost"
        to={routes.adminVj}
        className={styles.wideButton}
      >
        <FiBookOpen aria-hidden fill="none" />
        {t("vj:eventCard.openLibrary")}
      </Button>
    </div>
  );
}

interface VjEventCardControlsProps {
  eventCard: VjEventCard;
  pendingKey: string | null;
  isBlocked: boolean;
  onShow: (kind: VjEventCardKind) => void;
  onHide: () => void;
}

/** Show the QR code, show the next event card, hide the card; the shown kind is pressed. */
function VjEventCardControls({
  eventCard,
  pendingKey,
  isBlocked,
  onShow,
  onHide,
}: VjEventCardControlsProps) {
  const { t } = useTranslation();
  const isHeld = isBlocked || pendingKey !== null;
  const kindButton = (
    kind: VjEventCardKind,
    labelKey: string,
    icon: ReactNode,
  ) => (
    <button
      type="button"
      className={styles.chip}
      aria-pressed={eventCard.isVisible && eventCard.kind === kind}
      aria-disabled={isHeld || undefined}
      aria-busy={pendingKey === kind || undefined}
      data-vj-event-card-kind={kind}
      onClick={() => {
        if (!isHeld) onShow(kind);
      }}
    >
      {icon}
      <span>{t(labelKey)}</span>
    </button>
  );
  return (
    <div className={styles.controls}>
      {kindButton(
        "qr",
        "vj:eventCard.showQr",
        <FiMaximize aria-hidden fill="none" />,
      )}
      {kindButton(
        "nextEvent",
        "vj:eventCard.showNext",
        <FiCalendar aria-hidden fill="none" />,
      )}
      <Button
        variant="stage-ghost"
        className={styles.wideButton}
        aria-disabled={isHeld || !eventCard.isVisible || undefined}
        aria-busy={pendingKey === "hide" || undefined}
        onClick={() => {
          if (!isHeld && eventCard.isVisible) onHide();
        }}
      >
        <FiEyeOff aria-hidden fill="none" />
        {t("vj:eventCard.hide")}
      </Button>
      <p role="status" className={styles.status}>
        {t(
          eventCard.isVisible
            ? SHOWN_STATUS_KEY[eventCard.kind]
            : "vj:eventCard.status.hidden",
        )}
      </p>
    </div>
  );
}

interface VjSheetAlertLine {
  key: string;
  values?: TranslateOptions;
}

/** One command at a time, and the line naming why the last one failed. */
function useVjEventCardCommands(run: VjRun) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [alertLine, setAlertLine] = useState<VjSheetAlertLine | null>(null);
  const send = (
    nextPendingKey: string,
    patch: { isVisible: boolean; kind?: VjEventCardKind },
  ) => {
    setPendingKey(nextPendingKey);
    void run("setEventCard", patch)
      .then(
        (outcome: VjCommandOutcome) => {
          if (outcome.ok) setAlertLine(null);
          else if (outcome.errorKey !== null) {
            setAlertLine({
              key: outcome.errorKey,
              values: { ...outcome.errorValues },
            });
          }
        },
        (cause: unknown) =>
          setAlertLine({
            key: vjErrorKeyOf(cause),
            values: vjErrorValuesOf(cause),
          }),
      )
      .finally(() => setPendingKey(null));
  };
  return {
    pendingKey,
    alertLine,
    show: (kind: VjEventCardKind) => send(kind, { isVisible: true, kind }),
    hide: () => send("hide", { isVisible: false }),
  };
}

type VjEventCardView = "noPack" | "loading" | "failed" | "missing" | "card";

export interface VjEventCardSheetProps {
  /** `stage.latestState.eventCard`: what the screens were last told to show. */
  eventCard: VjEventCard;
  activePackId: string | null;
  run: VjRun;
  isBlocked: boolean;
  onClose: () => void;
}

/**
 * The event card of the active pack's linked event: a preview of the lines
 * the screen prints, then Show the event QR code, Show the next event card
 * and Hide event card. A pack without a usable event says why and opens the
 * VJ library, where packs get their event. Nothing here names attendees,
 * hosts or personas.
 */
export function VjEventCardSheet({
  eventCard,
  activePackId,
  run,
  isBlocked,
  onClose,
}: VjEventCardSheetProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const packEventQuery = useVjPackEvent(activePackId, {
    isEnabled: activePackId !== null,
  });
  const commands = useVjEventCardCommands(run);
  const packEvent = packEventQuery.data ?? null;
  const card = packEvent?.card ?? null;
  const loadError = packEvent === null ? packEventQuery.error : null;

  const view: VjEventCardView =
    activePackId === null
      ? "noPack"
      : loadError !== null
        ? "failed"
        : packEvent === null
          ? "loading"
          : card === null
            ? "missing"
            : "card";
  const missingKey =
    packEvent?.unavailableReason == null
      ? "vj:eventCard.none"
      : UNAVAILABLE_KEY[packEvent.unavailableReason];
  const shownAlert =
    commands.alertLine ??
    (loadError === null
      ? null
      : { key: vjErrorKeyOf(loadError), values: vjErrorValuesOf(loadError) });

  return (
    <VjSheetFrame
      title={t("vj:eventCard.title")}
      closeLabel={t("vj:eventCard.close")}
      onClose={onClose}
    >
      <div className={styles.sheetBody} data-vj-event-card-sheet={view}>
        <VjSheetAlert
          errorKey={shownAlert?.key ?? null}
          values={shownAlert?.values}
        />
        <AnimatePresence initial={false} mode="wait">
          <m.div
            key={view}
            className={styles.view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : VIEW_FADE_SECONDS }}
          >
            {view === "noPack" ? (
              <p className={styles.hint}>{t("vj:eventCard.noPack")}</p>
            ) : null}
            {view === "loading" ? <SkeletonCard /> : null}
            {view === "missing" ? (
              <VjEventCardMissing messageKey={missingKey} />
            ) : null}
            {view === "card" && card !== null ? (
              <>
                <VjEventCardPreview card={card} />
                <VjEventCardControls
                  eventCard={eventCard}
                  pendingKey={commands.pendingKey}
                  isBlocked={isBlocked}
                  onShow={commands.show}
                  onHide={commands.hide}
                />
              </>
            ) : null}
          </m.div>
        </AnimatePresence>
        <Collapse isOpen={view !== "card" && eventCard.isVisible}>
          <Button
            variant="stage-ghost"
            className={styles.wideButton}
            aria-disabled={
              isBlocked || commands.pendingKey !== null || undefined
            }
            onClick={() => {
              if (!isBlocked && commands.pendingKey === null) commands.hide();
            }}
          >
            <FiEyeOff aria-hidden fill="none" />
            {t("vj:eventCard.hide")}
          </Button>
        </Collapse>
      </div>
    </VjSheetFrame>
  );
}
