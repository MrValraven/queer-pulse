import { useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  FormField,
} from "../../../../shared/components/ui";
import type { TFunction } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { PitchStatus } from "../../api/pieces.api";
import type { WriterPitchDto } from "../../api/writerWorkspace.api";
import { deskDateText } from "../../magazineFormat";
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

/**
 * Translated label per `magazine_pitch.status`, which is what live mode sends
 * on `WriterPitchDto.status`. The wire also carries `state`, the same outcome
 * as an English sentence composed on the server, so a Portuguese reader used
 * to read "Held for consideration" on their own pitch.
 */
const PITCH_STATUS_LABEL_KEYS: Record<PitchStatus, string> = {
  waiting: "magazine:writer.pitches.state.waiting",
  maybe: "magazine:writer.pitches.state.maybe",
  passed: "magazine:writer.pitches.state.passed",
  commissioned: "magazine:writer.pitches.state.commissioned",
};

/**
 * How a pitch landed, in the reader's language.
 *
 * A pass can carry the editor's own note, and the server used to weld the two
 * together ("Passed: not now, pitch again in 16"). The platform's half is a
 * catalog string and the editor's half is authored text, so they are composed
 * here instead: the note goes through `{note}` interpolation verbatim, never
 * rewritten, truncated or looked up. Interpolation substitutes into the
 * template in a single pass, so braces inside a note stay literal, and React
 * escapes the result like any other text node.
 *
 * `state` remains the fallback for a row this build cannot classify.
 */
function pitchStateLabel(pitch: WriterPitchDto, t: TFunction): string {
  const statusLabelKey: string | undefined =
    PITCH_STATUS_LABEL_KEYS[pitch.status];
  if (!statusLabelKey) {
    return pitch.state;
  }
  if (pitch.status === "passed" && pitch.passNote) {
    return t("magazine:writer.pitches.state.passedWithNote", {
      note: pitch.passNote,
    });
  }
  return t(statusLabelKey);
}

/** Your pitches: what's been sent and how it landed, plus a form to pitch
 *  something new (`POST /magazine/writer/pitches`, `submitterId` = you). */
export function WriterPitchesTab({
  pitches,
  onSubmitPitch,
  isSubmitting,
}: WriterPitchesTabProps) {
  const { t, language } = useTranslation();
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
              <Badge tone={TONE_TO_BADGE[pitch.tone]}>
                {pitchStateLabel(pitch, t)}
              </Badge>
            </div>
            <p className={pieceStyles.tiny}>
              {t("magazine:writer.pitches.sentMeta", {
                sent: deskDateText(pitch.sent, language),
              })}
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
          <Button
            size="sm"
            variant="primary"
            disabled={!canSend || isSubmitting}
            onClick={handleSend}
          >
            {t("magazine:writer.pitches.send")}
          </Button>
        </div>
      </div>
    </div>
  );
}
