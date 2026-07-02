import {
  Avatar,
  FadeIn,
  ImageSlot,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { RECAP_PHOTOS, RECAP_ATTENDEES } from "./gatheringRecap.data";
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
  return (
    <div>
      <div className={styles.sectionEyebrow}>The write-up</div>
      <div className={styles.sectionHead}>
        The <em>gathering</em>
      </div>
      <p className={styles.writeup}>
        We took over the terrace at A Cevicheria on a warm Saturday morning, and
        for three hours it became ours — a little corner of Príncipe Real that
        felt genuinely, unmistakably queer. Thirty-eight people came. Some knew
        each other; most didn't, at least not yet. By noon, you wouldn't have
        known the difference.
      </p>
      <p className={styles.writeup}>
        There was a long table of food that kept getting replenished. There were
        conversations that started with "how do you know the host?" and turned
        into something else entirely — plans, collaborations, phone numbers
        exchanged. Two people who'd been connected on QueerPulse for months
        finally met in person.
      </p>
      <p className={styles.writeup}>
        These gatherings don't have agendas. They're just time — held,
        deliberately, for people like us to be in a room together. This one was
        a good one. We'll do it again in July.
      </p>

      <div className={styles.photos}>
        <div className={styles.sectionEyebrow}>From the day</div>
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
                    placeholder="photo from the gathering"
                  />
                </FadeIn>
              ))}
          {submittedPhotos.map((photo) => (
            <figure key={photo.id} className={styles.newPhoto}>
              <ImageSlot
                tint={photo.tint}
                height={140}
                radius={12}
                placeholder="your photo"
              />
              <figcaption className={styles.newPhotoCaption}>
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className={styles.photoCaption}>
          Photos by community members ·{" "}
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
            Submit yours →
          </button>
        </div>
      </div>

      <div className={styles.who}>
        <div className={styles.sectionEyebrow}>Who was there</div>
        <div
          className={styles.sectionHead}
          style={{ fontSize: "clamp(24px,3vw,34px)", marginBottom: 20 }}
        >
          38 members <em>attended</em>
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
        <div className={styles.moreLabel}>+ 30 more members attended</div>
      </div>
    </div>
  );
}
