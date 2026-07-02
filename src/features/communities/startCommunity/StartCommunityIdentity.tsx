import { CATEGORY_OPTIONS, initialsOf } from "./startCommunity.data";
import { useAllCommunities } from "../useAllCommunities";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

/** Chapter 1 — Why: name, purpose, category, plus a similar-spaces nudge. */
export function StepWhy({ form }: { form: CommunityForm }) {
  const { draft, set } = form;
  const all = useAllCommunities();
  const q = draft.name.trim().toLowerCase();
  const similar =
    q.length >= 3
      ? all
          .filter((c) => {
            const n = c.name.toLowerCase();
            return n.includes(q) || q.includes(n.split(" ")[0] ?? n);
          })
          .slice(0, 3)
      : [];

  return (
    <div>
      <div className={styles.field}>
        <label htmlFor="sc-name">
          Name your community <span className={styles.req}>*</span>
        </label>
        <input
          id="sc-name"
          type="text"
          className={`${styles.input} ${styles.big}`}
          placeholder="e.g. Sunday Sapphic Swimmers"
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
        {similar.length > 0 && (
          <div className={styles.collision}>
            <div className={styles.colHead}>
              A few spaces already sound a little like this —
            </div>
            {similar.map((c) => (
              <div key={c.slug ?? c.name} className={styles.colMatch}>
                <span className={`${styles.trAv} ${styles.tintFacePlum}`}>
                  {initialsOf(c.name)}
                </span>
                <span className={styles.cmInfo}>
                  <b>{c.name}</b>
                  <span>{c.typeLabel}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="sc-purpose">
          What is it for? <span className={styles.req}>*</span>
        </label>
        <textarea
          id="sc-purpose"
          className={styles.textarea}
          placeholder="Say it plainly — what happens here, and why it matters."
          value={draft.purpose}
          onChange={(e) => set({ purpose: e.target.value })}
        />
        <span className={styles.hint}>
          This is the first thing people read. One or two warm sentences is
          plenty.
        </span>
      </div>

      <div className={styles.field}>
        <label>
          What kind of space is it? <span className={styles.req}>*</span>
        </label>
        <div className={styles.chipRow}>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.type}
              type="button"
              className={[
                styles.chip,
                draft.type === c.type && styles.chipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={draft.type === c.type}
              onClick={() => set({ type: c.type })}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Chapter 2 — Who: the people this space is meant to hold. */
export function StepWho({ form }: { form: CommunityForm }) {
  const { draft, set } = form;
  return (
    <div>
      <div className={styles.field}>
        <label htmlFor="sc-whofor">
          Who is this space for? <span className={styles.req}>*</span>
        </label>
        <textarea
          id="sc-whofor"
          className={styles.textarea}
          placeholder="e.g. Trans and non-binary folks who want to swim together, all abilities, no pressure to be fast."
          value={draft.whoFor}
          onChange={(e) => set({ whoFor: e.target.value })}
        />
        <span className={styles.hint}>
          Be specific and be welcoming. Naming who it's <em>for</em> helps the
          right people know they belong here.
        </span>
      </div>
    </div>
  );
}
