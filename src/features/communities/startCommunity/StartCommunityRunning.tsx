import { useState } from "react";
import {
  FiX,
  FiCalendar,
  FiGrid,
  FiUsers,
  FiFolder,
  FiMessageCircle,
  FiPlus,
} from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import {
  FEATURE_OPTIONS,
  initialsOf,
  type TintKey,
} from "./startCommunity.data";
import type { CommunityForm } from "./useCommunityForm";
import styles from "./StartCommunityPage.module.css";

const FACE: Record<TintKey, string> = {
  coral: styles.tintFaceCoral!,
  jade: styles.tintFaceJade!,
  plum: styles.tintFacePlum!,
};
const FEATURE_ICON: Record<string, typeof FiCalendar> = {
  discussion: FiMessageCircle,
  events: FiCalendar,
  rooms: FiGrid,
  roster: FiUsers,
  library: FiFolder,
};
const TINTS: TintKey[] = ["coral", "jade", "plum"];

/** Chapter 4 — Running: co-stewards and what the community can do. */
export function StepRunning({ form }: { form: CommunityForm }) {
  const { draft, addSteward, removeSteward, toggleFeature } = form;
  const [name, setName] = useState("");

  const add = () => {
    const n = name.trim();
    if (!n) return;
    addSteward({
      key: `co-${Date.now()}-${draft.stewards.length}`,
      name: n,
      initials: initialsOf(n),
      tint: TINTS[draft.stewards.length % TINTS.length]!,
      role: "mod",
    });
    setName("");
  };

  return (
    <div>
      <div className={styles.groupH}>Stewards</div>
      <p className={styles.groupSub}>
        Co-stewards can welcome new members, keep threads warm, and step in when
        you can't. You can add or change them any time.
      </p>

      {draft.stewards.map((s) => (
        <div key={s.key} className={styles.teamRow}>
          <span className={`${styles.trAv} ${FACE[s.tint]}`}>{s.initials}</span>
          <span className={styles.trName}>{s.name}</span>
          <span
            className={[
              styles.trRole,
              s.role === "owner" ? styles.roleOwner : styles.roleMod,
            ].join(" ")}
          >
            {s.role === "owner" ? "You · owner" : "Co-steward"}
          </span>
          {s.role !== "owner" && (
            <button
              type="button"
              className={styles.trDel}
              onClick={() => removeSteward(s.key)}
              aria-label={`Remove ${s.name}`}
            >
              <FiX size={17} aria-hidden />
            </button>
          )}
        </div>
      ))}

      <div className={styles.addRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="Add a co-steward by name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button variant="ghost" onClick={add} disabled={!name.trim()}>
          <FiPlus size={15} aria-hidden /> Add
        </Button>
      </div>

      <div className={styles.groupH}>What's inside</div>
      <p className={styles.groupSub}>
        Turn on what fits. You can always add more once you're up and running.
      </p>
      <div className={styles.featGrid}>
        {FEATURE_OPTIONS.map((f) => {
          const Icon = FEATURE_ICON[f.id] ?? FiGrid;
          const on = draft.features.includes(f.id);
          return (
            <button
              key={f.id}
              type="button"
              className={[
                styles.feat,
                on && styles.featOn,
                f.locked && styles.featLocked,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={on}
              disabled={f.locked}
              onClick={() => toggleFeature(f.id, f.locked)}
            >
              <span className={styles.ftIc}>
                <Icon size={16} aria-hidden />
              </span>
              <span className={styles.ftTxt}>
                <b>{f.label}</b>
                <span>{f.desc}</span>
              </span>
              <span className={styles.ftState}>
                {f.locked ? "Always on" : on ? "On" : "Off"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
