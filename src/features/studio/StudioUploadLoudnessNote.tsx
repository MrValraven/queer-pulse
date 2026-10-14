import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Warn } from "./StudioUploadIcons";
import type { LoudnessNote } from "./upload/studioLoudnessNotes";
import s from "./creator.module.css";
import tracksStyles from "./StudioUploadTracks.module.css";

const ONE_DECIMAL = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

/** A leading hyphen-minus becomes the true minus sign (U+2212). */
const withTrueMinus = (formatted: string) => formatted.replace(/^-/, "\u2212");

/** The loudness check (spec 8.3): informational; publishing stays open. */
export function StudioUploadLoudnessNote({
  notes,
}: {
  notes: readonly LoudnessNote[];
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  return (
    <Collapse isOpen={notes.length > 0}>
      <div className={s.warnCard} role="note">
        <Warn />
        <div>
          <strong>{t("studio:upload.loudness.heading")}</strong>
          <ul className={tracksStyles.loudList}>
            {notes.map((note) => (
              <li key={note.trackNumber}>
                {note.kind === "loud"
                  ? t("studio:upload.loudness.loudNote", {
                      number: note.trackNumber,
                      lufs: withTrueMinus(
                        formatters.number(note.loudnessLufs, ONE_DECIMAL),
                      ),
                    })
                  : t("studio:upload.loudness.peakNote", {
                      number: note.trackNumber,
                      peak: withTrueMinus(
                        formatters.number(note.peakDb, ONE_DECIMAL),
                      ),
                    })}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className={tracksStyles.loudToggle}
            aria-expanded={isExplainerOpen}
            onClick={() => setIsExplainerOpen((wasOpen) => !wasOpen)}
          >
            {t("studio:upload.loudness.explainerToggle")}{" "}
            {isExplainerOpen ? (
              <FiChevronUp aria-hidden />
            ) : (
              <FiChevronDown aria-hidden />
            )}
          </button>
          <Collapse isOpen={isExplainerOpen}>
            <div className={s.loudExplainer}>
              <Translation
                i18nKey="studio:upload.loudness.explainer"
                components={{ em: <em /> }}
              />
            </div>
          </Collapse>
        </div>
      </div>
    </Collapse>
  );
}
