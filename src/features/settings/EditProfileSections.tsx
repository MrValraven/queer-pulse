import { useId, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PronounField } from "../../shared/identity/PronounField";
import { WorkFieldPicker } from "../members/WorkFieldPicker";
import { type WorkFieldSelection } from "../members/workFieldPicker.data";
import { IdentityPhotoField } from "./EditProfileIdentityFields";
import styles from "./EditProfilePage.module.css";

interface IdentitySectionProps {
  firstName: string;
  lastName: string;
  location: string;
  photo?: string;
  /** Avatar from the member's social login, offered as a one-tap restore. */
  googlePhoto?: string;
  /** The member's pronoun set — the personal block keeps name, pronouns, and
   * location together rather than splitting pronouns into its own section. */
  pronouns: string[];
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onPronounsChange: (next: string[]) => void;
  /** Called with the persistable storage key once an uploaded photo resolves. */
  onPhotoChange: (storageKey: string) => void;
  onUseGooglePhoto: () => void;
  onRemove: () => void;
}

export function IdentitySection({
  firstName,
  lastName,
  location,
  photo,
  googlePhoto,
  pronouns,
  onFirstNameChange,
  onLastNameChange,
  onLocationChange,
  onPronounsChange,
  onPhotoChange,
  onUseGooglePhoto,
  onRemove,
}: IdentitySectionProps) {
  const { t } = useTranslation();
  const fieldId = useId();
  const displayName = `${firstName} ${lastName}`.trim();

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
        <div className={styles.fieldRow}>
          <div>
            <label className={styles.fieldLabel} htmlFor={`${fieldId}-first`}>
              {t("settings:editProfile.identity.firstNameLabel")}
            </label>
            <input
              id={`${fieldId}-first`}
              className={styles.fieldInput}
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
            />
          </div>
          <div>
            <label className={styles.fieldLabel} htmlFor={`${fieldId}-last`}>
              {t("settings:editProfile.identity.lastNameLabel")}
            </label>
            <input
              id={`${fieldId}-last`}
              className={styles.fieldInput}
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.fieldHint}>
          {t("settings:editProfile.identity.nameHint")}
        </div>
      </div>
      <PronounField
        value={pronouns}
        onChange={onPronounsChange}
        labels={{
          field: t("settings:editProfile.pronouns.label"),
          helper: (
            <Translation
              i18nKey="settings:editProfile.pronouns.sub"
              components={{ a: <Link to={routes.pronounsGuide} /> }}
            />
          ),
          writeOwn: t("settings:editProfile.pronouns.writeOwnLabel"),
          placeholder: t("settings:editProfile.pronouns.writeOwnPlaceholder"),
          add: t("settings:editProfile.skills.add"),
          removeAria: (pronoun) =>
            t("settings:editProfile.pronouns.removeCustomAriaLabel", {
              pronoun,
            }),
        }}
      />
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

interface BioSectionProps {
  bioText: string;
  occupation: string;
  /** The member's field(s) of work and profession(s) — the shared picker's
   *  selection, persisted as `discipline`/`profession` on the profile. */
  work: WorkFieldSelection;
  onBioChange: (v: string) => void;
  onOccupationChange: (v: string) => void;
  onWorkChange: (next: WorkFieldSelection) => void;
}

const BIO_MAX = 300;

export function BioSection({
  bioText,
  occupation,
  work,
  onBioChange,
  onOccupationChange,
  onWorkChange,
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
      {/* The occupation line above is the member's own words; this is the same
          answer in the directory's vocabulary, so a search for a photographer
          finds them. Same picker as the profile editor and onboarding. */}
      <div className={styles.field}>
        <span className={styles.fieldLabel}>
          {t("members:profileEdit.work.label")}
        </span>
        <WorkFieldPicker
          discipline={work.discipline}
          profession={work.profession}
          headingClassName={styles.fieldLabel}
          onChange={onWorkChange}
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
                aria-label={t("settings:editProfile.skills.removeAria", {
                  name: s,
                })}
                onClick={() => onRemove("skills", s)}
              >
                <FiX aria-hidden />
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
                aria-label={t("settings:editProfile.interests.removeAria", {
                  name: s,
                })}
                onClick={() => onRemove("interests", s)}
              >
                <FiX aria-hidden />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
