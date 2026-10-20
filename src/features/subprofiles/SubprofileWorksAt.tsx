import { Link } from "react-router-dom";
import { Eyebrow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingWorksAtView } from "../marketing/listBusiness/api/listingTeam.types";
import { ListingTeamListingImage } from "../marketing/listBusiness/team/ListingTeamListingImage";
import styles from "./SubprofileAffiliations.module.css";

interface SubprofileWorksAtProps {
  worksAt: ListingWorksAtView[];
  isInteractive: boolean;
}

/** The "Works at" chips in the persona foot, matching the "Part of" markup
 *  (`.partof>*` styles a `Link` and a `div` identically). In the editor
 *  preview each chip is a plain `div` so a click never leaves the editor. */
export function SubprofileWorksAt({
  worksAt,
  isInteractive,
}: SubprofileWorksAtProps) {
  const { t } = useTranslation();
  if (worksAt.length === 0) return null;

  return (
    <div className={styles.affiliations}>
      <Eyebrow>{t("subprofiles:worksAt.heading")}</Eyebrow>
      <div className="partof">
        {worksAt.map((listing) => {
          const content = (
            <>
              <ListingTeamListingImage listing={listing} size={30} />
              {listing.name}
              {listing.roleLabel ? <span>{listing.roleLabel}</span> : null}
            </>
          );
          return isInteractive ? (
            <Link key={listing.slug} to={listing.href}>
              {content}
            </Link>
          ) : (
            <div key={listing.slug}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
