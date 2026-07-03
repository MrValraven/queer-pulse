import type { CSSProperties, FocusEvent } from "react";
import { FiHeart } from "react-icons/fi";
import { AttendeeCard } from "./AttendeeCard";
import type { Seat } from "./checkout.data";
import { cx } from "./cx";
import s from "./checkout.module.css";

export interface RenderedSeat {
  seat: Seat;
  index: number;
  x: number;
  y: number;
  angle: number;
  variant: "guest" | "host" | "you" | "open";
  tint?: "jade" | "coral" | "plum";
  av: string;
  gift?: boolean;
  name: string;
  pron?: string;
  joined?: string;
  priv?: boolean;
  delayMs: number;
}

interface TableSeatProps {
  r: RenderedSeat;
  cardOpen: boolean;
  placement: "above" | "below";
  align: "start" | "center" | "end";
  hoverEnabled: boolean;
  onPick: () => void;
  onOpenCard: () => void;
  onCloseCard: () => void;
}

export function TableSeat({
  r,
  cardOpen,
  placement,
  align,
  hoverEnabled,
  onPick,
  onOpenCard,
  onCloseCard,
}: TableSeatProps) {
  const isPickable = r.variant === "open";
  const hasCard = r.variant === "guest" || r.variant === "host";
  const cardId = `attendee-card-${r.index}`;

  const label = isPickable
    ? "Choose this seat"
    : hasCard
      ? `About ${r.name}`
      : "Your seat";

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
        {!isPickable && <span className={s["tbl-cutlery"]} />}
      </span>
      <span className={s["tbl-plate"]}>
        <span className={s["tbl-av"]}>{r.gift ? <FiHeart /> : r.av}</span>
        {r.variant === "host" && <span className={s["tbl-host-badge"]} />}
      </span>
    </>
  );

  return (
    <div
      className={cx(
        s["tbl-seat"],
        s[r.variant],
        r.tint && s[r.tint],
        r.priv && s.private,
      )}
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
      {isPickable ? (
        <button
          type="button"
          className={s["tbl-setting"]}
          aria-label={label}
          onClick={onPick}
        >
          {inner}
        </button>
      ) : hasCard ? (
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
        {isPickable && <span className={s["tbl-sit"]}>Sit here</span>}
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
