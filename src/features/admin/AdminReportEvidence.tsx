import { useState } from "react";
import {
  FiExternalLink,
  FiFileText,
  FiImage,
  FiInfo,
  FiShield,
  FiSlash,
} from "react-icons/fi";
import { API_BASE_URL } from "../../shared/api/config";
import { Button } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatBytes } from "./adminMedia.format";
import type {
  ReportEvidenceSnapshot,
  ReportedMessageSnapshot,
} from "./adminModeration.data";
import { ReportedGroupEvidence } from "./AdminReportGroupEvidence";
import styles from "./AdminReportEvidence.module.css";
import photoStyles from "./AdminReportPhotoEvidence.module.css";

/**
 * The server snapshots a report carries, one block each, in the order the
 * evidence array holds them.
 *
 * A snapshot is what the reported thing looked like when the report was filed,
 * captured server-side, so a later edit, unsend or takedown never changes what
 * a moderator judges. Every block is display-only.
 *
 * To add a block for a new snapshot kind (for example the `group` snapshot on a
 * `conversation` report): add its member to `ReportEvidenceSnapshot`
 * (`adminModeration.data.ts`), parse it in `evidenceSnapshotsFrom`
 * (`api/moderation.adapters.ts`), and add a `case` to `EvidenceSnapshotBlock`
 * below.
 */
export function ReportEvidenceSnapshots({
  reportId,
  snapshots,
}: {
  reportId: string;
  snapshots: ReportEvidenceSnapshot[];
}) {
  return (
    <>
      {snapshots.map((snapshot, index) => (
        <EvidenceSnapshotBlock
          key={`${snapshot.kind}-${index}`}
          reportId={reportId}
          snapshot={snapshot}
        />
      ))}
    </>
  );
}

function EvidenceSnapshotBlock({
  reportId,
  snapshot,
}: {
  reportId: string;
  snapshot: ReportEvidenceSnapshot;
}) {
  switch (snapshot.kind) {
    case "message":
      return (
        <ReportedMessageEvidence
          reportId={reportId}
          message={snapshot.message}
        />
      );
    case "group":
      return <ReportedGroupEvidence group={snapshot.group} />;
  }
}

const ATTACHMENT_KINDS = new Set(["gif", "image", "document"]);

const KIND_LABEL_KEY: Record<string, string> = {
  user: "admin:moderation.reportDrawer.messageEvidence.kindText",
  image: "admin:moderation.reportDrawer.conversationContext.photoLabel",
  gif: "admin:moderation.reportDrawer.conversationContext.gifLabel",
  document: "admin:moderation.reportDrawer.conversationContext.documentLabel",
};

/** The reported message as it stood when the report was filed. */
function ReportedMessageEvidence({
  reportId,
  message,
}: {
  reportId: string;
  message: ReportedMessageSnapshot;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const isAttachmentMessage = ATTACHMENT_KINDS.has(message.kind ?? "");
  const kindLabelKey = KIND_LABEL_KEY[message.kind ?? "user"];
  const formatMoment = (iso: string) => {
    const moment = new Date(iso);
    return `${format.date(moment)} ${format.time(moment)}`;
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionLabel}>
        {t("admin:moderation.reportDrawer.messageEvidence.title")}
      </h3>

      {/* An attachment message's body is only the send-time fallback word
          ("Photo"), so the attachment block speaks for it instead. */}
      {!isAttachmentMessage &&
        (message.body ? (
          <blockquote className={styles.evidenceQuote}>
            {message.body}
          </blockquote>
        ) : (
          <p className={styles.contextBodyMuted}>
            {t("admin:moderation.reportDrawer.messageEvidence.noBody")}
          </p>
        ))}

      {message.attachment && (
        <ReportedMessageAttachment
          reportId={reportId}
          kind={message.kind}
          attachment={message.attachment}
        />
      )}

      <dl className={styles.evidenceFacts}>
        <div className={styles.evidenceFact}>
          <dt>
            {t("admin:moderation.reportDrawer.messageEvidence.sentLabel")}
          </dt>
          <dd>{formatMoment(message.sentAt)}</dd>
        </div>
        {message.capturedAt && (
          <div className={styles.evidenceFact}>
            <dt>
              {t("admin:moderation.reportDrawer.messageEvidence.capturedLabel")}
            </dt>
            <dd>{formatMoment(message.capturedAt)}</dd>
          </div>
        )}
        {kindLabelKey && (
          <div className={styles.evidenceFact}>
            <dt>
              {t("admin:moderation.reportDrawer.messageEvidence.kindLabel")}
            </dt>
            <dd>{t(kindLabelKey)}</dd>
          </div>
        )}
      </dl>

      {message.editedAt && (
        <p className={styles.evidenceNote}>
          <FiInfo aria-hidden />
          {t("admin:moderation.reportDrawer.messageEvidence.editedNote")}
        </p>
      )}
      {message.wasDeletedWhenReported && (
        <p className={styles.evidenceNote}>
          <FiInfo aria-hidden />
          {t(
            "admin:moderation.reportDrawer.messageEvidence.deletedWhenReported",
          )}
        </p>
      )}
    </section>
  );
}

/**
 * The reported message's file, through the staff-only
 * `GET /mod/report-message-attachment/<reportId>`, which resolves the file from
 * the REPORT (never a key from the page) and works for an unsent message while
 * its evidence hold lasts. Built from the API origin with no `/v1`, like the
 * photo evidence route. A GIF from the external picker has no stored file, so
 * it is described rather than fetched.
 */
function ReportedMessageAttachment({
  reportId,
  kind,
  attachment,
}: {
  reportId: string;
  kind: string | null;
  attachment: NonNullable<ReportedMessageSnapshot["attachment"]>;
}) {
  const { t } = useTranslation();
  const [isRevealed, setIsRevealed] = useState(false);
  const [loadState, setLoadState] = useState<
    "loading" | "loaded" | "unavailable"
  >("loading");
  const fileSource = `${API_BASE_URL}/mod/report-message-attachment/${reportId}`;
  const isImage =
    kind === "image" || (attachment.mimeType?.startsWith("image/") ?? false);
  const label =
    attachment.fileName ??
    t(
      KIND_LABEL_KEY[kind ?? ""] ??
        "admin:moderation.reportDrawer.conversationContext.documentLabel",
    );
  const meta = [
    attachment.mimeType,
    attachment.sizeBytes !== null ? formatBytes(attachment.sizeBytes) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  if (!attachment.hasStoredFile) {
    return (
      <p className={styles.attachmentLine}>
        {isImage ? <FiImage aria-hidden /> : <FiFileText aria-hidden />}
        <span>{label}</span>
        {meta && <span className={styles.attachmentMeta}>{meta}</span>}
      </p>
    );
  }

  // Closed by default, like the conversation context beside it. Fetching the
  // file writes a `report_message_attachment_viewed` row to this report's
  // action history, so it happens on a click the moderator chooses to make.
  // Rendering the <img> straight away opened somebody's unsent private image on
  // every drawer open and recorded a view nobody had asked for.
  if (!isRevealed) {
    return (
      <div className={styles.contextGate}>
        <Button variant="ghost" onClick={() => setIsRevealed(true)}>
          {isImage ? <FiImage aria-hidden /> : <FiFileText aria-hidden />}{" "}
          {t("admin:moderation.reportDrawer.messageEvidence.openFileCta")}
        </Button>
        <p className={styles.attachmentLine}>
          <span>{label}</span>
          {meta && <span className={styles.attachmentMeta}>{meta}</span>}
        </p>
        <p className={styles.evidenceNote}>
          <FiShield aria-hidden />
          {t("admin:moderation.reportDrawer.messageEvidence.fileAuditNotice")}
        </p>
      </div>
    );
  }

  if (!isImage) {
    return (
      <a
        className={styles.documentLink}
        href={fileSource}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FiFileText aria-hidden />
        <span>{label}</span>
        {meta && <span className={styles.attachmentMeta}>{meta}</span>}
        <FiExternalLink aria-hidden />
      </a>
    );
  }

  if (loadState === "unavailable") {
    return (
      <p className={photoStyles.unavailable}>
        <FiSlash aria-hidden />
        <span>
          {t(
            "admin:moderation.reportDrawer.messageEvidence.attachmentUnavailable",
          )}
        </span>
      </p>
    );
  }

  return (
    <>
      <div className={photoStyles.frame}>
        {loadState === "loading" && (
          <span className={photoStyles.placeholder} aria-hidden>
            <FiImage />
          </span>
        )}
        {/* Names what the image IS, never what is in it (see
            AdminReportPhotoEvidence for why). */}
        <img
          className={photoStyles.image}
          src={fileSource}
          alt={t("admin:moderation.reportDrawer.messageEvidence.imageAlt")}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoadState("loaded")}
          onError={() => setLoadState("unavailable")}
        />
      </div>
      <a
        className={photoStyles.fullSizeLink}
        href={fileSource}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("admin:moderation.reportDrawer.photoEvidence.fullSizeCta")}
        <FiExternalLink aria-hidden />
      </a>
    </>
  );
}
