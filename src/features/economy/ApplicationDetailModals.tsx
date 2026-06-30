import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import type { Application } from "./applicationStatus.data";
import { ModalShell, FileIcon } from "./ModalKit";
import styles from "./ApplicationModals.module.css";

/** Simulate downloading an attachment by generating a small placeholder file. */
function downloadAttachment(fileName: string, app: Application) {
  const body = [
    `QueerPulse — application attachment (preview copy)`,
    ``,
    `File: ${fileName}`,
    `Application: ${app.title} — ${app.companyName}`,
    `Generated: ${new Date().toLocaleString()}`,
    ``,
    `This is a simulated download from the QueerPulse prototype. In a live`,
    `product this would be the real file you submitted with your application.`,
  ].join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  // Keep the original extension where there is one, else default to .txt.
  a.download = /\.[a-z0-9]+$/i.test(fileName) ? fileName : `${fileName}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Read-only view of what was submitted for an application. */
export function SubmissionModal({
  app,
  onClose,
}: {
  app: Application;
  onClose: () => void;
}) {
  const s = app.submission;
  return (
    <ModalShell onClose={onClose}>
      <div className={styles.eyebrow}>Your submission</div>
      <h2 className={styles.title}>
        {app.title} <em>— {app.companyName}</em>
      </h2>
      <p className={styles.sub}>{s?.date}</p>

      {s && (
        <>
          <div className={styles.quote}>“{s.coverLetter}”</div>

          <div className={styles.eyebrow} style={{ marginTop: 22 }}>
            Attachments
          </div>
          {s.attachments.map((file) => (
            <button
              key={file}
              type="button"
              className={styles.attach}
              onClick={() => downloadAttachment(file, app)}
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
          Close
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
  const c = app.companyInfo;
  return (
    <ModalShell onClose={onClose}>
      <div className={styles.eyebrow}>The company</div>
      <h2 className={styles.title}>{app.companyName}</h2>
      <p className={styles.sub}>{c?.about}</p>

      {c && (
        <>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statN}>{c.size.split(" ")[0]}</div>
              <div className={styles.statL}>People</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>{c.verified}</div>
              <div className={styles.statL}>Verified by members</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statN}>4d</div>
              <div className={styles.statL}>Week pilot</div>
            </div>
          </div>
          <div className={styles.panel}>
            <div className={styles.rows}>
              <div className={styles.row}>
                <span className={styles.rowK}>Sector</span>
                <span className={styles.rowV}>{c.sector}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowK}>Based</span>
                <span className={styles.rowV}>{c.location}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.foot}>
        <Button variant="ghost" to={routes.directory} onClick={onClose}>
          View in directory →
        </Button>
        <Button size="lg" onClick={onClose}>
          Close
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
  useScrollLock();
  const n = app.note;
  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`${styles.modal} ${styles.readModal}`}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.readEyebrow}>A note from {app.companyName}</div>
        <p className={styles.readBody}>“{n?.body}”</p>
        <div className={styles.readFrom}>— {n?.from}</div>
        <div className={styles.readFoot}>
          <Button size="lg" variant="ghost-dark" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
