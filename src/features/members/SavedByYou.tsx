import { Link } from "react-router-dom";
import { FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa6";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSaved, type SavedItem } from "../../app/providers/useSaved";
import { linkToPath, routes } from "../../app/routeMap";
import { KIND_CARD, type KindCard } from "./savedByYou.data";
import styles from "./SavedByYou.module.css";

const variantClass: Record<KindCard["variant"], string> = {
  magazine: styles.vMagazine!,
  film: styles.vFilm!,
  job: styles.vJob!,
  event: styles.vEvent!,
  thread: styles.vThread!,
  group: styles.vGroup!,
};

/** Pull a "N min" read-length out of a meta string, returning the pill text and
 * the meta with that segment removed so it isn't shown twice. */
function splitReadTime(meta?: string): { meta?: string; readTime?: string } {
  if (!meta) return {};
  const match = meta.match(/(\d+)\s*min(?:\s*read)?/i);
  if (!match) return { meta };
  const cleaned = meta
    .replace(match[0], "")
    .replace(/\s*·\s*$/, "")
    .replace(/^\s*·\s*/, "")
    .trim();
  return { meta: cleaned || undefined, readTime: `${match[1]} min` };
}

/** A single saved item, rendered as a rich card matching the design prototype. */
function SaveCard({
  item,
  onUnsave,
}: {
  item: SavedItem;
  onUnsave: () => void;
}) {
  const { t } = useTranslation();
  const cfg = KIND_CARD[item.kind];
  // Prefer an explicit readTime; otherwise lift one out of the meta line.
  const derived = splitReadTime(item.meta);
  const readTime = item.readTime ?? derived.readTime;
  const metaText = item.readTime ? item.meta : derived.meta;

  return (
    <article className={`${styles.card} ${variantClass[cfg.variant]}`}>
      <div className={styles.top}>
        <span className={styles.cat}>{t(cfg.labelKey)}</span>
        <button
          type="button"
          className={styles.bookmark}
          aria-label={t("members:savedByYou.removeAriaLabel", {
            title: item.title,
          })}
          title={t("members:savedByYou.removeTitle")}
          onClick={onUnsave}
        >
          <FaBookmark aria-hidden />
        </button>
      </div>

      {item.href ? (
        <Link to={linkToPath(item.href)} className={styles.title}>
          {item.title}
        </Link>
      ) : (
        <span className={styles.title}>{item.title}</span>
      )}

      {metaText && <div className={styles.meta}>{metaText}</div>}

      {item.description && <p className={styles.desc}>{item.description}</p>}

      {(item.href || readTime) && (
        <div className={styles.footer}>
          {item.href ? (
            <Link to={linkToPath(item.href)} className={styles.readLink}>
              {t(cfg.readKey)} →
            </Link>
          ) : (
            <span />
          )}
          {readTime && <span className={styles.readPill}>{readTime}</span>}
        </div>
      )}
    </article>
  );
}

/**
 * Live list of everything the member has saved across the app, driven by the
 * SavedProvider store and rendered as a grid of cards (one per saved item).
 * Each card links to the item and can be removed in place via its bookmark.
 * Shows an EmptyState when nothing is saved.
 */
export function SavedByYou() {
  const { t } = useTranslation();
  const { items, unsave } = useSaved();
  const { showToast } = useToast();

  if (items.length === 0) {
    return (
      <section className={styles.wrap}>
        <div className={styles.secH}>
          <span>{t("members:savedByYou.heading")}</span>
        </div>
        <EmptyState
          icon={<FiBookmark />}
          title={t("members:savedByYou.empty.title")}
          description={t("members:savedByYou.empty.description")}
          action={{
            label: t("members:savedByYou.empty.browseMagazineCta"),
            to: routes.magazine,
          }}
          secondaryAction={{
            label: t("members:savedByYou.empty.exploreCinemaCta"),
            to: routes.cinema,
          }}
        />
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <div className={styles.secH}>
        <span>{t("members:savedByYou.heading")}</span>
        <span className={styles.ct}>
          {t("members:savedByYou.count", { count: items.length })}
        </span>
      </div>

      <div className={styles.grid}>
        {items.map((item, i) => (
          <FadeIn key={item.id} delay={Math.min(i, 8) * 60}>
            <SaveCard
              item={item}
              onUnsave={() => {
                unsave(item.id);
                showToast(t("members:savedByYou.toast.removed"), "info");
              }}
            />
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
