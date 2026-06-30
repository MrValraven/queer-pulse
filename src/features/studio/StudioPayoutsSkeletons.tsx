import s from "./creator.module.css";

/** Mirrors a .payRow so the recent-payouts list swaps in with no layout shift. */
export function PayoutRowSkeleton() {
  return (
    <div className={s.payRow}>
      <div className={s.payDate}>
        <div
          className={s.skel}
          style={{ width: 36, height: 26, margin: "0 auto" }}
        />
        <div
          className={s.skel}
          style={{ width: 26, height: 9, margin: "7px auto 0" }}
        />
      </div>
      <div>
        <div className={s.skel} style={{ width: "55%", height: 14 }} />
        <div
          className={s.skel}
          style={{ width: "38%", height: 11, marginTop: 7 }}
        />
      </div>
      <div className={s.skel} style={{ width: 64, height: 18 }} />
      <div
        className={s.skel}
        style={{ width: 52, height: 20, borderRadius: 999 }}
      />
    </div>
  );
}

/** Mirrors a .bdRow so the track-by-track breakdown swaps in with no layout shift. */
export function BreakdownRowSkeleton() {
  return (
    <div className={s.bdRow}>
      <div className={s.skel} style={{ width: 24, height: 12 }} />
      <div className={s.skel} style={{ width: "60%", height: 13 }} />
      <div className={s.skel} style={{ width: 52, height: 12 }} />
      <div className={s.skel} style={{ width: 40, height: 12 }} />
      <div className={s.skel} style={{ width: 48, height: 14 }} />
    </div>
  );
}
