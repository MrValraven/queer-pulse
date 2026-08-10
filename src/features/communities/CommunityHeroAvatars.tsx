import { Link } from "react-router-dom";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Person, Tint } from "./communityDetails";
import { photoOf } from "./communityPeople";
import styles from "./CommunityDetailPage.module.css";

const HERO_AV: Record<Tint, { background: string; color: string }> = {
  coral: {
    background: "rgba(var(--accent-rgb),.22)",
    color: "var(--accent-soft)",
  },
  jade: { background: "rgba(var(--jade-rgb),.22)", color: "var(--jade-soft)" },
  plum: { background: "rgba(247,243,238,.18)", color: "rgba(247,243,238,.8)" },
};

/** The overlapping face strip + "and N more" note in the community hero. */
export function CommunityHeroAvatars({
  avatars,
  memberNum,
  hasCount,
}: {
  avatars: Person[];
  memberNum: number;
  hasCount: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div className={styles.avStrip}>
        {avatars.map((m, i) => {
          const photo = photoOf(m, demoMode);
          const inner = (
            <>
              <span className={styles.heroAvTip}>{m.name}</span>
              <span className={styles.sav} style={HERO_AV[m.tint]}>
                {photo ? (
                  <img
                    src={resolveAvatarSrc(photo)}
                    // The name is already shown as visible text in the adjacent
                    // .heroAvTip label (and names the wrapping link), so the
                    // image is decorative — alt="" avoids axe image-redundant-alt.
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  m.initials
                )}
              </span>
            </>
          );
          return m.slug ? (
            <Link
              key={i}
              to={`/members/${m.slug}`}
              className={styles.heroAv}
              style={{ zIndex: avatars.length - i }}
            >
              {inner}
            </Link>
          ) : (
            <span
              key={i}
              className={styles.heroAv}
              style={{ zIndex: avatars.length - i }}
            >
              {inner}
            </span>
          );
        })}
      </div>
      {hasCount && memberNum > 5 && (
        <span className={styles.stripNote}>
          {t("communities:detail.hero.andMore", { count: memberNum - 5 })}
        </span>
      )}
    </div>
  );
}
