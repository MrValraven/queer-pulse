import { type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Button, ComingSoon } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRONOUN_CHIPS, VIS_FIELDS } from "./editProfile.data";
import { leadingInitials } from "../../shared/lib/initials";
import { safeHref } from "../../shared/lib/safeHref";
import styles from "./EditProfilePage.module.css";

interface IdentitySectionProps {
  displayName: string;
  location: string;
  photo?: string;
  /** Avatar from the member's social login, offered as a one-tap restore. */
  googlePhoto?: string;
  onNameChange: (v: string) => void;
  onLocationChange: (v: string) => void;
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
  onUseGooglePhoto,
  onRemove,
}: IdentitySectionProps) {
  const { t } = useTranslation();
  const initials = leadingInitials(displayName);
  // Guard the photo URL before dropping it into CSS `url(...)`: only an http(s)
  // link with no `)` / whitespace, otherwise fall back to the initials tile.
  const safePhoto = safeHref(photo);
  const photoUrl = safePhoto && !/[)\s]/.test(safePhoto) ? safePhoto : null;

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
      <div className={styles.photoRow}>
        <div
          className={styles.photoAv}
          style={
            photoUrl
              ? {
                  backgroundImage: `url(${photoUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "transparent",
                }
              : undefined
          }
        >
          {photoUrl ? "" : initials}
        </div>
        <div>
          <div className={styles.photoActions}>
            <span className={styles.uploadAction}>
              <Button
                variant="ghost"
                disabled
                style={{ fontSize: "13.5px", padding: "9px 18px" }}
              >
                {t("settings:editProfile.identity.uploadPhoto")}
              </Button>
              <ComingSoon />
            </span>
            {photo ? (
              <Button
                variant="ghost"
                onClick={onRemove}
                style={{
                  fontSize: "13.5px",
                  padding: "9px 18px",
                  color: "var(--ink-40)",
                }}
              >
                {t("settings:editProfile.identity.removePhoto")}
              </Button>
            ) : googlePhoto ? (
              <Button
                variant="ghost"
                onClick={onUseGooglePhoto}
                style={{ fontSize: "13.5px", padding: "9px 18px" }}
              >
                {t("settings:editProfile.identity.useGooglePhoto")}
              </Button>
            ) : null}
          </div>
          <div className={styles.photoHint}>
            {photo
              ? t("settings:editProfile.identity.photoHint.default")
              : googlePhoto
                ? t("settings:editProfile.identity.photoHint.google")
                : t("settings:editProfile.identity.photoHint.default")}
          </div>
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("settings:editProfile.identity.displayNameLabel")}
        </div>
        <input
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
        <div className={styles.fieldLabel}>
          {t("settings:editProfile.identity.locationLabel")}{" "}
          <span className={styles.fieldOptional}>
            {t("settings:editProfile.identity.locationOptional")}
          </span>
        </div>
        <input
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
        <div className={styles.fieldLabel} style={{ marginTop: "10px" }}>
          {t("settings:editProfile.pronouns.writeOwnLabel")} <ComingSoon />
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          placeholder={t("settings:editProfile.pronouns.writeOwnPlaceholder")}
          disabled
        />
        <div className={styles.fieldHint}>
          {t("settings:editProfile.pronouns.hint")}
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          {t("settings:editProfile.pronouns.chosenNameLabel")} <ComingSoon />{" "}
          <span className={styles.fieldOptional}>
            {t("settings:editProfile.pronouns.chosenNameOptional")}
          </span>
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          placeholder={t("settings:editProfile.pronouns.chosenNamePlaceholder")}
          disabled
        />
        <div className={styles.fieldHint}>
          {t("settings:editProfile.pronouns.chosenNameHint")}
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
        <div className={styles.fieldLabel}>
          {t("settings:editProfile.bio.label")}{" "}
          <span
            className={[styles.charCount, overLimit && styles.charCountWarn]
              .filter(Boolean)
              .join(" ")}
          >
            {bioText.length} / {BIO_MAX}
          </span>
        </div>
        <textarea
          className={styles.fieldTextarea}
          value={bioText}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder={t("settings:editProfile.bio.placeholder")}
        />
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            {t("settings:editProfile.bio.occupationLabel")}
          </div>
          <input
            className={styles.fieldInput}
            type="text"
            value={occupation}
            onChange={(e) => onOccupationChange(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            {t("settings:editProfile.bio.organisationLabel")} <ComingSoon />{" "}
            <span className={styles.fieldOptional}>
              {t("settings:editProfile.bio.organisationOptional")}
            </span>
          </div>
          <input
            className={styles.fieldInput}
            type="text"
            placeholder={t("settings:editProfile.bio.organisationPlaceholder")}
            disabled
          />
        </div>
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
        <div className={styles.fieldLabel}>
          {t("settings:editProfile.skills.offerLabel")}
        </div>
        <div className={styles.skillInputRow}>
          <input
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
        <div className={styles.fieldLabel}>
          {t("settings:editProfile.skills.interestsLabel")}
        </div>
        <div className={styles.skillInputRow}>
          <input
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

export function VisibilitySection() {
  const { t } = useTranslation();
  return (
    <div className={styles.section} id="visibility">
      <h2 className={styles.sectionTitle}>
        <Translation
          i18nKey="settings:editProfile.visibility.title"
          components={{ em: <em /> }}
        />{" "}
        <ComingSoon />
      </h2>
      <p className={styles.sectionSub}>
        {t("settings:editProfile.visibility.sub")}
      </p>
      <div className={styles.visPanel}>
        {VIS_FIELDS.map((f) => (
          <div key={f.nameKey} className={styles.visRow}>
            <div>
              <div className={styles.visFieldName}>{t(f.nameKey)}</div>
              <div className={styles.visFieldDesc}>{t(f.descKey)}</div>
            </div>
            {f.locked ? (
              <span className={styles.visAlwaysOn}>
                {t("settings:editProfile.visibility.alwaysOn")}
              </span>
            ) : (
              <select
                className={styles.visSelect}
                defaultValue={f.defaultVal}
                disabled
              >
                <option value="members">
                  {t("settings:editProfile.visibility.optionMembers")}
                </option>
                <option value="connectionsOnly">
                  {t("settings:editProfile.visibility.optionConnectionsOnly")}
                </option>
                <option value="hidden">
                  {t("settings:editProfile.visibility.optionHidden")}
                </option>
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
