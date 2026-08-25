import { FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button, SideSheet } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { BadgeDrawerEntry, BadgeVerification } from "./badges.data";
import { progressPercent, RARITY_LABEL_KEY } from "./badgeSelectors";
import { BadgeMedallion } from "./BadgeMedallion";
import {
  useBadgeStoryNotes,
  useBadgeVisibilityPrefs,
} from "./useBadgePreferences";
import styles from "./BadgesPage.module.css";

const VERIFY_COPY: Record<
  BadgeVerification,
  { titleKey: string; bodyKey: string }
> = {
  auto: {
    titleKey: "members:badges.drawer.verifyAutoTitle",
    bodyKey: "members:badges.drawer.verifyAutoBody",
  },
  host: {
    titleKey: "members:badges.drawer.verifyHostTitle",
    bodyKey: "members:badges.drawer.verifyHostBody",
  },
  review: {
    titleKey: "members:badges.drawer.verifyReviewTitle",
    bodyKey: "members:badges.drawer.verifyReviewBody",
  },
  peer: {
    titleKey: "members:badges.drawer.verifyPeerTitle",
    bodyKey: "members:badges.drawer.verifyPeerBody",
  },
};

const CHECKED_BY_LABEL_KEY: Record<BadgeVerification, string> = {
  auto: "members:badges.drawer.checkedBySystem",
  host: "members:badges.drawer.checkedByHost",
  review: "members:badges.drawer.checkedByPerson",
  peer: "members:badges.drawer.checkedByMember",
};

interface BadgeDrawerProps {
  entries: BadgeDrawerEntry[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

/** Full badge detail: criteria, progress, rarity/worth/verification, the
 *  earned date or how far along it is, a private note (earned badges), and
 *  prev/next paging through whichever list opened it. */
export function BadgeDrawer({
  entries,
  index,
  onNavigate,
  onClose,
}: BadgeDrawerProps) {
  const { t } = useTranslation();
  const { getStoryNote, setStoryNote } = useBadgeStoryNotes();
  const { isHidden, toggleHidden } = useBadgeVisibilityPrefs();
  const current = entries[index];
  if (!current) return null;
  const { badge, earned } = current;
  const percent = progressPercent(badge);
  const visible = !isHidden(badge.key);

  return (
    <SideSheet title={badge.name} onClose={onClose}>
      <div className={styles.drNav}>
        <button
          type="button"
          className={styles.drIb}
          onClick={() =>
            onNavigate((index - 1 + entries.length) % entries.length)
          }
          aria-label={t("members:badges.drawer.previous")}
        >
          <FiChevronLeft aria-hidden />
        </button>
        <button
          type="button"
          className={styles.drIb}
          onClick={() => onNavigate((index + 1) % entries.length)}
          aria-label={t("members:badges.drawer.next")}
        >
          <FiChevronRight aria-hidden />
        </button>
        <span className={styles.drCount}>
          {t("members:badges.drawer.count", {
            index: index + 1,
            total: entries.length,
          })}
        </span>
      </div>

      <div className={styles.drHero}>
        <BadgeMedallion
          badge={badge}
          earned={earned}
          progressPercent={percent}
          size="big"
        />
        <div className={styles.drCat}>
          {badge.seasonal
            ? t("members:badges.drawer.seasonalTag")
            : badge.category}
        </div>
        <h3>{badge.name}</h3>
        <p className={styles.drStatus}>
          {earned
            ? badge.when || t("members:badges.drawer.earnedThisWeek")
            : badge.progress
              ? t("members:badges.drawer.progressCount", {
                  units: badge.progress.units,
                  target: badge.progress.target,
                })
              : (badge.criteria ?? badge.when)}
        </p>
      </div>

      <div className={styles.drSec}>
        <h5>{t("members:badges.drawer.whatItTakes")}</h5>
        <div className={`${styles.critRow} ${earned ? styles.critRowOn : ""}`}>
          <span className={styles.critIcon}>
            {earned && <FiCheck aria-hidden />}
          </span>
          <span>{badge.criteria ?? badge.when}</span>
        </div>
        <div className={styles.drStrip}>
          <div>
            <div className={styles.drStripKey}>
              {t("members:badges.drawer.rarity")}
            </div>
            <div
              className={`${styles.drStripVal} ${badge.rarity === "legendary" ? styles.drStripValRare : ""}`}
            >
              {t(RARITY_LABEL_KEY[badge.rarity])}
            </div>
          </div>
          {badge.xpReward !== undefined && (
            <div>
              <div className={styles.drStripKey}>
                {t("members:badges.drawer.worth")}
              </div>
              <div className={styles.drStripVal}>{badge.xpReward}</div>
            </div>
          )}
          {badge.verifiedBy && (
            <div>
              <div className={styles.drStripKey}>
                {t("members:badges.drawer.checkedBy")}
              </div>
              <div className={`${styles.drStripVal} ${styles.drStripValSm}`}>
                {t(CHECKED_BY_LABEL_KEY[badge.verifiedBy])}
              </div>
            </div>
          )}
        </div>
      </div>

      {badge.verifiedBy && (
        <div className={styles.drSec}>
          <h5>{t("members:badges.drawer.howCheckedHeading")}</h5>
          <p className={styles.drVerify}>
            <b>{t(VERIFY_COPY[badge.verifiedBy].titleKey)}</b>
            {t(VERIFY_COPY[badge.verifiedBy].bodyKey)}
          </p>
        </div>
      )}

      {earned && (
        <div className={styles.drSec}>
          <h5>{t("members:badges.drawer.noteHeading")}</h5>
          <textarea
            className={styles.storyBox}
            value={getStoryNote(badge.key)}
            onChange={(event) => setStoryNote(badge.key, event.target.value)}
            placeholder={t("members:badges.drawer.notePlaceholder")}
          />
          <p className={styles.noteHelp}>
            {t("members:badges.drawer.noteHelp")}
          </p>
        </div>
      )}

      {earned && (
        <div className={styles.drFoot}>
          <div className={styles.drPriv}>
            <span>
              {visible
                ? t("members:badges.drawer.visibleOnProfile")
                : t("members:badges.drawer.privateToYou")}
              <span className={styles.drPrivNote}>
                {t("members:badges.drawer.visibilityNote")}
              </span>
            </span>
            <button
              type="button"
              className={styles.swSwitch}
              role="switch"
              aria-checked={visible}
              aria-label={t("members:badges.drawer.visibleOnProfile")}
              onClick={() => toggleHidden(badge.key)}
            >
              <span className={styles.swTrack} />
            </button>
          </div>
          <Button variant="ghost" onClick={onClose}>
            {t("members:badges.drawer.close")}
          </Button>
        </div>
      )}
    </SideSheet>
  );
}
