import { useEffect, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { UPLOAD_SPLITS } from "./studioUpload.data";
import type { Collaborator } from "./studioUpload.types";
import s from "./creator.module.css";

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
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label -- data cell, not an interactive control; the collaborator name/handle text (row.name/subtitle) is the cell's content, nested one level past the rule's static depth limit. */}
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
