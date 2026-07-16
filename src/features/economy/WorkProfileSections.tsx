import { Tag, TagRow } from "../../shared/components/ui";
import { useProfile } from "../../app/providers/ProfileProvider";
import { fullName } from "../members/data/members";
import {
  OUT_AT_WORK,
  TRANS_SUPPORT,
  VIS_MATRIX,
  WORK_SKILLS,
  FOCUS_AREAS,
} from "./workProfile.data";
import styles from "./WorkProfilePage.module.css";

/** Section 1 — professional identity: how you're named and described. */
export function IdentitySection() {
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfile();
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Professional <em>identity</em>
      </h2>
      <p className={styles.sectionSub}>
        How you're named and described to employers.
      </p>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Name in use</div>
          <input
            className={styles.fieldInput}
            type="text"
            defaultValue={fullName(profile)}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            Legal name{" "}
            <span className={styles.fieldOptional}>kept private</span>
          </div>
          <input
            className={styles.fieldInput}
            type="text"
            placeholder="Only where legally required"
          />
          <div className={styles.fieldHint}>
            Stored privately and used only where the law requires it.
          </div>
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Pronouns</div>
          <input
            className={styles.fieldInput}
            type="text"
            defaultValue={profile.pronouns ?? ""}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Headline</div>
          <input
            className={styles.fieldInput}
            type="text"
            defaultValue={profile.role}
          />
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Location</div>
        <input
          className={styles.fieldInput}
          type="text"
          defaultValue={profile.hood}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Short bio</div>
        <textarea
          className={styles.fieldTextarea}
          placeholder="A few lines on what you do and what you're looking for…"
        />
      </div>
    </section>
  );
}

interface ShowUpProps {
  outChoice: string;
  onOut: (v: string) => void;
  trans: string[];
  onToggleTrans: (id: string) => void;
  safeOnly: boolean;
  onSafeOnly: (v: boolean) => void;
}

/** Section 2 — the queer-specific safety core: out-at-work spectrum + visibility. */
export function ShowUpAtWorkSection({
  outChoice,
  onOut,
  trans,
  onToggleTrans,
  safeOnly,
  onSafeOnly,
}: ShowUpProps) {
  const activeOut = OUT_AT_WORK.find((o) => o.value === outChoice);
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        How you show up <em>at work</em>
      </h2>
      <p className={styles.sectionSub}>
        You decide what employers see. Nothing here is shared without your
        say-so.
      </p>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>Out at work</div>
        <div className={styles.seg} role="radiogroup" aria-label="Out at work">
          {OUT_AT_WORK.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={outChoice === o.value}
              className={[styles.segBtn, outChoice === o.value && styles.segOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onOut(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {activeOut && <p className={styles.segDesc}>{activeOut.desc}</p>}
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          Trans &amp; non-binary support{" "}
          <span className={styles.fieldOptional}>optional</span>
        </div>
        <div className={styles.toggleList}>
          {TRANS_SUPPORT.map((t) => {
            const on = trans.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                role="switch"
                aria-checked={on}
                className={[styles.toggleRow, on && styles.toggleRowOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onToggleTrans(t.id)}
              >
                <span
                  className={[styles.toggle, on && styles.toggleOn]
                    .filter(Boolean)
                    .join(" ")}
                  aria-hidden
                >
                  <span className={styles.toggleKnob} />
                </span>
                <span className={styles.toggleText}>
                  <span className={styles.toggleLabel}>{t.label}</span>
                  <span className={styles.toggleDesc}>{t.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          What employers see vs the community
        </div>
        <div className={styles.matrix}>
          <div className={[styles.matrixRow, styles.matrixHead].join(" ")}>
            <span className={styles.matrixField}>Field</span>
            <span className={styles.matrixCell}>Employers see</span>
            <span className={styles.matrixCell}>Community sees</span>
          </div>
          {VIS_MATRIX.map((r) => (
            <div key={r.field} className={styles.matrixRow}>
              <span className={styles.matrixField}>{r.field}</span>
              <span className={styles.matrixCell}>{r.employers}</span>
              <span className={styles.matrixCell}>{r.community}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={safeOnly}
        className={[styles.toggleRow, safeOnly && styles.toggleRowOn]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onSafeOnly(!safeOnly)}
      >
        <span
          className={[styles.toggle, safeOnly && styles.toggleOn]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          <span className={styles.toggleKnob} />
        </span>
        <span className={styles.toggleText}>
          <span className={styles.toggleLabel}>
            Only surface me to community-verified-safe employers
          </span>
          <span className={styles.toggleDesc}>
            Skip everything that hasn't been vetted by the network.
          </span>
        </span>
      </button>
    </section>
  );
}

/** Section 3 — skills offered/sought and focus areas. */
export function SkillsFocusSection() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        Skills <em>&amp; focus</em>
      </h2>
      <p className={styles.sectionSub}>
        Used to match you in the skills exchange and with mentors.
      </p>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>Skills</div>
        <TagRow>
          {WORK_SKILLS.map((s) => (
            <Tag key={s}>{s}</Tag>
          ))}
        </TagRow>
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>Focus areas</div>
        <TagRow>
          {FOCUS_AREAS.map((f) => (
            <Tag key={f}>{f}</Tag>
          ))}
        </TagRow>
      </div>
    </section>
  );
}
