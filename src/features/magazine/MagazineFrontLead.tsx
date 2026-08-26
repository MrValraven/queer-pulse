import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FadeIn, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AuthorLink } from "./AuthorLink";
import { tintFor } from "./api/magazine.adapters";
import type { MagazineFrontEntryDto } from "./api/magazineFront.api";
import styles from "./MagazinePage.module.css";

/**
 * The lead story: whatever the desk put FIRST in the current issue's run
 * order, given the full-bleed cover treatment the demo front has always had
 * (CON-13). Live mode used to open on a nine-up grid of the nine most recent
 * pieces, so the reader could not tell which one the editors led with.
 *
 * Every field is the article's own, and each one drops out cleanly when it is
 * unset rather than being stood in for:
 *  - no lead art (`heroImageKey`, falling back to `socialImage`) leaves the
 *    tinted `ImageSlot` placeholder the live cards already use, never a stock
 *    photograph;
 *  - no `kicker` falls back to naming the slot ("Cover story"), which is what
 *    the position actually means;
 *  - no issue number leaves the cover label off entirely.
 * There is no photographer credit line: the model carries no photo credit,
 * and inventing one would put a name under someone else's picture.
 */
export function MagazineFrontLead({
  entry,
  issueNumber,
}: {
  entry: MagazineFrontEntryDto;
  issueNumber: string | null;
}) {
  const { t } = useTranslation();
  const tint = tintFor(entry.author.handle);
  // `tintFor` returns the broader `AvatarTint`; `ImageSlot` takes the narrower
  // `ImageSlotTint`. Narrow here rather than widening the primitive.
  const imageTint = tint === "default" || tint === "auth" ? "plum" : tint;

  return (
    <FadeIn className={styles.coverRebalanced}>
      <div className={styles.csImage}>
        <ImageSlot
          tint={imageTint}
          width="100%"
          height="100%"
          radius={0}
          src={entry.imageUrl ?? undefined}
          alt={entry.title}
          placeholder={entry.title}
          // CON-04 — `focus`, never `crop`: the lead plate is full-bleed, so
          // its box aspect never matches an arbitrary saved rect and the
          // exact-frame prop would distort the art.
          focus={entry.imageCrop}
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
        {issueNumber && (
          <div className={styles.csImageLabel}>
            {t("magazine:front.coverLabel", { number: issueNumber })}
          </div>
        )}
      </div>
      <div className={styles.csText}>
        <div className={styles.csTextInner}>
          <div className={styles.csKicker}>
            {entry.kicker || t("magazine:front.leadKicker")}
          </div>
          {/* Content: the lead story's own headline, byline and standfirst,
              straight from the API. */}
          <h1 className={styles.csTitle}>{entry.title}</h1>
          <div className={styles.csByline}>
            {t("magazine:cover.byline")}{" "}
            <AuthorLink name={entry.author.displayName} />
          </div>
          <p className={styles.csExcerpt}>{entry.standfirst || entry.dek}</p>
          <Link
            className={styles.csRead}
            to={`${routes.article}?id=${entry.slug}`}
          >
            {t("magazine:cover.readFullFeatureCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}
