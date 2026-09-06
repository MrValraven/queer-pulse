import { currentUser, fullName } from "../members/data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useProfileData } from "../../app/providers/useProfile";
import { levelNameKeyFor } from "../members/levelLadder.data";
import styles from "./ThemeStudio.module.css";

/** The level the sample profile card is drawn at. Illustrative only: it names
 *  no real member's standing. */
const PREVIEW_LEVEL = 4;

/**
 * The live "profile card" + "directory card" preview beside the theme picker.
 * Split out of `ThemeStudio` so each component stays under the line limit.
 */
export function ThemeStudioPreview({
  coverBackground,
  showBadges,
  showLevel,
}: {
  coverBackground: string;
  showBadges: boolean;
  showLevel: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { profile } = useProfileData();
  // Live mode previews the signed-in member's own profile (from ProfileProvider);
  // the mock "Tiago Costa" seed is only ever shown in demo mode.
  const previewMember = demoMode ? currentUser : profile;
  // Read from the previewed member, never a hard-coded string: this card used to
  // print "he/they · Lisbon" for everyone, which misgenders a live member in
  // their own settings. Each line is dropped when the member has not set it.
  const pronouns = previewMember.pronouns?.trim();
  const hood = previewMember.hood?.trim();
  const directoryMeta = [pronouns, hood].filter(Boolean).join(" · ");
  // The rung this sample card illustrates. The label used to spell "Familiar"
  // into both catalogues, a fourth hand-written copy of a ladder word; it now
  // reads from the one level map (see `members/levelLadder.data.ts`).
  const previewLevelNameKey = levelNameKeyFor(PREVIEW_LEVEL);
  return (
    <div>
      <div className={styles.previewLabel} style={{ marginBottom: 6 }}>
        {t("settings:themeStudio.previewLabel")}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-40)", marginBottom: 20 }}>
        {t("settings:themeStudio.previewHintTop")}
      </div>
      <div className={styles.previewCards}>
        <div>
          <div className={styles.previewLabel}>
            {t("settings:themeStudio.profileCardLabel")}
          </div>
          <div className={styles.profileCard}>
            <div
              className={styles.pclCover}
              style={{ background: coverBackground }}
            />
            <div className={styles.pclAvWrap}>
              <div className={styles.pclAv}>{previewMember.initials}</div>
              <div
                className={styles.pclBadgeIcon}
                style={{ opacity: showBadges ? 1 : 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 2l1.5 4.5H14l-3.7 2.7 1.4 4.3L8 11.2l-3.7 2.8 1.4-4.3L2 6.5h4.5L8 2Z"
                    stroke="var(--plum)"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className={styles.pclBody}>
              <div className={styles.pclName}>{fullName(previewMember)}</div>
              {pronouns && <div className={styles.pclPronouns}>{pronouns}</div>}
              <div className={styles.pclLoc}>
                {t("settings:themeStudio.memberSince", {
                  year: previewMember.since,
                })}
              </div>
              <div className={styles.pclBio}>{previewMember.bio}</div>
              <div
                className={styles.pclLevel}
                style={{ opacity: showLevel ? 1 : 0 }}
              >
                {t("settings:themeStudio.levelPreview", {
                  level: PREVIEW_LEVEL,
                  name: previewLevelNameKey ? t(previewLevelNameKey) : "",
                })}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className={styles.previewLabel}>
            {t("settings:themeStudio.directoryCardLabel")}
          </div>
          <div className={styles.dirCard}>
            <div
              className={styles.dcCover}
              style={{ background: coverBackground }}
            />
            <div className={styles.dcAvWrap}>
              <div className={styles.dcAv}>{previewMember.initials}</div>
            </div>
            <div className={styles.dcBody}>
              <div className={styles.dcName}>{fullName(previewMember)}</div>
              {directoryMeta && (
                <div className={styles.dcMeta}>{directoryMeta}</div>
              )}
              <div className={styles.dcBio}>{previewMember.bio}</div>
            </div>
          </div>
          <div className={styles.previewHint}>
            {t("settings:themeStudio.directoryHint")}
          </div>
        </div>
      </div>
    </div>
  );
}
