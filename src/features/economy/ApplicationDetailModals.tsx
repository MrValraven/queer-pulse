import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import type { Application } from "./applicationStatus.types";
import { ModalShell, FileIcon } from "./ModalKit";
import { downloadBlob } from "../../shared/lib/downloadBlob";
import styles from "./ApplicationModals.module.css";

/** Simulate downloading an attachment by generating a small placeholder file. */
function downloadAttachment(
  fileName: string,
  app: Application,
  fmt: Formatters,
) {
  const body = [
    `QueerPulse — application attachment (preview copy)`,
    ``,
    `File: ${fileName}`,
    `Application: ${app.title} — ${app.companyName}`,
    `Generated: ${fmt.date(new Date(), { day: "2-digit", month: "2-digit", year: "numeric" })} ${fmt.time(new Date())}`,
    ``,
    `This is a simulated download from the QueerPulse prototype. In a live`,
    `product this would be the real file you submitted with your application.`,
  ].join("\n");
  // Keep the original extension where there is one, else default to .txt.
  const filename = /\.[a-z0-9]+$/i.test(fileName) ? fileName : `${fileName}.txt`;
  downloadBlob(filename, body, "text/plain");
}

/** Read-only view of what was submitted for an application. */
export function SubmissionModal({
  app,
  onClose,
}: {
  app: Application;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const s = app.submission;
  return (
    <ModalShell onClose={onClose}>
      <div className={styles.eyebrow}>
        {t("economy:applicationStatus.submission.eyebrow")}
      </div>
      <h2 className={styles.title}>
        {app.title} <em>— {app.companyName}</em>
      </h2>
      <p className={styles.sub}>{s?.date}</p>

      {s && (
        <>
          <div className={styles.quote}>“{s.coverLetter}”</div>

          <div className={styles.eyebrow} style={{ marginTop: 22 }}>
            {t("economy:applicationStatus.submission.attachments")}
          </div>
          {s.attachments.map((file) => (
            <button
              key={file}
              type="button"
              className={styles.attach}
              onClick={() => downloadAttachment(file, app, fmt)}
            >
              <FileIcon />
              {file}
            </button>
          ))}

          {s.answers.length > 0 && (
            <div className={styles.panel} style={{ marginTop: 18 }}>
              <div className={styles.rows}>
                {s.answers.map((a) => (
                  <div key={a.q} className={styles.row}>
                    <span className={styles.rowK}>{a.q}</span>
                    <span className={styles.rowV}>{a.a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className={`${styles.foot} ${styles.footEnd}`}>
        <Button size="lg" variant="ghost" onClick={onClose}>
          {t("economy:applicationStatus.close")}
        </Button>
      </div>
    </ModalShell>
  );
}

/** Snapshot of the company behind an application. */
export function CompanyModal({
  app,
  onClose,
}: {
  app: Application;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const c = app.companyInfo;
  return (
    <ModalShell onClose={onClose}>
      <div className={styles.eyebrow}>
        {t("economy:applicationStatus.company.eyebrow")}
      </div>
      <h2 className={styles.title}>{app.companyName}</h2>
      <p className={styles.sub}>{c?.about}</p>

      {c && (
        <>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statN}>{c.size.split(" ")[0]}</div>
              <div className={styles.statL}>
                {t("economy:applicationStatus.company.statPeople")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>{c.verified}</div>
              <div className={styles.statL}>
                {t("economy:applicationStatus.company.statVerified")}
              </div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>4d</div>
              <div className={styles.statL}>
                {t("economy:applicationStatus.company.statWeekPilot")}
              </div>
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowK}>
                  {t("economy:applicationStatus.company.sector")}
                </span>
                <span className={styles.rowV}>{c.sector}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowK}>
                  {t("economy:applicationStatus.company.based")}
                </span>
                <span className={styles.rowV}>{c.location}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.foot}>
        <Button variant="ghost" to={routes.directory} onClick={onClose}>
          {t("economy:applicationStatus.company.viewDirectory")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <Button size="lg" onClick={onClose}>
          {t("economy:applicationStatus.close")}
        </Button>
      </div>
    </ModalShell>
  );
}

/** The note a company left when closing an application — plum reading panel. */
export function NoteModal({
  app,
  onClose,
}: {
  app: Application;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const n = app.note;
  const fromLabel = t("economy:applicationStatus.note.from", {
    company: app.companyName,
  });
  return (
    <ModalShell onClose={onClose} ariaLabel={fromLabel} className={styles.readModal}>
      <div className={styles.readEyebrow}>{fromLabel}</div>
      <p className={styles.readBody}>“{n?.body}”</p>
      <div className={styles.readFrom}>— {n?.from}</div>
      <div className={styles.readFoot}>
        <Button size="lg" variant="ghost-dark" onClick={onClose}>
          {t("economy:applicationStatus.close")}
        </Button>
      </div>
    </ModalShell>
  );
}
