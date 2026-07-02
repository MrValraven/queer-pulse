import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import s from "./sheet.module.css";
import { SPLIT, PAY_METHODS } from "./studioSheetStore.data";

export function StudioSheetCheckout() {
  const { showToast } = useToast();
  const [pm, setPm] = useState(0);
  const [bought, setBought] = useState(false);

  return (
    <div className={s.checkout}>
      <h2>
        Your <em>download</em>
      </h2>
      <div className={s.chSub}>
        One sheet · clean PDF · yours to keep &amp; print
      </div>
      <div className={s.line}>
        <span className="k">
          Lead sheet — Carta para a santa
          <small>voice + piano · 4 pages</small>
        </span>
        <span className={s.v}>€1.00</span>
      </div>
      <div className={s.line}>
        <span className="k">
          Processing
          <small>co-op SEPA rate</small>
        </span>
        <span className={s.v}>€0.04</span>
      </div>
      <div className={`${s.line} ${s.lineTotal}`}>
        <span className="k">Total</span>
        <span className={s.v}>
          €<em>1.04</em>
        </span>
      </div>

      <div className={s.splitViz}>
        <div className={s.sl}>Where your €1 goes · 90 / 10</div>
        <div className={s.splitBar}>
          <div className={s.a} style={{ width: "55%" }} />
          <div className={s.b} style={{ width: "35%" }} />
          <div className={s.c} style={{ width: "10%" }} />
        </div>
        {SPLIT.map((r, i) => (
          <div key={i} className={s.splitR}>
            <span className={s.sw} style={{ background: r.c }} />
            <span className={s.sn}>{r.nm}</span>
            <span className={s.sv}>
              <b>{r.v}</b>
            </span>
          </div>
        ))}
        <div className={s.splitFoot}>
          Sheets pay <em>90%</em> to the makers — more generous than the 80%
          streaming split, because the work is one-off and hosting a PDF costs
          near zero. <em>Voted in at the 9 June assembly.</em>
        </div>
      </div>

      <div className={s.payMethod}>
        {PAY_METHODS.map((m, i) => (
          <div
            key={i}
            className={[s.pm, pm === i && s.pmOn].filter(Boolean).join(" ")}
            role="button"
            tabIndex={0}
            onClick={() => setPm(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setPm(i);
              }
            }}
          >
            <span className={s.pmDot} />
            <span className={s.pn}>
              {m.nm}
              <small>{m.sub}</small>
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={s.chBtn}
        disabled={bought}
        onClick={() => {
          setBought(true);
          showToast(
            "Downloaded — €0.90 paid to Teresa & Mariana tonight",
            "success",
          );
        }}
      >
        {bought ? (
          <>
            Paid <FiCheck /> · downloading PDF…
          </>
        ) : (
          "Pay €1.04 & download →"
        )}
      </button>
      <div className={s.chNote}>
        Instant download · re-download any time from your library ·{" "}
        <em>the makers are paid tonight</em>.
      </div>
    </div>
  );
}
