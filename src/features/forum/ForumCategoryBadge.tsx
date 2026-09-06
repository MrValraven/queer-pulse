import { CATS, CAT_TONE, type CategoryTone } from "./forum.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ForumPage.module.css";

/**
 * Category tone to the CSS Module class carrying its wash and ink (DES-120).
 *
 * The badge used to take an inline `style` object built from literal rgba()
 * triples in `forum.data.ts`. One of them was plum, and neither `--plum` nor
 * `--plum-rgb` flips in dark mode, so the "General" badge sat as a pale smudge
 * with near-black text on a dark card. `forum.data.ts` now names a colour
 * FAMILY and this stylesheet owns every actual value.
 */
const TONE_CLASS: Record<CategoryTone, string | undefined> = {
  neutral: undefined,
  jade: styles.catToneJade,
  violet: styles.catToneViolet,
  coral: styles.catToneCoral,
  danger: styles.catToneDanger,
};

/**
 * The thread row's category chip.
 *
 * With `onMove` it is a BUTTON that opens the move-category modal (PRD-163):
 * the chip is where a member is already looking when they notice a thread is
 * mis-filed, so it is the affordance rather than another entry buried in the ⋯
 * menu. Without it, it stays the plain label it has always been.
 */
export function ForumCategoryBadge({
  category,
  onMove,
}: {
  category: string;
  onMove?: () => void;
}) {
  const { t } = useTranslation();
  const meta = CATS.find((candidate) => candidate.id === category);
  const name = meta ? t(meta.nameKey) : category;
  const className = [
    styles.catBadge,
    TONE_CLASS[CAT_TONE[category] ?? "neutral"],
  ]
    .filter(Boolean)
    .join(" ");
  const inner = (
    <>
      {meta && (
        <span className={styles.catBadgeIcon} aria-hidden="true">
          <meta.icon />
        </span>
      )}
      {name}
    </>
  );

  if (!onMove) return <span className={className}>{inner}</span>;
  return (
    <button
      type="button"
      className={`${className} ${styles.catBadgeButton}`}
      aria-label={t("forum:moveCategory.badgeAria", { category: name })}
      onClick={onMove}
    >
      {inner}
    </button>
  );
}
