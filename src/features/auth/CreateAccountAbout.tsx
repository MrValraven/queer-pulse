import { FormField } from "../../shared/components/ui";
import { PRONOUNS, VIS_OPTS, type Visibility } from "./createAccount.data";
import styles from "./auth.module.css";

interface AboutProps {
  pronouns: string;
  setPronouns: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  visibility: Visibility;
  setVisibility: (v: Visibility) => void;
}

export function AboutAndVisibility({
  pronouns,
  setPronouns,
  bio,
  setBio,
  visibility,
  setVisibility,
}: AboutProps) {
  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionLabel}>About you</div>
        <FormField
          label="Display name"
          helper="What members see. Can differ from your legal name."
        >
          <input type="text" placeholder="Tiago C." />
        </FormField>
        <div className={styles.field}>
          <label>Pronouns</label>
          <input
            type="text"
            placeholder="e.g. she/her"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
          />
          <div className={styles.pronounChips}>
            {PRONOUNS.map((p) => (
              <button
                key={p}
                type="button"
                className={styles.pChip}
                onClick={() => setPronouns(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <FormField label="Location">
          <input type="text" placeholder="Lisbon, Portugal" />
        </FormField>
        <FormField label="Short bio" labelAside={`${bio.length}/280`}>
          <textarea
            maxLength={280}
            placeholder="A sentence or two about you…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </FormField>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Visibility</div>
        <div className={styles.visOpts}>
          {VIS_OPTS.map((opt) => (
            <label
              key={opt.value}
              className={[
                styles.visOpt,
                visibility === opt.value && styles.visOptSelected,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name="vis"
                checked={visibility === opt.value}
                onChange={() => setVisibility(opt.value)}
              />
              <div className={styles.visOptText}>
                <span>{opt.label}</span>
                <small>{opt.sub}</small>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
