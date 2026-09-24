import { Avatar, ImageSlot } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { TherapistView } from "./therapistView";
import { initialsFor } from "./therapistView.helpers";
import { TherapistEditLink } from "./TherapistEditLink";
import { THERAPIST_EDIT_TARGETS } from "./therapistEditLinks.data";
import styles from "./TherapistHero.module.css";

interface TherapistHeroMediaProps {
  data: PublicSubprofileView;
  view: TherapistView;
}

/** The hero's left column: the portrait, or big initials on the persona's
 *  accent tint, with the owner's link to change it. */
export function TherapistHeroMedia({ data, view }: TherapistHeroMediaProps) {
  const { t } = useTranslation();
  // Skips a leading title: "Dr. Marta Reis" gives "MR".
  const initials = initialsFor(data.displayName) || "?";
  return (
    <div className={styles.media}>
      {view.portraitUrl ? (
        <ImageSlot
          className={styles.portrait}
          src={view.portraitUrl}
          alt=""
          tint="coral"
          radius={0}
          width="100%"
          height="100%"
          srcSize={640}
          initials={initials}
          loading="eager"
          fetchPriority="high"
        />
      ) : (
        <Avatar
          className={styles.face}
          initials={initials}
          tint="coral"
          size={132}
        />
      )}
      <TherapistEditLink
        target={THERAPIST_EDIT_TARGETS.portrait}
        label={t("subprofiles:therapist.edit.portrait")}
        className={styles.mediaEdit}
      />
    </div>
  );
}
