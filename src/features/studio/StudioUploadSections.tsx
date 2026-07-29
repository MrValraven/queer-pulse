import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiPlus, FiCheck } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  UPLOAD_FILES,
  UPLOAD_SPLITS,
  buildUploadSideInfo,
} from "./studioUpload.data";
import { routes } from "../../app/routeMap";
import s from "./creator.module.css";

interface Collaborator {
  avatar: string;
  name: string;
  subtitle: string;
  role: string;
  percent: string;
  tone?: string;
  onTrack?: string;
}

const WaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 18V5l12-2v13" />
    <circle cx={6} cy={18} r={3} />
    <circle cx={18} cy={16} r={3} />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
    <path d="M5 12l5 5 9-11" />
  </svg>
);
const Warn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </svg>
);

export function DropZone() {
  const { t } = useTranslation();
  return (
    <div className={s.dropzone}>
      <div className={s.uploadIcon}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          style={{ width: 22, height: 22 }}
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </div>
      <h3>
        <Translation
          i18nKey="studio:upload.dropzone.title"
          components={{ em: <em /> }}
        />
      </h3>
      <p>{t("studio:upload.dropzone.body")}</p>
      <p className={s.uploadTypes}>
        <Translation
          i18nKey="studio:upload.dropzone.accepts"
          components={{ em: <em style={{ color: "var(--jade-light)" }} /> }}
        />
      </p>
    </div>
  );
}

export function FileList() {
  const { t } = useTranslation();
  const [showLoud, setShowLoud] = useState(false);
  const readyCount = UPLOAD_FILES.filter((file) => file.ok).length;
  return (
    <div className={s.uploaded}>
      <h4>
        <Translation
          i18nKey="studio:upload.files.heading"
          components={{ em: <em /> }}
          values={{ readyCount, totalCount: UPLOAD_FILES.length }}
        />
      </h4>
      {UPLOAD_FILES.map((file) => (
        <div key={file.name} className={s.fileRow}>
          <span
            className={[s.fileIc, !file.ok && s.fileIcWarn]
              .filter(Boolean)
              .join(" ")}
          >
            {file.ok ? <WaveIcon /> : <Warn />}
          </span>
          <div>
            <h5>{file.name}</h5>
            <div className={s.fileMeta}>{file.meta}</div>
          </div>
          <span
            className={[s.fileCheck, !file.ok && s.fileCheckWarn]
              .filter(Boolean)
              .join(" ")}
          >
            {file.ok ? <Check /> : <Warn />}
            {file.ok
              ? t("studio:upload.files.okReady")
              : t("studio:upload.files.loudnessCheck")}
          </span>
        </div>
      ))}
      <div className={s.warnCard}>
        <Warn />
        <div>
          <strong>
            {t("studio:upload.files.loudWarning.title", { trackNumber: 4 })}
          </strong>{" "}
          <Translation
            i18nKey="studio:upload.files.loudWarning.body"
            components={{ em: <em /> }}
            values={{ measuredLoudness: "−7.8 LUFS", targetLoudness: "−14" }}
          />{" "}
          <button
            type="button"
            className={s.loudToggle}
            aria-expanded={showLoud}
            onClick={() => setShowLoud((v) => !v)}
          >
            {showLoud
              ? t("studio:upload.files.loudToggle.hide")
              : t("studio:upload.files.loudToggle.show")}
          </button>
          {showLoud && (
            <div className={s.loudExplainer}>
              <Translation
                i18nKey="studio:upload.files.loudExplainer"
                components={{ em: <em /> }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CoverArt() {
  const { t } = useTranslation();
  return (
    <div className={s.uploaded}>
      <h4>
        <Translation
          i18nKey="studio:upload.coverArt.heading"
          components={{ em: <em /> }}
          values={{ readyCount: 1, totalCount: 1 }}
        />
      </h4>
      <div className={s.fileRow}>
        <span
          className={s.fileIc}
          style={{
            background: "rgba(var(--accent-rgb),.16)",
            color: "var(--accent)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            style={{ width: 16, height: 16 }}
          >
            <rect x={3} y={3} width={18} height={18} rx={2} />
            <circle cx={9} cy={9} r={2} />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </span>
        <div>
          <h5>cidade_cover.jpg</h5>
          <div className={s.fileMeta}>
            2400 × 2400 · sRGB · 4.2 MB · no text in upper third
          </div>
        </div>
        <span className={s.fileCheck}>
          <Check />
          {t("studio:upload.files.okReady")}
        </span>
      </div>
    </div>
  );
}

export function SplitsTable({
  collaborators,
  onAdd,
}: {
  collaborators: Collaborator[];
  onAdd: (handle: string) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [handle, setHandle] = useState("");

  // The field only appears after the user asks for it, so sending focus there
  // follows their action rather than teleporting them on page load.
  const handleRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (adding) handleRef.current?.focus();
  }, [adding]);

  function submit() {
    const trimmed = handle.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    showToast(
      t("studio:upload.splits.invitedToast", { handle: trimmed }),
      "success",
    );
    setHandle("");
    setAdding(false);
  }

  const rows = [...UPLOAD_SPLITS, ...collaborators];

  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3>
          <Translation
            i18nKey="studio:upload.splits.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={s.cardSub}>{t("studio:upload.splits.sub")}</div>
      </div>
      <table className={s.splitTable}>
        <thead>
          <tr>
            <th>{t("studio:upload.splits.table.collaborator")}</th>
            <th>{t("studio:upload.splits.table.roleTracks")}</th>
            <th>{t("studio:upload.splits.table.share")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <div className={s.splitWho}>
                  <span
                    className={s.av}
                    style={
                      row.tone === "jade"
                        ? {
                            background: "rgba(var(--jade-rgb),.18)",
                            color: "var(--jade-light)",
                          }
                        : undefined
                    }
                  >
                    {row.avatar}
                  </span>
                  <span className={s.nm}>
                    {row.name}
                    <small>{row.subtitle}</small>
                  </span>
                </div>
              </td>
              <td style={{ fontStyle: "italic", fontFamily: "var(--serif)" }}>
                {row.role}
              </td>
              <td>
                <span className={s.splitPct}>
                  <em>{row.percent}</em>%
                </span>
                {row.onTrack && (
                  <small
                    style={{
                      display: "block",
                      fontFamily: "var(--serif)",
                      fontStyle: "italic",
                      fontSize: 11,
                      color: "var(--text40)",
                    }}
                  >
                    {row.onTrack}
                  </small>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={s.splitFoot}>
        <span className={s.splitTotal}>
          {t("studio:upload.splits.footer", {
            total: "100%",
          })}
        </span>
        <Button variant="ghost" onClick={() => setAdding((v) => !v)}>
          <FiPlus /> {t("studio:upload.splits.addCollaboratorCta")}
        </Button>
      </div>
      {adding && (
        <div className={s.collabForm}>
          <input
            ref={handleRef}
            aria-label={t("studio:upload.splits.handlePlaceholder")}
            placeholder={t("studio:upload.splits.handlePlaceholder")}
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <Button onClick={submit} disabled={!handle.trim()}>
            {t("studio:upload.splits.inviteCta")}
          </Button>
        </div>
      )}
    </div>
  );
}

export function UploadSidebar() {
  const { t } = useTranslation();
  const sideInfo = useMemo(() => buildUploadSideInfo(t), [t]);
  return (
    <div className={s.col}>
      {sideInfo.map((info) => (
        <div key={info.eyebrow} className={s.sideCard}>
          <div className={s.sideEb}>{info.eyebrow}</div>
          <h4>{info.title}</h4>
          <p>{info.body}</p>
          <ul className={s.sideList}>
            {info.list.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                {item.em ? <em>{item.value}</em> : item.value}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function MetadataStep({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const titleFieldId = useId();
  const yearFieldId = useId();
  const genreFieldId = useId();
  return (
    <div className={s.card}>
      <div className={s.cardH}>
        <h3>
          <Translation
            i18nKey="studio:upload.metadata.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <div className={s.cardSub}>{t("studio:upload.metadata.sub")}</div>
      </div>
      <div className={s.field}>
        <label htmlFor={titleFieldId}>
          {t("studio:upload.metadata.field.title")}
        </label>
        {/* Defaults below prefill this artist's own release — content. */}
        <input id={titleFieldId} type="text" defaultValue="Cidade dos santos" />
      </div>
      <div className={s.field}>
        <label htmlFor={yearFieldId}>
          {t("studio:upload.metadata.field.year")}
        </label>
        <input id={yearFieldId} type="text" defaultValue="2026" />
      </div>
      <div className={s.field}>
        <label htmlFor={genreFieldId}>
          {t("studio:upload.metadata.field.genre")}
        </label>
        <select
          id={genreFieldId}
          defaultValue={t("studio:upload.metadata.genre.fado")}
        >
          <option>{t("studio:upload.metadata.genre.fado")}</option>
          <option>{t("studio:upload.metadata.genre.electronic")}</option>
          <option>{t("studio:upload.metadata.genre.folk")}</option>
          <option>{t("studio:upload.metadata.genre.experimental")}</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Button variant="ghost" onClick={onBack}>
          {t("studio:upload.metadata.backCta")}
        </Button>
        <Button onClick={onSubmit}>
          {t("studio:upload.metadata.submitCta")}
        </Button>
      </div>
    </div>
  );
}

function SubmittedPanel() {
  const { t } = useTranslation();
  return (
    <div className={s.submitted}>
      <div className={s.submittedIcon}>
        <FiCheck size={26} aria-hidden />
      </div>
      <h2>
        <Translation
          i18nKey="studio:upload.submitted.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p>{t("studio:upload.submitted.body")}</p>
      <Button variant="ghost-dark" to={routes.studioPayouts}>
        {t("studio:upload.submitted.viewPayoutsCta")}
      </Button>
    </div>
  );
}

export function UploadMainCol() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [step, setStep] = useState<"files" | "metadata" | "done">("files");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  function addCollaborator(handle: string) {
    const initials =
      handle
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 2)
        .toUpperCase() || "QP";
    setCollaborators((prev) => [
      ...prev,
      {
        avatar: initials,
        name: handle,
        subtitle: t("studio:upload.splits.invitedSubLabel"),
        role: t("studio:upload.splits.invitedRole"),
        percent: "0",
        tone: "jade",
      },
    ]);
  }

  if (step === "done") {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="done">
        <SubmittedPanel />
      </div>
    );
  }

  if (step === "metadata") {
    return (
      <div className={`${s.col} ${s.screenIn}`} key="metadata">
        <MetadataStep
          onBack={() => setStep("files")}
          onSubmit={() => {
            setStep("done");
            showToast(t("studio:upload.submitted.toast"), "success");
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${s.col} ${s.screenIn}`} key="files">
      <DropZone />
      <FileList />
      <CoverArt />
      <SplitsTable collaborators={collaborators} onAdd={addCollaborator} />
      <div style={{ display: "flex", gap: 10 }}>
        <Button onClick={() => setStep("metadata")}>
          {t("studio:upload.continueToMetadataCta")}
        </Button>
      </div>
    </div>
  );
}
