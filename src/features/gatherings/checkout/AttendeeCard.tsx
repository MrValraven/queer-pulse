import { useEffect } from "react";
import type { Seat } from "./checkout.data";
import { cx } from "./cx";
import s from "./checkout.module.css";

interface Props {
  id: string;
  seat: Seat;
  placement: "above" | "below";
  align: "start" | "center" | "end";
  onClose: () => void;
}

export function AttendeeCard({ id, seat, placement, align, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      id={id}
      className={cx(s["tbl-card"], s[placement], s[align])}
      role="tooltip"
      aria-label={`About ${seat.name}`}
    >
      <div className={s["tbl-card-name"]}>{seat.name}</div>
      {seat.pron && <div className={s["tbl-card-pron"]}>{seat.pron}</div>}
      {seat.intro && <p className={s["tbl-card-intro"]}>{seat.intro}</p>}
      {seat.interests && seat.interests.length > 0 && (
        <div className={s["tbl-card-tags"]}>
          {seat.interests.map((t) => (
            <span key={t} className={s["tbl-card-tag"]}>
              {t}
            </span>
          ))}
        </div>
      )}
      {seat.connection && (
        <div className={s["tbl-card-conn"]}>{seat.connection}</div>
      )}
    </div>
  );
}
