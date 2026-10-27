import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import {
  STUDIO_LANDING_HERO_SHOTS,
  STUDIO_LANDING_PHONE_QUERY,
} from "./studioLanding.data";
import { StudioLandingDeviceFrame } from "./StudioLandingDeviceFrame";
import { StudioLandingScreenshot } from "./StudioLandingScreenshot";
import styles from "./StudioLandingHeroVisual.module.css";

/**
 * The hero's screenshot pair: Studio home in a laptop, with the phone's Now
 * playing screen overlapping the laptop's lower right corner. Both rise in
 * once on load, then the phone floats slowly. Both images are priority
 * loads.
 *
 * Below 720px only the phone renders, centred: the gallery right after the
 * hero shows every screen in a phone frame there, and leaving the laptop
 * out of the tree means its image is never fetched, so the phone is the
 * eager image.
 */
export function StudioLandingHeroVisual() {
  const isPhoneViewport = useMediaQuery(STUDIO_LANDING_PHONE_QUERY);

  return (
    <div className={styles.visual}>
      {!isPhoneViewport && (
        <StudioLandingDeviceFrame device="laptop" className={styles.laptop}>
          <StudioLandingScreenshot
            shot={STUDIO_LANDING_HERO_SHOTS.laptop}
            isPriority
          />
        </StudioLandingDeviceFrame>
      )}
      <StudioLandingDeviceFrame device="phone" className={styles.phone}>
        <StudioLandingScreenshot
          shot={STUDIO_LANDING_HERO_SHOTS.phone}
          isPriority
        />
      </StudioLandingDeviceFrame>
    </div>
  );
}
