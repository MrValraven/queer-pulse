import { useId, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRONOUN_CHIPS } from "./editProfile.data";
import { IdentityPhotoField } from "./EditProfileIdentityFields";
import styles from "./EditProfilePage.module.css";

interface IdentitySectionProps {
  displayName: string;
  location: string;
  photo?: string;
  /** Avatar from the member's social login, offered as a one-tap restore. */
  googlePhoto?: string;
  onNameChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  /** Called with the persistable storage key once an uploaded photo resolves. */
  onPhotoChange: (storageKey: string) => void;
  onUseGooglePhoto: () => void;
  onRemove: () => void;
}

export function IdentitySection({
  displayName,
  location,
  photo,
  googlePhoto,
  onNameChange,
  onLocationChange,
  onPhotoChange,
  onUseGooglePhoto,
  onRemove,
}: IdentitySectionProps) {
  const { t } = useTranslation();
  const fieldId = useId();

  return (
    <div className={styles.section} id="identity">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="settings:editProfile.identity.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>
        {t("settings:editProfile.identity.sub")}
      </p>
      <IdentityPhotoField
        displayName={displayName}
        photo={photo}
        googlePhoto={googlePhoto}
        onPhotoChange={onPhotoChange}
        onUseGooglePhoto={onUseGooglePhoto}
        onRemove={onRemove}
      />
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-name`}>
          {t("settings:editProfile.identity.displayNameLabel")}
        </label>
        <input
          id={`${fieldId}-name`}
          className={styles.fieldInput}
          type="text"
          value={displayName}
          onChange={(e) => onNameChange(e.target.value)}
        />
        <div className={styles.fieldHint}>
          {t("settings:editProfile.identity.displayNameHint")}
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-location`}>
          {t("settings:editProfile.identity.locationLabel")}{" "}
          <span className={styles.fieldOptional}>
            {t("settings:editProfile.identity.locationOptional")}
          </span>
        </label>
        <input
          id={`${fieldId}-location`}
          className={styles.fieldInput}
          type="text"
          placeholder={t("settings:editProfile.identity.locationPlaceholder")}
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
        <div className={styles.fieldHint}>
          {t("settings:editProfile.identity.locationHint")}
        </div>
      </div>
    </div>
  );
}

interface PronounsSectionProps {
  selected: string[];
  onToggle: (p: string) => void;
}

export function PronounsSection({ selected, onToggle }: PronounsSectionProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  const [customInput, setCustomInput] = useState("");
  // Anything selected that is not one of the preset chips is a written-in set.
  const customPronouns = selected.filter((p) => !PRONOUN_CHIPS.includes(p));

  function addCustom() {
    const trimmed = customInput.trim();
    setCustomInput("");
    if (!trimmed || selected.includes(trimmed)) return;
    onToggle(trimmed);
  }

  return (
    <div className={styles.section} id="pronouns">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="settings:editProfile.pronouns.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>
        <Translation
          i18nKey="settings:editProfile.pronouns.sub"
          components={{ a: <Link to={routes.pronounsGuide} /> }}
        />
      </p>
      <div className={styles.field} style={{ marginBottom: "14px" }}>
        <div className={styles.fieldLabel}>
          {t("settings:editProfile.pronouns.label")}
        </div>
        <div className={styles.pronounChips}>
          {PRONOUN_CHIPS.map((p) => (
            <button
              type="button"
              key={p}
              className={[
                styles.pronounChip,
                selected.includes(p) && styles.pronounChipSelected,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onToggle(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <label
          className={styles.fieldLabel}
          style={{ marginTop: "10px" }}
          htmlFor={`${fieldId}-custom-pronoun`}
        >
          {t("settings:editProfile.pronouns.writeOwnLabel")}
        </label>
        {customPronouns.length > 0 && (
          <div className={styles.skillsDisplay}>
            {customPronouns.map((p) => (
              <span key={p} className={styles.skillTag}>
                {p}
                <button
                  type="button"
                  className={styles.skillTagRemove}
                  aria-label={t(
                    "settings:editProfile.pronouns.removeCustomAriaLabel",
                    { pronoun: p },
                  )}
                  onClick={() => onToggle(p)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className={styles.skillInputRow}>
          <input
            id={`${fieldId}-custom-pronoun`}
            className={styles.fieldInput}
            type="text"
            placeholder={t("settings:editProfile.pronouns.writeOwnPlaceholder")}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
          />
          <Button
            variant="ghost"
            onClick={addCustom}
            style={{ whiteSpace: "nowrap" }}
          >
            {t("settings:editProfile.skills.add")}
          </Button>
        </div>
        <div className={styles.fieldHint}>
          {t("settings:editProfile.pronouns.hint")}
        </div>
      </div>
    </div>
  );
}

interface BioSectionProps {
  bioText: string;
  occupation: string;
  onBioChange: (v: string) => void;
  onOccupationChange: (v: string) => void;
}

const BIO_MAX = 300;

export function BioSection({
  bioText,
  occupation,
  onBioChange,
  onOccupationChange,
}: BioSectionProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  const overLimit = bioText.length > BIO_MAX * 0.9;
  return (
    <div className={styles.section} id="bio">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="settings:editProfile.bio.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>{t("settings:editProfile.bio.sub")}</p>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-bio`}>
          {t("settings:editProfile.bio.label")}{" "}
          <span
            className={[styles.charCount, overLimit && styles.charCountWarn]
              .filter(Boolean)
              .join(" ")}
          >
            {bioText.length} / {BIO_MAX}
          </span>
        </label>
        <textarea
          id={`${fieldId}-bio`}
          className={styles.fieldTextarea}
          value={bioText}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder={t("settings:editProfile.bio.placeholder")}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-occupation`}>
          {t("settings:editProfile.bio.occupationLabel")}
        </label>
        <input
          id={`${fieldId}-occupation`}
          className={styles.fieldInput}
          type="text"
          value={occupation}
          onChange={(e) => onOccupationChange(e.target.value)}
        />
      </div>
    </div>
  );
}

interface SkillsSectionProps {
  skills: string[];
  interests: string[];
  skillInput: string;
  interestInput: string;
  onSkillInputChange: (v: string) => void;
  onInterestInputChange: (v: string) => void;
  onAdd: (key: "skills" | "interests", val: string) => void;
  onRemove: (key: "skills" | "interests", val: string) => void;
  onKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    key: "skills" | "interests",
  ) => void;
}

export function SkillsSection({
  skills,
  interests,
  skillInput,
  interestInput,
  onSkillInputChange,
  onInterestInputChange,
  onAdd,
  onRemove,
  onKeyDown,
}: SkillsSectionProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <div className={styles.section} id="skills">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="settings:editProfile.skills.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={styles.sectionSub}>
        {t("settings:editProfile.skills.sub")}
      </p>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-skill`}>
          {t("settings:editProfile.skills.offerLabel")}
        </label>
        <div className={styles.skillInputRow}>
          <input
            id={`${fieldId}-skill`}
            className={styles.fieldInput}
            type="text"
            placeholder={t("settings:editProfile.skills.offerPlaceholder")}
            value={skillInput}
            onChange={(e) => onSkillInputChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, "skills")}
          />
          <Button
            variant="ghost"
            onClick={() => onAdd("skills", skillInput)}
            style={{ whiteSpace: "nowrap" }}
          >
            {t("settings:editProfile.skills.add")}
          </Button>
        </div>
        <div className={styles.skillsDisplay}>
          {skills.map((s) => (
            <span key={s} className={styles.skillTag}>
              {s}
              <button
                type="button"
                className={styles.skillTagRemove}
                onClick={() => onRemove("skills", s)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={`${fieldId}-interest`}>
          {t("settings:editProfile.skills.interestsLabel")}
        </label>
        <div className={styles.skillInputRow}>
          <input
            id={`${fieldId}-interest`}
            className={styles.fieldInput}
            type="text"
            placeholder={t("settings:editProfile.skills.interestsPlaceholder")}
            value={interestInput}
            onChange={(e) => onInterestInputChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, "interests")}
          />
          <Button
            variant="ghost"
            onClick={() => onAdd("interests", interestInput)}
            style={{ whiteSpace: "nowrap" }}
          >
            {t("settings:editProfile.skills.add")}
          </Button>
        </div>
        <div className={styles.skillsDisplay}>
          {interests.map((s) => (
            <span key={s} className={styles.skillTag}>
              {s}
              <button
                type="button"
                className={styles.skillTagRemove}
                onClick={() => onRemove("interests", s)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
