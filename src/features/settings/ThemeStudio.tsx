import {
  FLAG_SWATCHES,
  COVER_STYLES,
  PATTERNS,
  BADGE_OPTIONS,
  type CoverStyle,
  type PatternKey,
} from "./profileTheme.data";
import { useProfileTheme } from "../../app/providers/useProfileTheme";
import { currentUser, fullName } from "../members/data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ThemeStudio.module.css";

function buildCoverBg(
  colors: string[],
  _coverStyle: CoverStyle,
  pattern: PatternKey,
): string {
  const pct = 100 / colors.length;
  const stops = colors
    .map((c, i) => `${c} ${i * pct}% ${(i + 1) * pct}%`)
    .join(",");
  const gradient = `linear-gradient(to right,${stops})`;
  const pats: Record<PatternKey, string> = {
    none: "",
    stripe:
      "repeating-linear-gradient(45deg,rgba(255,255,255,.12) 0,rgba(255,255,255,.12) 2px,transparent 2px,transparent 10px),",
    dots: "radial-gradient(circle,rgba(255,255,255,.18) 1px,transparent 1px) 0 0/6px 6px,",
    grid: "repeating-linear-gradient(90deg,rgba(255,255,255,.1) 0,rgba(255,255,255,.1) 1px,transparent 1px,transparent 8px),repeating-linear-gradient(rgba(255,255,255,.1) 0,rgba(255,255,255,.1) 1px,transparent 1px,transparent 8px),",
  };
  return pats[pattern] + gradient;
}

/**
 * The profile-theme picker + live preview. Shared by the standalone
 * `ProfileThemePage` and the Settings "Profile theme" pane. Pass `onChange`
 * to be notified when the host should surface unsaved changes.
 */
export function ThemeStudio({ onChange }: { onChange?: () => void }) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfileTheme();
  const {
    flag: selectedFlag,
    coverStyle,
    pattern,
    showBadges,
    showLevel,
    badge,
  } = draft;

  const flag = FLAG_SWATCHES[selectedFlag] ?? FLAG_SWATCHES[0]!;
  const coverBg = buildCoverBg(flag.colors, coverStyle, pattern);
  /** Apply an edit and let the host surface the unsaved-changes bar. */
  const edit = (patch: Parameters<typeof updateDraft>[0]) => {
    updateDraft(patch);
    onChange?.();
  };

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <div className={styles.pkHead}>
          {t("settings:themeStudio.sectionLabel")}
        </div>
        <div className={styles.pkSub}>{t("settings:themeStudio.sub")}</div>

        <div className={styles.pkLabel}>
          {t("settings:themeStudio.prideThemesLabel")}
        </div>
        <div className={styles.flagGrid}>
          {FLAG_SWATCHES.map((f, i) => (
            <button
              type="button"
              key={f.label}
              className={`${styles.flagSwatch} ${i === selectedFlag ? styles.flagSwatchSelected : ""}`}
              style={{ background: f.background }}
              title={f.label}
              aria-label={f.label}
              aria-pressed={i === selectedFlag}
              onClick={() => edit({ flag: i })}
            />
          ))}
        </div>

        <div className={styles.pkLabel}>
          {t("settings:themeStudio.coverStyleLabel")}
        </div>
        <div className={styles.coverStyleOpts}>
          {COVER_STYLES.map((cs) => (
            <button
              type="button"
              key={cs.key}
              className={`${styles.csOpt} ${coverStyle === cs.key ? styles.csOptSelected : ""}`}
              aria-pressed={coverStyle === cs.key}
              onClick={() => edit({ coverStyle: cs.key })}
            >
              <span className={styles.csRadio} aria-hidden>
                <span className={styles.csDot} />
              </span>
              <span className={styles.csLabel}>{t(cs.labelKey)}</span>
            </button>
          ))}
        </div>

        <div className={styles.pkLabel}>
          {t("settings:themeStudio.coverPatternLabel")}
        </div>
        <div className={styles.patternGrid}>
          {PATTERNS.map((p) => (
            <button
              type="button"
              key={p.key}
              className={`${styles.patSwatch} ${pattern === p.key ? styles.patSwatchSelected : ""}`}
              style={{ background: p.background }}
              title={t(p.titleKey)}
              aria-label={t(p.titleKey)}
              aria-pressed={pattern === p.key}
              onClick={() => edit({ pattern: p.key })}
            />
          ))}
        </div>

        <div className={styles.pkLabel}>
          {t("settings:themeStudio.badgeDisplayLabel")}
        </div>
        <div className={styles.tglRows}>
          <div className={styles.tglRow}>
            <div className={styles.tglTitle}>
              {t("settings:themeStudio.showBadgesToggle")}
            </div>
            <label className={styles.tglSw}>
              <input
                type="checkbox"
                aria-label={t("settings:themeStudio.showBadgesToggle")}
                checked={showBadges}
                onChange={(e) => edit({ showBadges: e.target.checked })}
              />
              <div className={styles.tglTrack} />
              <div className={styles.tglThumb} />
            </label>
          </div>
          <div className={styles.tglRow}>
            <div className={styles.tglTitle}>
              {t("settings:themeStudio.showLevelToggle")}
            </div>
            <label className={styles.tglSw}>
              <input
                type="checkbox"
                aria-label={t("settings:themeStudio.showLevelToggle")}
                checked={showLevel}
                onChange={(e) => edit({ showLevel: e.target.checked })}
              />
              <div className={styles.tglTrack} />
              <div className={styles.tglThumb} />
            </label>
          </div>
        </div>
        <select
          className={styles.badgeSelect}
          value={badge}
          onChange={(e) => edit({ badge: e.target.value })}
        >
          {BADGE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {t(o.labelKey)}
            </option>
          ))}
        </select>
      </div>

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
                style={{ background: coverBg }}
              />
              <div className={styles.pclAvWrap}>
                <div className={styles.pclAv}>{currentUser.initials}</div>
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
                <div className={styles.pclName}>{fullName(currentUser)}</div>
                <div className={styles.pclPronouns}>he/they</div>
                <div className={styles.pclLoc}>
                  {t("settings:themeStudio.memberSince", {
                    year: currentUser.since,
                  })}
                </div>
                <div className={styles.pclBio}>{currentUser.bio}</div>
                <div
                  className={styles.pclLevel}
                  style={{ opacity: showLevel ? 1 : 0 }}
                >
                  {t("settings:themeStudio.levelPreview")}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className={styles.previewLabel}>
              {t("settings:themeStudio.directoryCardLabel")}
            </div>
            <div className={styles.dirCard}>
              <div className={styles.dcCover} style={{ background: coverBg }} />
              <div className={styles.dcAvWrap}>
                <div className={styles.dcAv}>{currentUser.initials}</div>
              </div>
              <div className={styles.dcBody}>
                <div className={styles.dcName}>{fullName(currentUser)}</div>
                <div className={styles.dcMeta}>he/they · Lisbon</div>
                <div className={styles.dcBio}>{currentUser.bio}</div>
              </div>
            </div>
            <div className={styles.previewHint}>
              {t("settings:themeStudio.directoryHint")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
