import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCalendar,
  FiCamera,
  FiEdit3,
  FiExternalLink,
  FiFileText,
  FiMessageCircle,
  FiMusic,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { FadeIn, ImageSlot } from "../../shared/components/ui";
import { safeHref } from "../../shared/lib/safeHref";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ActivityKind } from "./api/members.api";
import type {
  PublicProfileActivityDTO,
  PublicProfileLinkDTO,
  PublicProfileWorkDTO,
} from "./api/publicProfile.api";
import styles from "./PublicProfilePage.module.css";

/** Activity kind → its icon (mirrors the live adapter's ACTIVITY_ICONS). */
const ACTIVITY_ICONS: Record<ActivityKind, IconType> = {
  post: FiFileText,
  event: FiCalendar,
  message: FiMessageCircle,
  reading: FiBookOpen,
  edit: FiEdit3,
  photo: FiCamera,
  music: FiMusic,
  community: FiUsers,
  persona: FiUserPlus,
};

/**
 * The member's outbound links.
 *
 * These are member-entered URLs shown to logged-out visitors, so every one is
 * `rel="noopener noreferrer nofollow"`: `noopener`/`noreferrer` keep the target
 * from reaching back into this tab or reading the referrer, and `nofollow`
 * stops a public, indexable profile from passing search-ranking signal — which
 * is what would otherwise make these pages worth farming for spam links.
 */
export function PublicProfileLinks({
  links,
}: {
  links: PublicProfileLinkDTO[];
}) {
  const { t } = useTranslation();
  if (links.length === 0) return null;

  return (
    <FadeIn as="section" className={styles.sec} delay={140}>
      <div className={styles.secH}>
        <h2>{t("members:publicBySlug.linksHeading")}</h2>
      </div>
      <ul className={styles.linkList}>
        {links.map((link) => {
          // Skip any member-supplied link whose scheme isn't safe to render.
          const linkHref = safeHref(link.url);
          if (!linkHref) return null;
          return (
            <li key={`${link.label}-${link.url}`}>
              <a
                className={styles.publicLink}
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <span>{link.label}</span>
                <FiExternalLink aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </FadeIn>
  );
}

/**
 * Recent public activity, as a logged-out visitor sees it. Rows are static
 * (not links): the open web gets the fact of an action, never a deep link into
 * the members' app (the backend drops `toLink` for this endpoint). When there
 * is nothing to show, a quiet honest line — never fabricated activity.
 */
export function PublicProfileActivity({
  activity,
}: {
  activity: PublicProfileActivityDTO[];
}) {
  const { t } = useTranslation();

  return (
    <FadeIn as="section" className={styles.sec} delay={260}>
      <div className={styles.secH}>
        <h2>{t("members:publicBySlug.activityHeading")}</h2>
      </div>
      {activity.length === 0 ? (
        <p className={styles.activityEmpty}>
          {t("members:publicBySlug.activityEmpty")}
        </p>
      ) : (
        <ul className={styles.activityList}>
          {activity.map((item, index) => {
            const Icon = ACTIVITY_ICONS[item.kind] ?? FiFileText;
            return (
              <li
                key={`${item.title}-${index}`}
                className={styles.activityItem}
              >
                <span className={styles.activityIcon} aria-hidden>
                  <Icon />
                </span>
                <span className={styles.activityBody}>
                  <span className={styles.activityTitle}>{item.title}</span>
                  {item.sub && (
                    <span className={styles.activitySub}>{item.sub}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </FadeIn>
  );
}

/** The work the member chose to show publicly. */
export function PublicProfileWork({ work }: { work: PublicProfileWorkDTO[] }) {
  const { t } = useTranslation();
  if (work.length === 0) return null;

  return (
    <FadeIn as="section" className={styles.sec} delay={200}>
      <div className={styles.secH}>
        <h2>{t("members:publicBySlug.workHeading")}</h2>
      </div>
      <div className={styles.workGrid}>
        {work.map((item) => (
          <article key={`${item.title}-${item.year}`} className={styles.card}>
            <ImageSlot
              className={styles.workImg}
              radius={14}
              placeholder={item.title}
              src={item.imageUrl ?? undefined}
              alt=""
            />
            <div className={styles.cardTitle}>{item.title}</div>
            <div className={styles.cardMeta}>{item.year}</div>
          </article>
        ))}
      </div>
    </FadeIn>
  );
}
