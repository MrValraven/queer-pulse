import { MAX_SEATS } from "./checkout.data";
import { Translation } from "../../../shared/i18n/Translation";
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
            <Translation
              i18nKey="gatherings:checkout.hold.expiredText"
              components={{
                retry: (
                  // eslint-disable-next-line jsx-a11y/control-has-associated-label -- <button> is an element template; <Translation> clones it with the retry link text at render time.
                  <button
                    className={s["co-rehold"]}
                    type="button"
                    onClick={reHold}
                  />
                ),
              }}
            />
          ) : (
            <Translation
              i18nKey="gatherings:checkout.hold.activeText"
              values={{ clock: fmtClock(left) }}
              components={{ time: <strong /> }}
            />
          )}
        </span>
      </div>
      <div className={s["co-hold-spots"]}>
        <Translation
          i18nKey="gatherings:checkout.hold.spotsLeft"
          values={{ count: MAX_SEATS }}
          components={{ strong: <strong /> }}
        />
      </div>
    </div>
  );
}
