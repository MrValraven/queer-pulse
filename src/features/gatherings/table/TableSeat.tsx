import type { CSSProperties, FocusEvent } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AttendeeCard } from "./AttendeeCard";
import type { Seat } from "./table.data";
import { cx } from "./cx";
import s from "./table.module.css";

export interface RenderedSeat {
  seat: Seat;
  index: number;
  x: number;
  y: number;
  angle: number;
  variant: "guest" | "host" | "open";
  tint?: "jade" | "coral" | "plum";
  avatar: string;
  name: string;
  pron?: string;
  joined?: string;
  delayMs: number;
}

interface TableSeatProps {
  r: RenderedSeat;
  cardOpen: boolean;
  placement: "above" | "below";
  align: "start" | "center" | "end";
  hoverEnabled: boolean;
  onOpenCard: () => void;
  onCloseCard: () => void;
}

export function TableSeat({
  r,
  cardOpen,
  placement,
  align,
  hoverEnabled,
  onOpenCard,
  onCloseCard,
}: TableSeatProps) {
  const { t } = useTranslation();
  const hasCard = r.variant === "guest" || r.variant === "host";
  const cardId = `attendee-card-${r.index}`;

  const label = hasCard
    ? t("gatherings:table.aboutSeatAria", { name: r.name })
    : t("gatherings:table.emptySeatAria");

  // Close the card when focus leaves the whole seat unit (keyboard tab-away).
  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (cardOpen && !e.currentTarget.contains(e.relatedTarget)) onCloseCard();
  };

  const inner = (
    <>
      <span
        className={s["tbl-decor"]}
        style={{ "--a": `${r.angle}deg` } as CSSProperties}
      >
        <span className={s["tbl-chair"]} />
        {hasCard && <span className={s["tbl-cutlery"]} />}
      </span>
      <span className={s["tbl-plate"]}>
        <span className={s["tbl-av"]}>{r.avatar}</span>
        {r.variant === "host" && <span className={s["tbl-host-badge"]} />}
      </span>
    </>
  );

  return (
    <div
      className={cx(s["tbl-seat"], s[r.variant], r.tint && s[r.tint])}
      style={
        {
          left: `${r.x}%`,
          top: `${r.y}%`,
          "--d": `${r.delayMs}ms`,
        } as CSSProperties
      }
      onBlur={hasCard ? handleBlur : undefined}
      onMouseEnter={hasCard && hoverEnabled ? onOpenCard : undefined}
      onMouseLeave={hasCard && hoverEnabled ? onCloseCard : undefined}
    >
      {hasCard ? (
        <button
          type="button"
          className={s["tbl-setting"]}
          aria-label={label}
          aria-expanded={cardOpen}
          aria-describedby={cardOpen ? cardId : undefined}
          onClick={() => (cardOpen ? onCloseCard() : onOpenCard())}
        >
          {inner}
        </button>
      ) : (
        <span className={s["tbl-setting"]} aria-label={label}>
          {inner}
        </span>
      )}

      <span className={s["tbl-label"]}>
        <span className={s["tbl-name"]}>{r.name}</span>
        {r.pron && <span className={s["tbl-pron"]}>{r.pron}</span>}
        {r.joined && <span className={s["tbl-joined"]}>{r.joined}</span>}
      </span>

      {hasCard && cardOpen && (
        <AttendeeCard
          id={cardId}
          seat={r.seat}
          placement={placement}
          align={align}
          onClose={onCloseCard}
        />
      )}
    </div>
  );
}
