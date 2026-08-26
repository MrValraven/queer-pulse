import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Avatar, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { memberRowAvatar } from "./searchAvatar";
import { linkToPath } from "../../app/routeMap";
import {
  TYPE_BG,
  TYPE_ICON,
  TYPE_LABEL_KEY,
  type SearchItem,
} from "./search.data";
import styles from "./SearchPage.module.css";

/** One search hit. Shared by the results page and its "load more" pages, so a
 *  paged-in row is indistinguishable from a first-page one. */
export function ResultCard({ item }: { item: SearchItem }) {
  const { t } = useTranslation();
  const TypeIcon = item.icon ?? TYPE_ICON[item.t];
  const avatar = memberRowAvatar(item);
  return (
    <Link to={linkToPath(item.href)} className={styles.card}>
      {avatar ? (
        <Avatar
          initials={avatar.initials}
          tint={avatar.tint}
          src={avatar.photo}
          alt={item.name}
          size={42}
        />
      ) : (
        <div
          className={styles.cardIcon}
          style={{ background: TYPE_BG[item.t] }}
        >
          <TypeIcon />
        </div>
      )}
      <div className={styles.cardBody}>
        <div className={styles.cardType}>{t(TYPE_LABEL_KEY[item.t])}</div>
        <div className={styles.nameRow}>
          <div className={styles.cardName}>{item.name}</div>
          <MemberStaffBadge slug={item.slug} />
        </div>
        <div className={styles.cardSub}>{item.sub}</div>
      </div>
    </Link>
  );
}

/** A bare grid of result cards, with no section heading of its own. */
export function ResultGrid({
  items,
  fadeOffset = 0,
}: {
  items: SearchItem[];
  /** Continues the stagger across an appended page instead of restarting it. */
  fadeOffset?: number;
}) {
  return (
    <div className={styles.grid}>
      {items.map((item, index) => (
        <FadeIn
          key={`${item.t}-${item.href}-${index}`}
          delay={Math.min(index + fadeOffset, 8) * 60}
        >
          <ResultCard item={item} />
        </FadeIn>
      ))}
    </div>
  );
}

export function Group({
  items,
  label,
  onSeeAll,
  children,
}: {
  items: SearchItem[];
  label: string;
  /** Set when this type is at its per-type cap on the "all" view — renders a
   *  link that switches to this type's own tab, where the backend is asked
   *  for the full result set instead of the capped one (DISC-10). */
  onSeeAll?: () => void;
  /** Rendered under the grid: the type tab's "load more" pager (SOC-08). */
  children?: React.ReactNode;
}) {
  const { t } = useTranslation();
  if (!items.length) return null;
  return (
    <div className={styles.section}>
      <div className={styles.secHead}>{label}</div>
      <ResultGrid items={items} />
      {onSeeAll && (
        <button type="button" className={styles.seeAll} onClick={onSeeAll}>
          {t("members:search.seeAllIn", { category: label })}
          <FiArrowRight aria-hidden />
        </button>
      )}
      {children}
    </div>
  );
}
