import { useState } from "react";
import type { Member } from "./data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfileHeroMain.module.css";

/**
 * Profile bio with an EN/PT language toggle. Renders the EN bio only, with
 * no toggle UI, when the member hasn't written a Portuguese translation
 * (`profile.bioPt` absent).
 */
export function ProfileBioLanguageToggle({ profile }: { profile: Member }) {
  const { t } = useTranslation();
  const [lang, setLang] = useState<"en" | "pt">("en");
  const bio = lang === "pt" && profile.bioPt ? profile.bioPt : profile.bio;
  return (
    <div className={styles.biowrap}>
      <p className={styles.bio}>{bio}</p>
      {profile.bioPt && (
        <div className={styles.biolang}>
          {(["en", "pt"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={lang === option}
              aria-label={t(`common:language.${option}`)}
              onClick={() => setLang(option)}
            >
              {option.toUpperCase()}
            </button>
          ))}
          <span>
            {t(`members:profile.hero.writtenBy.${lang}`, { name: profile.first })}
          </span>
        </div>
      )}
    </div>
  );
}
