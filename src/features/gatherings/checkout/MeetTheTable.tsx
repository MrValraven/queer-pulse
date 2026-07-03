import { useCallback, useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import {
  OPEN_SEAT_INDICES,
  RING_ORDER,
  SEATS,
  type Seat,
} from "./checkout.data";
import { useCheckout } from "./checkoutContext";
import { TableSeat, type RenderedSeat } from "./TableSeat";
import { cx } from "./cx";
import s from "./checkout.module.css";

const CENTER = 50;

/** Display name for a seat as currently occupied, or null if it's an empty open setting. */
function occupantName(
  seat: Seat,
  index: number,
  seatPick: number[],
  guests: { name: string }[],
): string | null {
  if (seat.role === "guest" || seat.role === "host") return seat.name ?? null;
  const pos = seatPick.indexOf(index);
  if (pos < 0) return null;
  if (pos === 0) return "You";
  const first = guests[pos - 1]?.name?.trim().split(" ")[0];
  return first || `Guest ${pos + 1}`;
}

/** Walk the ring from `fromIdx` in `dir` to the first occupied seat (skipping yourself). */
function neighbour(
  fromIdx: number,
  dir: 1 | -1,
  seatPick: number[],
  guests: { name: string }[],
): string | null {
  const ringPos = RING_ORDER.indexOf(fromIdx);
  for (let step = 1; step < RING_ORDER.length; step++) {
    const i =
      RING_ORDER[
        (ringPos + dir * step + RING_ORDER.length) % RING_ORDER.length
      ];
    if (i === undefined || i === seatPick[0]) continue;
    const seat = SEATS[i];
    if (!seat) continue;
    const nm = occupantName(seat, i, seatPick, guests);
    if (nm) return nm;
  }
  return null;
}

export function MeetTheTable() {
  const { qty, visibility, guests, seatPick, setVisibility, pickSeat } =
    useCheckout();
  const priv = visibility === "private";
  const hoverEnabled = useMediaQuery("(hover: hover)");
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const openCard = useCallback((i: number) => setActiveCard(i), []);
  const closeCard = useCallback(() => setActiveCard(null), []);

  useEffect(() => {
    if (activeCard === null) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setActiveCard(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [activeCard]);

  const rendered: RenderedSeat[] = SEATS.map((seat, index): RenderedSeat => {
    const angle =
      (Math.atan2(seat.y - CENTER, seat.x - CENTER) * 180) / Math.PI - 90;
    const base = {
      seat,
      index,
      x: seat.x,
      y: seat.y,
      angle,
      delayMs: index * 60,
    };

    if (seat.role === "host") {
      return {
        ...base,
        variant: "host",
        av: seat.init ?? "",
        name: seat.name ?? "",
        pron: `Host · ${seat.pron}`,
      };
    }
    if (seat.role === "guest") {
      return {
        ...base,
        variant: "guest",
        tint: seat.tint,
        av: seat.init ?? "",
        name: seat.name ?? "",
        pron: seat.pron,
        joined: seat.joinedAgo,
      };
    }
    // open setting — occupied by the party?
    const pos = seatPick.indexOf(index);
    if (pos < 0) return { ...base, variant: "open", av: "+", name: "Empty" };
    if (pos === 0) {
      return {
        ...base,
        variant: "you",
        av: priv ? "" : "You",
        name: priv ? "You (private)" : "You",
        priv,
      };
    }
    const g = guests[pos - 1];
    if (g?.gift) {
      return {
        ...base,
        variant: "you",
        av: "",
        gift: true,
        name: priv ? "Private" : "Gift",
      };
    }
    const first = g?.name?.trim().split(" ")[0];
    return {
      ...base,
      variant: "you",
      av: g?.name ? g.name.trim().charAt(0).toUpperCase() : String(pos + 1),
      name: priv ? "Private" : first || `Guest ${pos + 1}`,
      pron: g?.pron || undefined,
    };
  });

  const remaining = Math.max(0, OPEN_SEAT_INDICES.length - qty);
  const confirmed = SEATS.filter(
    (x) => x.role === "guest" || x.role === "host",
  ).length;
  const youTxt = qty === 1 ? "you" : `you +${qty - 1}`;

  const yourSeat = seatPick[0];
  const left =
    yourSeat != null ? neighbour(yourSeat, -1, seatPick, guests) : null;
  const right =
    yourSeat != null ? neighbour(yourSeat, 1, seatPick, guests) : null;
  const legend =
    left && right
      ? `You're sitting between ${left} and ${right} — tap another empty place to move.`
      : "Tap an empty place to choose your seat.";

  return (
    <div className={s["co-tablecard"]}>
      <div className={s["co-tc-head"]}>
        <div>
          <div className={s["co-tc-title"]}>Meet the table</div>
          <div className={s["co-tc-sub"]}>
            <b>{confirmed} at the table</b> · <b>{youTxt}</b> ·{" "}
            <b>{remaining}</b> open
          </div>
        </div>
        <div className={s["co-seg"]} role="group" aria-label="Your visibility">
          <button
            className={cx(s["co-seg-btn"], !priv && s.on)}
            type="button"
            onClick={() => setVisibility("show")}
            aria-pressed={!priv}
          >
            <FiEye /> On the list
          </button>
          <button
            className={cx(s["co-seg-btn"], priv && s.on)}
            type="button"
            onClick={() => setVisibility("private")}
            aria-pressed={priv}
          >
            <FiEyeOff /> Attend privately
          </button>
        </div>
      </div>

      <div className={s["co-table-wrap"]} ref={wrapRef}>
        <div className={s["tbl-surface"]}>
          <span className={s["tbl-candle"]} />
          <span className={s["tbl-engrave"]}>
            <b>Supper #13</b>
            Mouraria
          </span>
        </div>
        {rendered.map((r) => (
          <TableSeat
            key={r.index}
            r={r}
            cardOpen={activeCard === r.index}
            placement={r.y < CENTER ? "below" : "above"}
            align={r.x < 25 ? "start" : r.x > 75 ? "end" : "center"}
            hoverEnabled={hoverEnabled}
            onPick={() => {
              setActiveCard(null);
              pickSeat(r.index);
            }}
            onOpenCard={() => openCard(r.index)}
            onCloseCard={closeCard}
          />
        ))}
      </div>

      <p className={s["tbl-legend"]}>{legend}</p>
    </div>
  );
}
