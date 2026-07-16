import { useState } from "react";
import { ChipSelect, ComingSoon } from "../../shared/components/ui";
import { useProfile } from "../../app/providers/ProfileProvider";
import { Pane, Section, ToggleList, ToggleRow } from "./SettingsControls";
import {
  AGE_LABELS,
  CONTENT_SETTINGS,
  DEFAULT_AGE_INDEX,
  DEFAULT_FREQ,
  FREQ_OPTIONS,
  IDENTITIES,
  LOOKING_FOR,
  READING_PREFS,
} from "./interests.data";
import styles from "./InterestsPane.module.css";

export function InterestsPane({ onChange }: { onChange: () => void }) {
  const { draft, updateDraft } = useProfile();
  const [identitiesSkipped, setIdentitiesSkipped] = useState(false);
  const [ageIndex, setAgeIndex] = useState(DEFAULT_AGE_INDEX);
  const [freq, setFreq] = useState(DEFAULT_FREQ);

  return (
    <Pane
      title={
        <>
          Shape what you <em>see.</em>
        </>
      }
      sub="These are private — not shown on your profile. They help us surface gatherings, members, and content that's relevant to you. Change them any time."
    >
      <div
        className={`${styles.prefSection} ${identitiesSkipped ? styles.skipped : ""}`}
      >
        <div className={styles.psHead}>
          Which identities feel like yours?
          <button
            type="button"
            className={styles.psSkip}
            onClick={() => setIdentitiesSkipped((v) => !v)}
          >
            {identitiesSkipped ? "Skipped" : "Skip"}
          </button>
        </div>
        <div className={styles.psHelper}>
          Select as many as feel right. We use these to suggest relevant
          communities and content — not to categorise you.
        </div>
        <ChipSelect
          tick={false}
          options={IDENTITIES.options}
          selected={new Set(draft.identities)}
          onToggle={(label) => {
            const next = draft.identities.includes(label)
              ? draft.identities.filter((x) => x !== label)
              : [...draft.identities, label];
            updateDraft({ identities: next });
            onChange();
          }}
        />
      </div>

      <div className={styles.prefSection}>
        <div className={styles.psHead}>What are you looking for here?</div>
        <div className={styles.psHelper}>Select as many as you like.</div>
        <ChipSelect
          tick={false}
          options={LOOKING_FOR.options}
          selected={new Set(draft.lookingFor)}
          onToggle={(label) => {
            const next = draft.lookingFor.includes(label)
              ? draft.lookingFor.filter((x) => x !== label)
              : [...draft.lookingFor, label];
            updateDraft({ lookingFor: next });
            onChange();
          }}
        />
      </div>

      <div className={styles.prefSection}>
        <div className={styles.psHead}>
          A bit about your life <ComingSoon />
          <span className={styles.psHeadNote}>
            (private — helps with local suggestions)
          </span>
        </div>
        <div className={styles.worldGrid}>
          <div className={styles.field}>
            <label>City / region</label>
            <input
              type="text"
              defaultValue="Lisbon, Portugal"
              disabled
              onChange={onChange}
            />
          </div>
          <div className={styles.field}>
            <label>Languages</label>
            <input
              type="text"
              placeholder="e.g. Portuguese, English"
              disabled
              onChange={onChange}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label>
            Your age range{" "}
            <span className={styles.fieldNote}>
              (optional — never shown to other members)
            </span>
          </label>
          <input
            type="range"
            className={styles.ageSlider}
            min={0}
            max={AGE_LABELS.length - 1}
            step={1}
            value={ageIndex}
            disabled
            onChange={(e) => {
              setAgeIndex(Number(e.target.value));
              onChange();
            }}
          />
          <div className={styles.ageLabelRow}>
            {AGE_LABELS.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <div className={styles.ageVal}>{AGE_LABELS[ageIndex]}</div>
        </div>
      </div>

      <div className={styles.prefSection}>
        <div className={styles.psHead}>What do you like reading?</div>
        <ToggleList>
          {READING_PREFS.map((title) => (
            <ToggleRow
              key={title}
              title={title}
              defaultChecked
              comingSoon
              onChange={onChange}
            />
          ))}
        </ToggleList>
        <div className={styles.subHead}>
          How often do you want to hear from us? <ComingSoon />
        </div>
        <div className={styles.freqOpts}>
          {FREQ_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`${styles.freqOpt} ${freq === opt.key ? styles.freqOptSelected : ""}`}
              disabled
              onClick={() => {
                setFreq(opt.key);
                onChange();
              }}
            >
              <div className={styles.foRadio}>
                <div className={styles.foDot} />
              </div>
              <div>
                <div className={styles.foTitle}>{opt.title}</div>
                <div className={styles.foDesc}>{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Section label="Content settings">
        <div className={styles.psHelper}>
          Turning these off never affects your community access — only your
          feed.
        </div>
        <ToggleList>
          {CONTENT_SETTINGS.map((title) => (
            <ToggleRow
              key={title}
              title={title}
              defaultChecked
              comingSoon
              onChange={onChange}
            />
          ))}
        </ToggleList>
        <div className={styles.legalNote}>
          These preferences are private. Only you and QueerPulse can see them.
        </div>
      </Section>
    </Pane>
  );
}
