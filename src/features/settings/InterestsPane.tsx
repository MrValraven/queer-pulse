import { useId, useState } from "react";
import { ChipSelect, ComingSoon, Toggle } from "../../shared/components/ui";
import { useProfileEdit } from "../../app/providers/useProfile";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  DiscoverableIdentitiesSection,
  PrivateIdentitiesSection,
} from "./IdentitySections";
import { Pane, Section, ToggleList, ToggleRow } from "./SettingsControls";
import {
  AGE_LABELS,
  CONTENT_SETTINGS,
  DEFAULT_AGE_INDEX,
  DEFAULT_FREQ,
  FREQ_OPTIONS,
  LOOKING_FOR,
  READING_PREFS,
} from "./interests.data";
import styles from "./InterestsPane.module.css";

export function InterestsPane({ onChange }: { onChange: () => void }) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileEdit();
  const uid = useId();
  const [ageIndex, setAgeIndex] = useState(DEFAULT_AGE_INDEX);
  const [freq, setFreq] = useState(DEFAULT_FREQ);
  // The slider clamps to AGE_LABELS' bounds, so this is always a hit; the
  // fallback only satisfies noUncheckedIndexedAccess.
  const activeAgeLabel = AGE_LABELS[ageIndex] ?? AGE_LABELS[0];

  return (
    <Pane
      title={
        <Translation
          i18nKey="settings:interests.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("settings:interests.sub")}
    >
      <PrivateIdentitiesSection onChange={onChange} />
      {/* Directly below the chips it reads from — see the doc comment there. */}
      <DiscoverableIdentitiesSection />

      <div className={styles.prefSection}>
        <div className={styles.psHead} id={`${uid}-lookingFor`}>
          {t("settings:interests.lookingFor.heading")}
        </div>
        <div className={styles.psHelper}>
          {t("settings:interests.lookingFor.helper")}
        </div>
        {/* LOOKING_FOR.options are the literal stored value of
            draft.lookingFor — see the NOTE in interests.data.ts. Left
            untranslated on purpose. */}
        <ChipSelect
          tick={false}
          labelledBy={`${uid}-lookingFor`}
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
        <div className={styles.showOnProfileRow}>
          <Toggle
            checked={draft.lookingForPublic}
            onChange={(checked) => {
              updateDraft({ lookingForPublic: checked });
              onChange();
            }}
            label={t("settings:interests.lookingFor.showOnProfile")}
          />
          <span>{t("settings:interests.lookingFor.showOnProfile")}</span>
        </div>
      </div>

      <div className={styles.prefSection}>
        <div className={styles.psHead}>
          {t("settings:interests.life.heading")} <ComingSoon />
          <span className={styles.psHeadNote}>
            {t("settings:interests.life.note")}
          </span>
        </div>
        <div className={styles.worldGrid}>
          <div className={styles.field}>
            <label htmlFor={`${uid}-city`}>
              {t("settings:interests.life.cityLabel")}
            </label>
            {/* The member's real location (empty if unset) — never a hardcoded
                "Lisbon, Portugal" that would show as everyone's city in live.
                The field is coming-soon/disabled (no dedicated city pref yet),
                so it reflects `draft.hood` read-only rather than persisting. */}
            <input
              id={`${uid}-city`}
              type="text"
              value={draft.hood}
              disabled
              readOnly
            />
          </div>
          <div className={styles.field}>
            <label htmlFor={`${uid}-languages`}>
              {t("settings:interests.life.languagesLabel")}
            </label>
            <input
              id={`${uid}-languages`}
              type="text"
              placeholder={t("settings:interests.life.languagesPlaceholder")}
              disabled
              onChange={onChange}
            />
          </div>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${uid}-age`}>
            {t("settings:interests.life.ageLabel")}{" "}
            <span className={styles.fieldNote}>
              {t("settings:interests.life.ageNote")}
            </span>
          </label>
          <input
            id={`${uid}-age`}
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
            {AGE_LABELS.map((label) => (
              <span key={label.id}>{t(label.labelKey)}</span>
            ))}
          </div>
          <div className={styles.ageVal}>
            {activeAgeLabel ? t(activeAgeLabel.labelKey) : null}
          </div>
        </div>
      </div>

      <div className={styles.prefSection}>
        <div className={styles.psHead}>
          {t("settings:interests.reading.heading")}
        </div>
        <ToggleList>
          {READING_PREFS.map((pref) => (
            <ToggleRow
              key={pref.id}
              title={t(pref.labelKey)}
              defaultChecked
              comingSoon
              onChange={onChange}
            />
          ))}
        </ToggleList>
        <div className={styles.subHead}>
          {t("settings:interests.reading.frequencyHeading")} <ComingSoon />
        </div>
        <div className={styles.freqOpts}>
          {FREQ_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              aria-label={t(opt.titleKey)}
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
                <div className={styles.foTitle}>{t(opt.titleKey)}</div>
                <div className={styles.foDesc}>{t(opt.descKey)}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Section label={t("settings:interests.content.heading")}>
        <div className={styles.psHelper}>
          {t("settings:interests.content.helper")}
        </div>
        <ToggleList>
          {CONTENT_SETTINGS.map((setting) => (
            <ToggleRow
              key={setting.id}
              title={t(setting.labelKey)}
              defaultChecked
              comingSoon
              onChange={onChange}
            />
          ))}
        </ToggleList>
        <div className={styles.legalNote}>
          {t("settings:interests.content.legalNote")}
        </div>
      </Section>
    </Pane>
  );
}
