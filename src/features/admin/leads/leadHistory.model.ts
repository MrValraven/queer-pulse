import type { LeadEntryDTO, LeadStage } from "./api/leads.types";
import { LEAD_STAGE_LABEL_KEY } from "./leadLabels.data";

/** One quiet history line: its catalog key and the values it interpolates.
 *  The values hold already-translated stage labels. */
export interface LeadHistoryLine {
  key: string;
  values: Record<string, string>;
}

export const LEAD_UNKNOWN_AUTHOR_KEY = "admin:leads.history.unknownAuthor";

/**
 * The line a stage or persona entry reads. Notes return null: the note item
 * draws them. A persona entry whose persona is gone reads the "no longer
 * available" line with no persona name; an author whose account is gone, or
 * whose name is blank, reads the unknown author line. A stage line missing
 * the stage it names, and a kind this build does not know, also return null,
 * so a malformed entry never prints an empty label.
 */
export function leadHistoryLineOf(
  entry: LeadEntryDTO,
  translate: (key: string) => string,
): LeadHistoryLine | null {
  // The server sends an empty display name when the author's profile row is
  // missing, so a blank name reads the unknown author line too.
  const authorName = entry.author?.displayName.trim() ?? "";
  const author =
    authorName === "" ? translate(LEAD_UNKNOWN_AUTHOR_KEY) : authorName;
  const stageLabel = (stage: LeadStage): string =>
    translate(LEAD_STAGE_LABEL_KEY[stage]);
  switch (entry.kind) {
    case "note":
      return null;
    case "created":
      if (entry.toStage === null) return null;
      return {
        key: "admin:leads.history.created",
        values: { author, stage: stageLabel(entry.toStage) },
      };
    case "stage_changed":
      if (entry.fromStage === null || entry.toStage === null) return null;
      return {
        key: "admin:leads.history.stageChanged",
        values: {
          author,
          from: stageLabel(entry.fromStage),
          to: stageLabel(entry.toStage),
        },
      };
    case "persona_linked":
      return entry.persona === null
        ? { key: "admin:leads.history.personaGoneLinked", values: { author } }
        : {
            key: "admin:leads.history.personaLinked",
            values: { author, persona: entry.persona.displayName },
          };
    case "persona_unlinked":
      return entry.persona === null
        ? { key: "admin:leads.history.personaGoneUnlinked", values: { author } }
        : {
            key: "admin:leads.history.personaUnlinked",
            values: { author, persona: entry.persona.displayName },
          };
    default:
      // A kind a newer server sends that this build does not know yet.
      return null;
  }
}
