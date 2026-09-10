import { useState } from "react";
import type { Member } from "./data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ExpandableText } from "../../shared/components/ui";
import { ResolvedMentionText } from "../../shared/mentions/ResolvedMentionText";
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
      {/* Members write bios at any length; folded to a few lines, the rest of
          the hero (here for / works in / tags / CTAs) still opens on screen.
          `resetKey` re-folds and re-measures when the EN/PT swap below puts a
          different-length text in the same clamped box. */}
      <ExpandableText
        className={styles.bio}
        lines={6}
        linesMobile={8}
        resetKey={bio}
      >
        <ResolvedMentionText text={bio} />
      </ExpandableText>
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
            {t(`members:profile.hero.writtenBy.${lang}`, {
              name: profile.first,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
