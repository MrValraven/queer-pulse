import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { monthDate } from "./trustGraph/trustGraphModel";

/** Matches the backend `CiteMemberDto`'s `@MaxLength(1000)`, the same cap
 *  `RestrictMemberDto` uses. */
const NOTE_MAX_LENGTH = 1000;

interface Props {
  /** The member the graph modal is centered on. */
  focusId: string;
  /** The SELECTED person the citation is filed against. It can be any
   *  neighbour the admin selected in the inspector, so it may differ from
   *  `focusId`. */
  personId: string;
  /** The shareable link to the view on screen (buildTrustNetworkViewUrl),
   *  added to the default note. */
  viewUrl: string;
  onClose: () => void;
  onCite: (personId: string, note: string) => void;
  citing: boolean;
}

/**
 * ADM-9: the graph inspector's real "Cite" action. It attaches a free-text
 * evidence note to the SELECTED person's moderation audit trail, prefilled
 * with a summary of the vouch edge between them and the focus person (when
 * one exists) that the admin can edit before submitting. The shared
 * `ConfirmDialog` fits it well: the whole flow is one editable field.
 */
export function VouchGraphCiteDialog({
  focusId,
  personId,
  viewUrl,
  onClose,
  onCite,
  citing,
}: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const graph = useTrustGraph();
  const focusPerson = graph.peopleById[focusId]!;
  const person = graph.peopleById[personId]!;
  const edge = graph.findEdge(focusId, personId);

  // `citingId` (this dialog's `personId`) only ever goes null, then an id,
  // then null in the parent, so this component mounts fresh per citation. A
  // plain `useState` initializer (React calls it once, on mount) seeds the
  // editable note, and the note keeps the view from the moment it opened.
  const baseNote =
    edge && focusId !== personId
      ? t("admin:vouchGraph.citeDialog.defaultNoteWithEdge", {
          focusName: focusPerson.name,
          personName: person.name,
          relation: edge.mutual
            ? t("admin:vouchGraph.citeDialog.relationMutual")
            : t("admin:vouchGraph.citeDialog.relationVouched"),
          when: fmt.date(monthDate(edge.date), {
            month: "short",
            year: "numeric",
          }),
        })
      : t("admin:vouchGraph.citeDialog.defaultNoteNoEdge", {
          personName: person.name,
          when: fmt.date(new Date(), { month: "short", year: "numeric" }),
        });

  const viewLinkLine = t("admin:vouchGraph.citeDialog.viewLinkLine", {
    url: viewUrl,
  });
  const noteWithLink = `${baseNote}\n\n${viewLinkLine}`;
  const defaultNote =
    noteWithLink.length <= NOTE_MAX_LENGTH ? noteWithLink : baseNote;

  const [note, setNote] = useState(defaultNote);

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={() => onCite(personId, note.trim())}
      title={t("admin:vouchGraph.citeDialog.title", { name: person.name })}
      description={t("admin:vouchGraph.citeDialog.description")}
      confirmLabel={t("admin:vouchGraph.citeDialog.confirmCta")}
      loading={citing}
      reason={{
        value: note,
        onChange: setNote,
        label: t("admin:vouchGraph.citeDialog.noteLabel"),
        required: true,
        maxLength: NOTE_MAX_LENGTH,
      }}
    />
  );
}
