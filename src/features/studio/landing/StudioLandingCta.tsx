import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { requestInvitePath } from "../../auth/api/joinRequestSource";
import type { StudioLandingAudience } from "./studioLanding.data";
import { StudioLandingAccessRequest } from "./StudioLandingAccessRequest";
import styles from "./StudioLandingCta.module.css";

interface StudioLandingCtaProps {
  placement: "hero" | "closing" | "artists";
  audience: StudioLandingAudience;
}

const PLACEMENT_CLASS: Record<
  StudioLandingCtaProps["placement"],
  string | undefined
> = {
  hero: styles.hero,
  closing: styles.closing,
  artists: styles.artists,
};

/**
 * The landing's call to action, the same in the hero, the For artists
 * section and the closing. Signed-out visitors get the invite button, tagged
 * with the audience's source so our team sees who asked as an artist. A
 * signed-in member already has an account, so they get the Studio access
 * request instead (`StudioLandingAccessRequest`).
 */
export function StudioLandingCta({
  placement,
  audience,
}: StudioLandingCtaProps) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const memberClass = loggedIn ? ` ${styles.member}` : "";
  return (
    <div
      className={`${styles.cta} ${PLACEMENT_CLASS[placement] ?? ""}${memberClass}`}
    >
      {loggedIn ? (
        <StudioLandingAccessRequest placement={placement} audience={audience} />
      ) : (
        <Button
          variant="primary"
          size="lg"
          to={requestInvitePath(
            audience === "artist" ? "studio_artist" : "studio_landing",
          )}
        >
          {audience === "artist"
            ? t("studio:landing.cta.applyAsArtist")
            : t("studio:landing.cta.requestInvite")}
          <FiArrowRight aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
