import { FiHeadphones, FiMic } from "react-icons/fi";
import { SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioLandingAudience } from "./studioLanding.data";
import styles from "./StudioLandingHero.module.css";

interface StudioLandingAudienceSwitchProps {
  audience: StudioLandingAudience;
  onChange: (next: StudioLandingAudience) => void;
}

function isStudioLandingAudience(
  value: string,
): value is StudioLandingAudience {
  return value === "listener" || value === "artist";
}

/**
 * The hero's "I listen / I make music" switch: two pressed-state buttons in
 * one named group. The page owns the choice (`useStudioLandingAudience`), so
 * the hero copy, both calls to action and the section order follow it.
 */
export function StudioLandingAudienceSwitch({
  audience,
  onChange,
}: StudioLandingAudienceSwitchProps) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      className={styles.audienceSwitch}
      label={t("studio:landing.hero.audienceLabel")}
      value={audience}
      onChange={(next) => {
        if (isStudioLandingAudience(next) && next !== audience) onChange(next);
      }}
      options={[
        {
          value: "listener",
          label: t("studio:landing.hero.audience.listener"),
          icon: <FiHeadphones />,
        },
        {
          value: "artist",
          label: t("studio:landing.hero.audience.artist"),
          icon: <FiMic />,
        },
      ]}
    />
  );
}
