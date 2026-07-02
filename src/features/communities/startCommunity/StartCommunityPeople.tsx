import { FiCheck } from "react-icons/fi";
import { INVITE_CANDIDATES, type TintKey } from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

const FACE: Record<TintKey, string> = {
  coral: styles.tintFaceCoral!,
  jade: styles.tintFaceJade!,
  plum: styles.tintFacePlum!,
};

/** Chapter 7 — People: invite a few to be there on day one. */
export function StepPeople({ form }: { form: CommunityForm }) {
  const { draft, toggleInvite } = form;
  return (
    <div>
      <div className={styles.field}>
        <label>People you'd love to see here</label>
        <span className={styles.hint}>
          They'll get a warm invite when you open — no pressure, no spam.
        </span>
        <div className={styles.inviteList}>
          {INVITE_CANDIDATES.map((c) => {
            const on = draft.invites.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                className={[styles.inviteChip, on && styles.inviteOn]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={on}
                onClick={() => toggleInvite(c.key)}
              >
                <span className={`${styles.icAv} ${FACE[c.tint]}`}>
                  {c.initials}
                </span>
                <span className={styles.icName}>{c.name}</span>
                {on && (
                  <span className={styles.icCheck}>
                    <FiCheck size={14} aria-hidden />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className={styles.seedNote}>
        You can also share your community's link once it's open — that's often
        how the first ten people really arrive.
      </p>
    </div>
  );
}
