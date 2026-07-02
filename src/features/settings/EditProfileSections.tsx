import { useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { currentUser, fullName } from "../members/data/members";
import { PRONOUN_CHIPS, VIS_FIELDS } from "./editProfile.data";
import styles from "./EditProfilePage.module.css";

interface IdentitySectionProps {
  /** Object-URL preview of a freshly picked photo, or null for the initials avatar. */
  avatarPreview: string | null;
  onPickFile: (file: File) => void;
  onRemove: () => void;
  onChange: () => void;
}

export function IdentitySection({
  avatarPreview,
  onPickFile,
  onRemove,
  onChange,
}: IdentitySectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onPickFile(file);
    // reset so picking the same file again still fires onChange
    e.target.value = "";
  }

  return (
    <div className={styles.section} id="identity">
      <h2 className={styles.sectionTitle}>
        Identity <em>&amp; photo</em>
      </h2>
      <p className={styles.sectionSub}>
        This is how you appear to other members.
      </p>
      <div className={styles.photoRow}>
        <div
          className={styles.photoAv}
          style={
            avatarPreview
              ? {
                  backgroundImage: `url(${avatarPreview})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "transparent",
                }
              : undefined
          }
        >
          {avatarPreview ? "" : currentUser.initials}
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <div className={styles.photoActions}>
            <Button
              variant="ghost"
              onClick={() => fileRef.current?.click()}
              style={{ fontSize: "13.5px", padding: "9px 18px" }}
            >
              Upload new photo
            </Button>
            <Button
              variant="ghost"
              onClick={onRemove}
              style={{
                fontSize: "13.5px",
                padding: "9px 18px",
                color: "var(--ink-40)",
              }}
            >
              Remove photo
            </Button>
          </div>
          <div className={styles.photoHint}>
            JPG or PNG · max 5 MB · square works best
          </div>
        </div>
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Display name</div>
          <input
            className={styles.fieldInput}
            type="text"
            defaultValue={fullName(currentUser)}
            onChange={onChange}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Username</div>
          <input
            className={styles.fieldInput}
            type="text"
            defaultValue="@tiagocosta"
            onChange={onChange}
          />
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          Location in Lisbon{" "}
          <span className={styles.fieldOptional}>optional</span>
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          placeholder="e.g. Mouraria, Intendente…"
          defaultValue={currentUser.hood}
          onChange={onChange}
        />
        <div className={styles.fieldHint}>
          Neighbourhood-level only — never exact address.
        </div>
      </div>
    </div>
  );
}

interface PronounsSectionProps {
  selected: string[];
  onToggle: (p: string) => void;
  onChange: () => void;
}

export function PronounsSection({
  selected,
  onToggle,
  onChange,
}: PronounsSectionProps) {
  return (
    <div className={styles.section} id="pronouns">
      <h2 className={styles.sectionTitle}>
        Pronouns <em>&amp; name</em>
      </h2>
      <p className={styles.sectionSub}>
        Your chosen name and pronouns appear everywhere on the platform. See the{" "}
        <Link to={routes.pronounsGuide}>pronouns guide</Link> if you're updating
        a legal name across the platform.
      </p>
      <div className={styles.field} style={{ marginBottom: "14px" }}>
        <div className={styles.fieldLabel}>Pronouns</div>
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
        <input
          className={styles.fieldInput}
          type="text"
          placeholder="Or write your own…"
          onChange={onChange}
        />
        <div className={styles.fieldHint}>
          You can select multiple or write something custom. Pronouns are shown
          on your profile only — not in meta tags or URLs.
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          Chosen name{" "}
          <span className={styles.fieldOptional}>
            if different from display name
          </span>
        </div>
        <input
          className={styles.fieldInput}
          type="text"
          placeholder="Name to use in all communications"
          onChange={onChange}
        />
        <div className={styles.fieldHint}>
          Used in emails from us and in any platform communications.
        </div>
      </div>
    </div>
  );
}

interface BioSectionProps {
  bioText: string;
  onChange: (val: string) => void;
  onAnyChange: () => void;
}

const BIO_MAX = 300;

export function BioSection({
  bioText,
  onChange,
  onAnyChange,
}: BioSectionProps) {
  const overLimit = bioText.length > BIO_MAX * 0.9;
  return (
    <div className={styles.section} id="bio">
      <h2 className={styles.sectionTitle}>
        Bio <em>&amp; occupation</em>
      </h2>
      <p className={styles.sectionSub}>
        Tell the community who you are. No CV language required.
      </p>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          Bio{" "}
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
          onChange={(e) => {
            onChange(e.target.value);
            onAnyChange();
          }}
          placeholder="A few sentences about you…"
        />
      </div>
      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>Occupation</div>
          <input
            className={styles.fieldInput}
            type="text"
            defaultValue={currentUser.role}
            onChange={onAnyChange}
          />
        </div>
        <div className={styles.field}>
          <div className={styles.fieldLabel}>
            Organisation <span className={styles.fieldOptional}>optional</span>
          </div>
          <input
            className={styles.fieldInput}
            type="text"
            placeholder="Where you work or study"
            onChange={onAnyChange}
          />
        </div>
      </div>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>
          Link <span className={styles.fieldOptional}>optional</span>
        </div>
        <input
          className={styles.fieldInput}
          type="url"
          placeholder="https://…"
          onChange={onAnyChange}
        />
        <div className={styles.fieldHint}>
          One link. No social media icons. Just a URL if you want one.
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
  return (
    <div className={styles.section} id="skills">
      <h2 className={styles.sectionTitle}>
        Skills <em>&amp; interests</em>
      </h2>
      <p className={styles.sectionSub}>
        Used for matching in the skills exchange and connecting with members who
        share your interests.
      </p>
      <div className={styles.field}>
        <div className={styles.fieldLabel}>Skills you can offer</div>
        <div className={styles.skillInputRow}>
          <input
            className={styles.fieldInput}
            type="text"
            placeholder="e.g. Legal advice, Graphic design…"
            value={skillInput}
            onChange={(e) => onSkillInputChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, "skills")}
          />
          <Button
            variant="ghost"
            onClick={() => onAdd("skills", skillInput)}
            style={{ whiteSpace: "nowrap" }}
          >
            Add
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
        <div className={styles.fieldLabel}>Interests</div>
        <div className={styles.skillInputRow}>
          <input
            className={styles.fieldInput}
            type="text"
            placeholder="e.g. Housing policy, Film, Cooking…"
            value={interestInput}
            onChange={(e) => onInterestInputChange(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, "interests")}
          />
          <Button
            variant="ghost"
            onClick={() => onAdd("interests", interestInput)}
            style={{ whiteSpace: "nowrap" }}
          >
            Add
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

export function VisibilitySection({ onChange }: { onChange: () => void }) {
  return (
    <div className={styles.section} id="visibility">
      <h2 className={styles.sectionTitle}>
        Field <em>visibility</em>
      </h2>
      <p className={styles.sectionSub}>
        Choose who can see each part of your profile. QueerPulse is invite-only
        so "Members" means your fellow members.
      </p>
      <div className={styles.visPanel}>
        {VIS_FIELDS.map((f) => (
          <div key={f.name} className={styles.visRow}>
            <div>
              <div className={styles.visFieldName}>{f.name}</div>
              <div className={styles.visFieldDesc}>{f.desc}</div>
            </div>
            {f.locked ? (
              <span className={styles.visAlwaysOn}>Always on</span>
            ) : (
              <select
                className={styles.visSelect}
                defaultValue={f.defaultVal}
                onChange={onChange}
              >
                <option>Members</option>
                <option>Connections only</option>
                <option>Hidden</option>
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
