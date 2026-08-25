import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FeatureHelp, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberName } from "../members/data/members";
import { routes } from "../../app/routeMap";
import { AuthorLink } from "./AuthorLink";
import styles from "./MagazinePage.module.css";

const COVER_IMG =
  "https://images.unsplash.com/photo-1601399470081-29ab3942fd8b?q=80&w=1600&auto=format&fit=crop";

export function MagazineCover() {
  const { t } = useTranslation();

  return (
    <div className={styles.coverRebalanced}>
      <div className={styles.csImage}>
        <ImageSlot
          tint="plum"
          width="100%"
          height="100%"
          radius={0}
          src={COVER_IMG}
          alt={t("magazine:cover.coverAlt")}
          placeholder={t("magazine:cover.coverPlaceholder")}
          style={{ position: "absolute", inset: 0 }}
          loading="eager"
          fetchPriority="high"
        />
        <div className={styles.csImageLabel}>
          {t("magazine:cover.coverImageLabel")}
        </div>
      </div>
      <div className={styles.csText}>
        <div className={styles.csTextInner}>
          <div className={styles.csKicker}>{t("magazine:cover.kicker")}</div>
          {/* Content: this is the cover story's own headline — kept in
              English, it arrives from the API in live mode. */}
          {/* eslint-disable local/no-literal-string -- cover story's own headline, editorial content */}
          <h1 className={styles.csTitle}>
            The city changed.
            <br />
            <em>Did we?</em> <FeatureHelp id="magazine.hub" />
          </h1>
          {/* eslint-enable local/no-literal-string */}
          <div className={styles.csByline}>
            {t("magazine:cover.byline")}{" "}
            <AuthorLink name={memberName("sofia")} /> ·{" "}
            {t("magazine:cover.photographyBy")} {memberName("andre")}
          </div>
          {/* Content: the cover story's own standfirst. */}
          {/* eslint-disable-next-line local/no-literal-string -- cover story's own standfirst, editorial content */}
          <p className={styles.csExcerpt}>
            Lisbon's queer community has spent a decade finding itself. The rent
            has tripled. The bars have closed and reopened and closed again.
            What survived the decade, and what did we lose in the process?
          </p>
          <Link
            className={styles.csRead}
            to={`${routes.article}?id=city-changed`}
          >
            {t("magazine:cover.readFullFeatureCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
