import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Avatar, type AvatarTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import styles from "./BarterDetailPage.module.css";

/**
 * The poster row on a swap's detail page: avatar, name, neighbourhood (when
 * shared), and the "Message {first}" CTA. Extracted from `BarterDetailPage`
 * to keep that component under the repo's 200-line cap.
 */
export function BarterListingProvider({
  initials,
  tint,
  name,
  hood,
  avatarUrl,
  firstName,
  memberSlug,
}: {
  initials: string;
  tint: AvatarTint;
  name: string;
  hood: string;
  avatarUrl?: string | null;
  firstName: string;
  /** A real member slug to message, or `null`/`undefined` when the server
   *  could not resolve the poster (blocked, removed), which hides the CTA
   *  rather than landing on a bare inbox (PRD-337). */
  memberSlug?: string | null;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.provider}>
      <Avatar
        initials={initials}
        tint={tint}
        size={56}
        src={avatarUrl ?? undefined}
      />
      <div>
        <div className={styles.provName}>{name}</div>
        {/* Rendered only when the poster shares their neighbourhood (the
            server gates it on their own `hoodVisible`). When they don't,
            the line goes entirely rather than falling back to a location
            nobody stated. */}
        {hood && (
          <div className={styles.provRole}>
            {t("economy:barterDetail.locationWithHood", { hood })}
          </div>
        )}
      </div>
      <div className={styles.provAction}>
        <span className={styles.now}>
          {t("economy:barterDetail.repliesFast")}
        </span>
        {memberSlug && (
          <Link
            to={routes.messages}
            state={{ to: { slug: memberSlug, name } }}
            className={styles.provLink}
          >
            {t("economy:barterDetail.messageCta", { firstName })}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
