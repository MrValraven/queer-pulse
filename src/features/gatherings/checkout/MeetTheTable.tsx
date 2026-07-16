import { useCallback, useEffect, useRef, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { TFunction } from "../../../shared/i18n/types";
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
// Mock content (mirrors EVENT.title/neighbourhood in shortened form) — not chrome.
const TABLE_ENGRAVE_TITLE = "Supper #13";
const TABLE_ENGRAVE_NEIGHBOURHOOD = "Mouraria";

/** Display name for a seat as currently occupied, or null if it's an empty open setting. */
function occupantName(
  t: TFunction,
  seat: Seat,
  index: number,
  seatPick: number[],
  guests: { name: string }[],
): string | null {
  if (seat.role === "guest" || seat.role === "host") return seat.name ?? null;
  const pos = seatPick.indexOf(index);
  if (pos < 0) return null;
  if (pos === 0) return t("gatherings:checkout.table.youLabel");
  const first = guests[pos - 1]?.name?.trim().split(" ")[0];
  return (
    first ||
    t("gatherings:checkout.table.guestNumberFallback", { number: pos + 1 })
  );
}

/** Walk the ring from `fromIdx` in `dir` to the first occupied seat (skipping yourself). */
function neighbour(
  t: TFunction,
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
    const nm = occupantName(t, seat, i, seatPick, guests);
    if (nm) return nm;
  }
  return null;
}

export function MeetTheTable() {
  const { qty, visibility, guests, seatPick, setVisibility, pickSeat } =
    useCheckout();
  const { t } = useTranslation();
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
    if (pos < 0)
      return {
        ...base,
        variant: "open",
        av: "+",
        name: t("gatherings:checkout.table.emptySeatLabel"),
      };
    if (pos === 0) {
      return {
        ...base,
        variant: "you",
        av: priv ? "" : t("gatherings:checkout.table.youLabel"),
        name: priv
          ? t("gatherings:checkout.table.youPrivateLabel")
          : t("gatherings:checkout.table.youLabel"),
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
        name: priv
          ? t("gatherings:checkout.table.privateLabel")
          : t("gatherings:checkout.table.giftLabel"),
      };
    }
    const first = g?.name?.trim().split(" ")[0];
    return {
      ...base,
      variant: "you",
      av: g?.name ? g.name.trim().charAt(0).toUpperCase() : String(pos + 1),
      name: priv
        ? t("gatherings:checkout.table.privateLabel")
        : first ||
          t("gatherings:checkout.table.guestNumberFallback", {
            number: pos + 1,
          }),
      pron: g?.pron || undefined,
    };
  });

  const remaining = Math.max(0, OPEN_SEAT_INDICES.length - qty);
  const confirmed = SEATS.filter(
    (x) => x.role === "guest" || x.role === "host",
  ).length;
  const youTxt = t("gatherings:checkout.table.youCount", {
    count: qty,
    extra: qty - 1,
  });

  const yourSeat = seatPick[0];
  const left =
    yourSeat != null ? neighbour(t, yourSeat, -1, seatPick, guests) : null;
  const right =
    yourSeat != null ? neighbour(t, yourSeat, 1, seatPick, guests) : null;
  const legend =
    left && right
      ? t("gatherings:checkout.table.legendBetween", { left, right })
      : t("gatherings:checkout.table.legendDefault");

  return (
    <div className={s["co-tablecard"]}>
      <div className={s["co-tc-head"]}>
        <div>
          <div className={s["co-tc-title"]}>
            {t("gatherings:checkout.table.title")}
          </div>
          <div className={s["co-tc-sub"]}>
            <b>
              {t("gatherings:checkout.table.atTableCount", {
                count: confirmed,
              })}
            </b>{" "}
            · <b>{youTxt}</b> ·{" "}
            <b>
              {t("gatherings:checkout.table.openCount", { count: remaining })}
            </b>
          </div>
        </div>
        <div
          className={s["co-seg"]}
          role="group"
          aria-label={t("gatherings:checkout.table.visibilityGroupAria")}
        >
          <button
            className={cx(s["co-seg-btn"], !priv && s.on)}
            type="button"
            onClick={() => setVisibility("show")}
            aria-pressed={!priv}
          >
            <FiEye /> {t("gatherings:checkout.table.onListLabel")}
          </button>
          <button
            className={cx(s["co-seg-btn"], priv && s.on)}
            type="button"
            onClick={() => setVisibility("private")}
            aria-pressed={priv}
          >
            <FiEyeOff /> {t("gatherings:checkout.table.attendPrivatelyLabel")}
          </button>
        </div>
      </div>

      <div className={s["co-table-wrap"]} ref={wrapRef}>
        <div className={s["tbl-surface"]}>
          <span className={s["tbl-candle"]} />
          <span className={s["tbl-engrave"]}>
            <b>{TABLE_ENGRAVE_TITLE}</b>
            {TABLE_ENGRAVE_NEIGHBOURHOOD}
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
