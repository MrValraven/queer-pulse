import type { JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import type {
  VjEventCard,
  VjEventCardDTO,
} from "../../../../shared/contracts/vj";
import { QrCode } from "../../../../shared/components/ui/QrCode";
import { intlLocale } from "../../../../shared/i18n/locale";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { cx } from "../../../../shared/lib/cx";
import { vjEventCardLinesOf } from "./vjEventCardLines";
import styles from "./VjOverlay.module.css";

// A scanner needs dark-on-light polarity. Both channel tokens stay fixed in
// either theme, as on the quizshow lobby screen.
const QR_LIGHT_FILL = "rgb(var(--cream-rgb))";
const QR_DARK_FILL = "rgb(var(--plum-rgb))";
/** The SVG's own size; CSS sets the drawn size from the layer's height. */
const QR_LARGE_SIZE = 480;
const QR_SMALL_SIZE = 200;

function VjEventCardQr({
  url,
  title,
  isLarge,
}: {
  url: string;
  title: string;
  isLarge: boolean;
}): JSX.Element {
  const { t } = useTranslation();
  return (
    <QrCode
      className={isLarge ? styles.qrLarge : styles.qrSmall}
      url={url}
      ariaLabel={t("vj:screen.eventCard.qrLabel", { title })}
      size={isLarge ? QR_LARGE_SIZE : QR_SMALL_SIZE}
      lightFill={QR_LIGHT_FILL}
      darkFill={QR_DARK_FILL}
      hasLightPlate
    />
  );
}

function VjEventCardBody({
  kind,
  card,
}: {
  kind: VjEventCard["kind"];
  card: VjEventCardDTO;
}): JSX.Element {
  const { t, language } = useTranslation();
  const lines = vjEventCardLinesOf(card, intlLocale(language));
  if (kind === "qr") {
    return (
      <>
        {card.publicUrl === null ? null : (
          <VjEventCardQr url={card.publicUrl} title={lines.title} isLarge />
        )}
        <p className={cx(styles.cardTitle, styles.cardTitleQr)}>
          {lines.title}
        </p>
        <p className={styles.cardLine}>{t("vj:screen.eventCard.scan")}</p>
      </>
    );
  }
  const placeLine = lines.isOnline
    ? t("vj:screen.eventCard.online")
    : lines.placeLine;
  return (
    <>
      <div className={styles.cardText}>
        <p className={styles.cardEyebrow}>
          {t("vj:screen.eventCard.nextEvent")}
        </p>
        <p className={styles.cardTitle}>{lines.title}</p>
        {lines.dateLine === "" ? null : (
          <p className={styles.cardLine}>{lines.dateLine}</p>
        )}
        {placeLine === null ? null : (
          <p className={styles.cardLine}>{placeLine}</p>
        )}
      </div>
      {card.publicUrl === null ? null : (
        <VjEventCardQr
          url={card.publicUrl}
          title={lines.title}
          isLarge={false}
        />
      )}
    </>
  );
}

export interface VjEventCardPanelProps {
  eventCard: VjEventCard;
  eventCardData: VjEventCardDTO | null;
  /** The side the card keeps clear of a logo in a bottom corner. */
  side: "left" | "right";
  fadeSeconds: number;
}

/**
 * The event card: a large QR for the event page, or the next event's lines
 * with a small QR. No card data draws nothing; no public URL drops the QR.
 */
export function VjEventCardPanel({
  eventCard,
  eventCardData,
  side,
  fadeSeconds,
}: VjEventCardPanelProps): JSX.Element {
  const isShown = eventCard.isVisible && eventCardData !== null;
  return (
    <AnimatePresence initial={false}>
      {isShown ? (
        <m.div
          key={`card:${eventCard.kind}:${eventCardData.eventId}:${side}`}
          className={cx(
            styles.eventCard,
            eventCard.kind === "qr" ? styles.eventCardQr : styles.eventCardNext,
            side === "left" ? styles.eventCardLeft : styles.eventCardRight,
          )}
          data-vj-event-card={eventCard.kind}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeSeconds, ease: "linear" }}
        >
          <VjEventCardBody kind={eventCard.kind} card={eventCardData} />
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
