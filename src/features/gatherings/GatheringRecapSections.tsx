import { FiArrowRight } from "react-icons/fi";
import {
  Avatar,
  FadeIn,
  ImageSlot,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  RECAP_PHOTOS,
  RECAP_ATTENDEES,
  RECAP_ATTENDED_COUNT,
  RECAP_MORE_ATTENDED_COUNT,
  RECAP_WRITEUP,
} from "./gatheringRecap.data";
import type { RecapPhoto } from "./PhotoUploadModal";
import styles from "./GatheringRecapPage.module.css";

export function GatheringRecapMain({
  loading,
  submittedPhotos,
  onSubmitPhoto,
}: {
  loading: boolean;
  submittedPhotos: RecapPhoto[];
  onSubmitPhoto: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className={styles.sectionEyebrow}>
        {t("gatherings:recap.writeupEyebrow")}
      </div>
      <div className={styles.sectionHead}>
        <Translation
          i18nKey="gatherings:recap.gatheringHeading"
          components={{ em: <em /> }}
        />
      </div>
      {RECAP_WRITEUP.map((paragraph, index) => (
        <p key={index} className={styles.writeup}>
          {paragraph}
        </p>
      ))}

      <div className={styles.photos}>
        <div className={styles.sectionEyebrow}>
          {t("gatherings:recap.fromTheDayEyebrow")}
        </div>
        <div className={styles.photosGrid} aria-busy={loading}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLine
                  key={i}
                  height={140}
                  style={{ borderRadius: 12 }}
                />
              ))
            : RECAP_PHOTOS.map((photo, index) => (
                <FadeIn key={index} delay={Math.min(index, 8) * 60}>
                  <ImageSlot
                    tint={photo.tint}
                    src={photo.image}
                    height={140}
                    radius={12}
                    placeholder={t("gatherings:recap.photoPlaceholder")}
                  />
                </FadeIn>
              ))}
          {submittedPhotos.map((photo) => (
            <figure key={photo.id} className={styles.newPhoto}>
              <ImageSlot
                tint={photo.tint}
                height={140}
                radius={12}
                placeholder={t("gatherings:recap.upload.photoPlaceholder")}
              />
              <figcaption className={styles.newPhotoCaption}>
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.photoCaption}>
          {t("gatherings:recap.photosByMembers")} ·{" "}
          <button
            type="button"
            onClick={onSubmitPhoto}
            style={{
              color: "var(--accent-ink)",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("gatherings:recap.submitYoursCta")} <FiArrowRight aria-hidden />
          </button>
        </div>
      </div>

      <div className={styles.who}>
        <div className={styles.sectionEyebrow}>
          {t("gatherings:recap.whoWasThereEyebrow")}
        </div>
        <div
          className={styles.sectionHead}
          style={{ fontSize: "clamp(24px,3vw,34px)", marginBottom: 20 }}
        >
          <Translation
            i18nKey="gatherings:recap.attendedHeading"
            values={{ count: RECAP_ATTENDED_COUNT }}
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.whoGrid} aria-busy={loading}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.whoCard}>
                  <SkeletonAvatar size={44} />
                  <SkeletonLine
                    height={12}
                    width="70%"
                    style={{ margin: "10px auto 6px" }}
                  />
                  <SkeletonLine
                    height={10}
                    width="45%"
                    style={{ margin: "0 auto" }}
                  />
                </div>
              ))
            : RECAP_ATTENDEES.map((person, i) => (
                <FadeIn
                  key={person.initials}
                  delay={Math.min(i, 8) * 60}
                  className={styles.whoCard}
                >
                  <Avatar
                    initials={person.initials}
                    tint={person.tint}
                    size={44}
                    style={{ margin: "0 auto" }}
                  />
                  <div className={styles.whoName}>{person.name}</div>
                  <div className={styles.whoPronouns}>{person.pronouns}</div>
                </FadeIn>
              ))}
        </div>
        <div className={styles.moreLabel}>
          {t("gatherings:recap.moreAttended", {
            count: RECAP_MORE_ATTENDED_COUNT,
          })}
        </div>
      </div>
    </div>
  );
}
