import { cx } from "./cx";
import { fmtClock } from "./useSeatHold";
import s from "./checkout.module.css";

interface Props {
  left: number;
  expired: boolean;
  reHold: () => void;
}

export function SeatHold({ left, expired, reHold }: Props) {
  return (
    <div className={cx(s["co-hold"], expired && s.expired)}>
      <div className={s["co-hold-timer"]}>
        <span className={s["co-hold-dot"]} aria-hidden />
        <span aria-live="polite">
          {expired ? (
            <>
              Your seat hold expired —{" "}
              <button className={s["co-rehold"]} type="button" onClick={reHold}>
                hold it again
              </button>
            </>
          ) : (
            <>
              Seat held for you · <strong>{fmtClock(left)}</strong>
            </>
          )}
        </span>
      </div>
      <div className={s["co-hold-spots"]}>
        Only <strong>2</strong> seats left
      </div>
    </div>
  );
}
