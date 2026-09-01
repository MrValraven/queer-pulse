import { useState } from "react";
import { FiExternalLink, FiImage, FiSlash } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { API_BASE_URL } from "../../shared/api/config";
import type { ReportedPhoto } from "./adminModeration.data";
import styles from "./AdminReportPhotoEvidence.module.css";

/**
 * The photograph an `event_photo` report is actually about.
 *
 * Every other report subject is text, so the drawer's excerpt block carries the
 * thing being judged. This one is an image, and until now the drawer showed a
 * moderator the gathering's name, the caption and the uploader's handle, with
 * `thread: []` beneath it. Somebody asked "is this photo outing someone" inside
 * a one-hour SLA was reading prose about a picture they could not see.
 *
 * ## Where the bytes come from
 *
 * NOT `/files/<key>`. `gathering-photo` is a session-gated upload kind that
 * `FilesController` serves to its uploader alone, and that must stay: it is what
 * stops any signed-in member walking the bucket for photos of people at events
 * they never attended. So the image is fetched from
 * `GET /mod/report-photo-evidence/<reportId>`, which is moderator/admin-gated,
 * takes a REPORT id rather than a storage key, and resolves the key from that
 * report's own snapshot. A moderator sees exactly the photos reported to them.
 *
 * The address is built from the API origin with NO `/v1`: that route is
 * version-neutral for the same reason `/files/*` is, because a raw `<img src>`
 * never passes through the `/v1`-injecting API client. The session rides along
 * as the httpOnly cookie browsers attach to image requests.
 *
 * ## Three honest states
 *
 * The photo is held by reference and no copy of it is kept (see
 * `PhotoSnapshotEvidence` in the backend for that decision), so the uploader can
 * delete it out from under an open report. The route answers 404 rather than
 * handing back a presigned URL for a key that no longer exists, and this renders
 * that as "no longer available" rather than a broken image icon. The report stays
 * fully actionable either way: a photo disappearing minutes after it was reported
 * is not the same as nothing having happened, and the caption, the upload time
 * and the gathering are all still on the drawer.
 */
export function ReportedPhotoEvidence({
  reportId,
  photo,
}: {
  reportId: string;
  photo: ReportedPhoto;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const [loadState, setLoadState] = useState<
    "loading" | "loaded" | "unavailable"
  >("loading");

  const photoSource = `${API_BASE_URL}/mod/report-photo-evidence/${reportId}`;
  const isUnavailable = loadState === "unavailable";

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionLabel}>
        {t("admin:moderation.reportDrawer.photoEvidence.title")}
      </h3>

      {isUnavailable ? (
        <p className={styles.unavailable}>
          <FiSlash aria-hidden />
          <span>
            {t("admin:moderation.reportDrawer.photoEvidence.unavailable")}
          </span>
        </p>
      ) : (
        <div className={styles.frame}>
          {loadState === "loading" && (
            <span className={styles.placeholder} aria-hidden>
              <FiImage />
            </span>
          )}
          {/* The accessible name says WHAT this image is, never what is in it.
              A moderator's screen reader is often audible to whoever is nearby,
              and describing the person in a photo that may be outing them is the
              exact harm being judged. The uploader's caption is rendered below as
              visible text instead, where it reads as the uploader's words rather
              than as a description of the subject. */}
          <img
            className={styles.image}
            src={photoSource}
            alt={t("admin:moderation.reportDrawer.photoEvidence.imageAlt")}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoadState("loaded")}
            onError={() => setLoadState("unavailable")}
          />
        </div>
      )}

      {photo.caption && (
        <>
          <p className={styles.captionLabel}>
            {t("admin:moderation.reportDrawer.photoEvidence.captionLabel")}
          </p>
          <blockquote className={styles.caption}>{photo.caption}</blockquote>
        </>
      )}

      <p className={styles.meta}>
        {t("admin:moderation.reportDrawer.photoEvidence.uploadedAt", {
          date: format.date(new Date(photo.uploadedAt)),
        })}
      </p>

      {!isUnavailable && (
        // A drawer column is narrow and a face at the back of a crowd decides
        // some of these reports, so the full-size view is one click away. Same
        // staff-gated address, opened as its own document.
        <a
          className={styles.fullSizeLink}
          href={photoSource}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("admin:moderation.reportDrawer.photoEvidence.fullSizeCta")}
          <FiExternalLink aria-hidden />
        </a>
      )}
    </section>
  );
}
