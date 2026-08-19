import type { CSSProperties } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RecognitionLevel } from "./api/recognition.adapters";
import styles from "./BadgesPage.module.css";

interface BadgesDialProps {
  level: RecognitionLevel;
}

/** The level dial: a conic-gradient ring on desktop, a plain bar on mobile
 *  (CSS toggles which renders — see the `--mobile` breakpoint in the module).
 *  The only place level + XP progress is drawn. */
export function BadgesDial({ level }: BadgesDialProps) {
  const { t } = useTranslation();
  const percentStyle = { "--p": level.percent } as CSSProperties;
  const atMaxLevel = !level.nextName;

  return (
    <div className={styles.dialWrap}>
      <div className={styles.dial} style={percentStyle}>
        <div className={styles.dialGlow} aria-hidden />
        <div className={styles.dialTick} aria-hidden />
        <div className={styles.dialRing} aria-hidden />
        <div className={styles.dialIn}>
          <div className={styles.dialLv}>{t("members:badges.hero.levelWord")}</div>
          <div className={styles.dialNum}>{level.level}</div>
          <div className={styles.dialName}>{level.name}</div>
        </div>
      </div>
      <div className={styles.xpWrap}>
        <div className={styles.xpBig}>
          {t("members:badges.hero.xpProgress", {
            xp: level.xp.toLocaleString(),
            xpMax: atMaxLevel ? level.xp.toLocaleString() : level.xpMax.toLocaleString(),
          })}
        </div>
        <div className={styles.xpSm}>
          {atMaxLevel ? (
            t("members:badges.hero.maxLevel")
          ) : (
            <Translation
              i18nKey="members:badges.hero.xpToNextName"
              components={{ b: <b /> }}
              values={{ xp: level.xpToNext.toLocaleString(), nextName: level.nextName }}
            />
          )}
        </div>
      </div>
      <div className={styles.bar} style={percentStyle}>
        <div className={styles.barTrack}>
          <span className={styles.barFill} />
        </div>
      </div>
    </div>
  );
}
