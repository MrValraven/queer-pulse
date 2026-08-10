import { useState } from "react";
import { Badge, Button, EmptyState, FormField } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterPitchDto } from "../../api/writerWorkspace.api";
import pieceStyles from "../pieceTabs.module.css";
import styles from "./writerCards.module.css";

export interface WriterPitchesTabProps {
  pitches: WriterPitchDto[];
  onSubmitPitch: (payload: { title: string; note: string }) => void;
  isSubmitting?: boolean;
}

const TONE_TO_BADGE = {
  hold: "amber",
  no: "danger",
  live: "jade",
} as const;

/** Your pitches: what's been sent and how it landed, plus a form to pitch
 *  something new (`POST /magazine/writer/pitches`, `submitterId` = you). */
export function WriterPitchesTab({ pitches, onSubmitPitch, isSubmitting }: WriterPitchesTabProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const canSend = title.trim().length > 0 && note.trim().length > 0;

  function handleSend() {
    if (!canSend) return;
    onSubmitPitch({ title: title.trim(), note: note.trim() });
    setTitle("");
    setNote("");
  }

  return (
    <div className={pieceStyles.stack}>
      {pitches.length === 0 ? (
        <EmptyState
          compact
          title={t("magazine:writer.pitches.emptyTitle")}
          description={t("magazine:writer.pitches.emptyDescription")}
        />
      ) : (
        pitches.map((pitch) => (
          <div key={pitch.id} className={pieceStyles.card}>
            <div className={styles.head}>
              <h3 className={pieceStyles.lede}>{pitch.title}</h3>
              <Badge tone={TONE_TO_BADGE[pitch.tone]}>{pitch.state}</Badge>
            </div>
            <p className={pieceStyles.tiny}>
              {t("magazine:writer.pitches.sentMeta", { sent: pitch.sent })}
            </p>
          </div>
        ))
      )}

      <div className={pieceStyles.card}>
        <h3>{t("magazine:writer.pitches.formHeading")}</h3>
        <FormField label={t("magazine:writer.pitches.titleLabel")}>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("magazine:writer.pitches.titlePlaceholder")}
          />
        </FormField>
        <FormField label={t("magazine:writer.pitches.noteLabel")}>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("magazine:writer.pitches.notePlaceholder")}
          />
        </FormField>
        <div className={pieceStyles.row}>
          <Button size="sm" variant="primary" disabled={!canSend || isSubmitting} onClick={handleSend}>
            {t("magazine:writer.pitches.send")}
          </Button>
        </div>
      </div>
    </div>
  );
}
