import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SEATS, type Seat } from "./table.data";
import { TableSeat, type RenderedSeat } from "./TableSeat";
import s from "./table.module.css";

const CENTER = 50;

interface MeetTheTableProps {
  /** Engraved on the table surface — the gathering's title and neighbourhood. */
  title: string;
  neighbourhood: string;
}

/** Read-only view of who's sitting where at a supper club. Attendees open an
 *  info card on hover/tap; open settings are shown but not interactive. */
export function MeetTheTable({ title, neighbourhood }: MeetTheTableProps) {
  const { t } = useTranslation();
  const hoverEnabled = useMediaQuery("(hover: hover)");
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const openCard = useCallback((index: number) => setActiveCard(index), []);
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
        avatar: seat.init ?? "",
        name: seat.name ?? "",
        pron: `Host · ${seat.pron}`,
      };
    }
    if (seat.role === "guest") {
      return {
        ...base,
        variant: "guest",
        tint: seat.tint,
        avatar: seat.init ?? "",
        name: seat.name ?? "",
        pron: seat.pron,
        joined: seat.joinedAgo,
      };
    }
    // open setting — an empty place, shown but not choosable here
    return {
      ...base,
      variant: "open",
      avatar: "+",
      name: t("gatherings:table.emptySeatLabel"),
    };
  });

  const isTaken = (seat: Seat) =>
    seat.role === "guest" || seat.role === "host";
  const confirmed = SEATS.filter(isTaken).length;
  const open = SEATS.length - confirmed;

  return (
    <div className={s["co-tablecard"]}>
      <div className={s["co-tc-head"]}>
        <div>
          <div className={s["co-tc-title"]}>{t("gatherings:table.title")}</div>
          <div className={s["co-tc-sub"]}>
            <b>{t("gatherings:table.atTableCount", { count: confirmed })}</b> ·{" "}
            <b>{t("gatherings:table.openCount", { count: open })}</b>
          </div>
        </div>
      </div>

      <div className={s["co-table-wrap"]} ref={wrapRef}>
        <div className={s["tbl-surface"]}>
          <span className={s["tbl-candle"]} />
          <span className={s["tbl-engrave"]}>
            <b>{title}</b>
            {neighbourhood}
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
            onOpenCard={() => openCard(r.index)}
            onCloseCard={closeCard}
          />
        ))}
      </div>

      <p className={s["tbl-legend"]}>{t("gatherings:table.legend")}</p>
    </div>
  );
}
