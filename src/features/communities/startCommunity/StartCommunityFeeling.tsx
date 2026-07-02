import { TINT_OPTIONS, type TintKey } from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

const ORB: Record<TintKey, string> = {
  coral: styles.orbCoral!,
  jade: styles.orbJade!,
  plum: styles.orbPlum!,
};

/** Chapter 6 — Feeling: a colour and a line that capture the heart. */
export function StepFeeling({ form }: { form: CommunityForm }) {
  const { draft, set, setTint } = form;
  return (
    <div>
      <div className={styles.field}>
        <label>Pick a colour</label>
        <div className={styles.tintRow}>
          {TINT_OPTIONS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={[
                styles.tintSwatch,
                draft.tint === t.key && styles.tintSelected,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={draft.tint === t.key}
              onClick={() => setTint(t.key)}
            >
              <span className={`${styles.tsOrb} ${ORB[t.key]}`} />
              <span className={styles.tsLabel}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="sc-tagline">
          A tagline <span className={styles.req}>*</span>
        </label>
        <input
          id="sc-tagline"
          type="text"
          className={styles.input}
          placeholder="One line that captures the feeling of the place"
          value={draft.tagline}
          maxLength={90}
          onChange={(e) => set({ tagline: e.target.value })}
        />
        <span className={styles.hint}>
          Short and warm — this sits under your community's name.
        </span>
      </div>
    </div>
  );
}
