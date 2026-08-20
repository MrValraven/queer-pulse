import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { monthDate } from "./trustGraph/trustGraphModel";

/** Caps `RestrictMemberDto`-style — mirrors the backend `CiteMemberDto`'s
 *  `@MaxLength(1000)`. */
const NOTE_MAX_LENGTH = 1000;

interface Props {
  /** The member the graph modal is centered on. */
  focusId: string;
  /** The SELECTED person the citation is filed against — not necessarily
   *  `focusId` (an admin can select any neighbour in the inspector and cite
   *  them directly). */
  personId: string;
  onClose: () => void;
  onCite: (personId: string, note: string) => void;
  citing: boolean;
}

/**
 * ADM-9: the graph inspector's real "Cite" action — attaches a free-text
 * evidence note to the SELECTED person's moderation audit trail, prefilled
 * with a summary of the vouch edge between them and the focus person (when
 * one exists) that the admin can edit before submitting. Built on the shared
 * `ConfirmDialog` rather than a bespoke modal — this is a single editable
 * field, not a multi-step flow.
 */
export function VouchGraphCiteDialog({
  focusId,
  personId,
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

  // `citingId` (this dialog's `personId`) only ever goes null → id → null in
  // the parent, so this component mounts fresh per citation — a plain
  // `useState` initializer (React only calls it once, on mount) is enough to
  // seed the editable note without a `useMemo`/dependency-array dance.
  const defaultNote =
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
