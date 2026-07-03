import { FiZap } from "react-icons/fi";
import { BENEFITS, CURRENCIES, RATE_PER } from "./postJob.data";
import { CheckGrid, SwitchRow } from "./PostJobControls";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobStepPay({ form }: { form: PostJobForm }) {
  const { state, patch, toggleIn } = form;

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>Step 3 of 5</div>
        <h1 className={styles.stepTitle}>
          Pay <em>&amp; perks</em>
        </h1>
        <p className={styles.stepSub}>
          Transparency is a community value here — and it works.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Rate</div>
        <div
          className={[styles.rateRow, state.hidePay && styles.rateHidden]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.label}>Currency</div>
            <select
              className={styles.select}
              value={state.currency}
              onChange={(e) => patch({ currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.label}>Min</div>
            <input
              className={styles.input}
              type="number"
              value={state.rateMin}
              onChange={(e) => patch({ rateMin: e.target.value })}
              placeholder="0"
            />
          </div>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.label}>
              Max <span className={styles.opt}>opt.</span>
            </div>
            <input
              className={styles.input}
              type="number"
              value={state.rateMax}
              onChange={(e) => patch({ rateMax: e.target.value })}
              placeholder="—"
            />
          </div>
          <div className={styles.field} style={{ marginBottom: 0 }}>
            <div className={styles.label}>Per</div>
            <select
              className={styles.select}
              value={state.ratePer}
              onChange={(e) => patch({ ratePer: e.target.value })}
            >
              {RATE_PER.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <SwitchRow
            on={state.hidePay}
            onToggle={() => patch({ hidePay: !state.hidePay })}
            name="Hide exact figures"
            desc={
              'Show "Competitive" instead of a number. Still worth sharing a range in the description.'
            }
          />
          <SwitchRow
            on={state.barter}
            onToggle={() => patch({ barter: !state.barter })}
            name="Open to skills exchange or barter"
            desc="Trade skills instead of (or alongside) money — a first-class option on QueerPulse."
          />
        </div>

        <div className={styles.nudge}>
          <span className={styles.nudgeIc} aria-hidden>
            <FiZap size={15} />
          </span>
          <span>
            <strong>Listings with a rate get ~2× more responses.</strong>{" "}
            Members appreciate not having to ask.
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Benefits &amp; perks <span className={styles.muted}>· optional</span>
        </div>
        <div className={styles.cardSub}>
          Pick anything that applies. These show as tags on your listing.
        </div>
        <CheckGrid
          options={BENEFITS}
          selected={state.benefits}
          onToggle={(v) => toggleIn("benefits", v)}
        />
      </div>
    </>
  );
}
