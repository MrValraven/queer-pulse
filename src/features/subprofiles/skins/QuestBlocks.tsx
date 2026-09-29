import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  SAFETY_TOOLS,
  SAFETY_TOOL_LABEL_KEY,
  TABLE_FORMATS,
  TABLE_FORMAT_LABEL_KEY,
  TABLE_VIBES,
  TABLE_VIBE_LABEL_KEY,
  knownOptions,
} from "../questTable.data";
import { SkinDefList } from "./SkinDefList";
import type { SkinExtrasPersona } from "../SubprofileSkinExtras";

/** A stored free-text field, trimmed. `skinData` has no server schema, so a
 *  value that is not a string reads as blank. */
const trimmedText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/** Quest `afterBio` slot: how the table runs (`skinData.atTheTable`), read
 *  like the rules box on a character sheet. Every list goes through the fixed
 *  vocabularies, so an unknown stored value is skipped. `null` when nothing
 *  known is set, so a cosplayer who never fills it in shows no empty box. */
export function AtTheTableBlock({ persona }: { persona: SkinExtrasPersona }) {
  const { t } = useTranslation();
  const headingId = useId();
  const block = persona.skinData?.atTheTable;
  if (!block || typeof block !== "object") return null;

  const format = TABLE_FORMATS.find((value) => value === block.format);
  const vibes = knownOptions(block.vibe, TABLE_VIBES);
  const safetyTools = knownOptions(block.safetyTools, SAFETY_TOOLS);
  const systems = Array.isArray(block.systems)
    ? block.systems.map(trimmedText).filter(Boolean)
    : [];
  const note = trimmedText(block.note);

  const rows = (
    [
      [
        t("subprofiles:skinExtras.quest.format"),
        format ? t(TABLE_FORMAT_LABEL_KEY[format]) : "",
      ],
      [t("subprofiles:skinExtras.quest.where"), trimmedText(block.where)],
      [t("subprofiles:skinExtras.quest.systems"), systems.join(", ")],
      [t("subprofiles:skinExtras.quest.price"), trimmedText(block.price)],
    ] as Array<[string, string]>
  ).filter(([, value]) => Boolean(value));

  const hasContent =
    rows.length > 0 ||
    vibes.length > 0 ||
    safetyTools.length > 0 ||
    Boolean(note);
  if (!hasContent) return null;

  return (
    <section className="quest-table" aria-labelledby={headingId}>
      <h2 id={headingId} className="quest-table-title">
        {t("subprofiles:skinExtras.quest.title")}
      </h2>
      {vibes.length > 0 && (
        <ul className="quest-vibe">
          {vibes.map((vibe) => (
            <li key={vibe}>{t(TABLE_VIBE_LABEL_KEY[vibe])}</li>
          ))}
        </ul>
      )}
      {rows.length > 0 && <SkinDefList rows={rows} />}
      {safetyTools.length > 0 && (
        <div className="quest-safety">
          <h3>{t("subprofiles:skinExtras.quest.safetyTitle")}</h3>
          <ul>
            {safetyTools.map((tool) => (
              <li key={tool}>
                <FiCheck aria-hidden />
                {t(SAFETY_TOOL_LABEL_KEY[tool])}
              </li>
            ))}
          </ul>
        </div>
      )}
      {note ? <p className="quest-note">{note}</p> : null}
    </section>
  );
}
