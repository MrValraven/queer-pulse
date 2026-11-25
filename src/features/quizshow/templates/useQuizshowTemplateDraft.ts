import { useMemo, useState } from "react";
import type {
  QuizshowQuizResponse,
  QuizshowTemplateCardText,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  templateMetaOf,
  type QuizshowTemplateFields,
} from "./quizshowTemplateResponse";

export interface QuizshowTemplateDraft {
  card: QuizshowTemplateCardText;
  staffNotes: string;
  setCardTitle: (title: QuizshowText) => void;
  setCardDescription: (description: QuizshowText) => void;
  setStaffNotes: (staffNotes: string) => void;
  /** Additive. The staff's "What changed" note for the latest publish (C6.25), as typed. */
  changeNote: QuizshowText;
  /** Additive. */
  setChangeNote: (changeNote: QuizshowText) => void;
  isUnsaved: boolean;
  /** The save body's template part, the change note trimmed (C2.5); null outside a template. */
  fieldsToSave: QuizshowTemplateFields | null;
  resetTo: (response: QuizshowQuizResponse | null) => void;
  /**
   * Additive. A save answered while the host kept typing: only the baseline
   * moves to the saved card and notes, so the newer edits stay in the draft
   * and the next save sends them.
   */
  rebaseTo: (response: QuizshowQuizResponse) => void;
}

const BLANK_FIELDS: QuizshowTemplateFields = {
  card: {
    title: { en: "", pt: "" },
    description: { en: "", pt: "" },
  },
  staffNotes: "",
  changeNote: { en: "", pt: "" },
};

function savedFieldsOf(response: QuizshowQuizResponse): QuizshowTemplateFields {
  const meta = templateMetaOf(response);
  if (meta === null) return BLANK_FIELDS;
  return {
    card: meta.card,
    staffNotes: meta.staffNotes,
    changeNote: meta.changeNote,
  };
}

function isSameText(first: QuizshowText, second: QuizshowText): boolean {
  return first.en === second.en && first.pt === second.pt;
}

/** The change note as a save sends it: each language trimmed, as the server stores it. */
function trimmedNoteOf(changeNote: QuizshowText): QuizshowText {
  return { en: changeNote.en.trim(), pt: changeNote.pt.trim() };
}

function isSameFields(
  first: QuizshowTemplateFields,
  second: QuizshowTemplateFields,
): boolean {
  return (
    isSameText(first.card.title, second.card.title) &&
    isSameText(first.card.description, second.card.description) &&
    first.staffNotes === second.staffNotes &&
    // Compared trimmed: the server trims the note, so a space typed at its
    // end stays out of the unsaved check.
    isSameText(
      trimmedNoteOf(first.changeNote),
      trimmedNoteOf(second.changeNote),
    )
  );
}

/** Starts at the saved card and notes; a newer saved meta replaces a clean draft (the useQuizshowAdultsDraft pattern). */
export function useQuizshowTemplateDraft(options: {
  data: QuizshowQuizResponse;
}): QuizshowTemplateDraft {
  const { data } = options;
  const isTemplate = templateMetaOf(data) !== null;
  const savedFields = savedFieldsOf(data);
  // `baseline` is the saved card and notes the draft last started from.
  const [fieldsState, setFieldsState] = useState({
    draft: savedFields,
    baseline: savedFields,
  });
  // A newer saved card (another tab, or a publish that refetched) replaces a
  // clean draft, the way useQuizshowDraft adopts a newer quiz; an edited
  // draft stays. Compared by content, so a refetch of the same card is a no-op.
  if (
    !isSameFields(savedFields, fieldsState.baseline) &&
    isSameFields(fieldsState.draft, fieldsState.baseline)
  ) {
    setFieldsState({ draft: savedFields, baseline: savedFields });
  }
  const { draft } = fieldsState;
  // One object per draft, so the studio's edit key moves only on an edit.
  const fieldsToSave = useMemo<QuizshowTemplateFields | null>(
    () =>
      isTemplate
        ? { ...draft, changeNote: trimmedNoteOf(draft.changeNote) }
        : null,
    [isTemplate, draft],
  );

  function updateDraft(
    change: (current: QuizshowTemplateFields) => QuizshowTemplateFields,
  ): void {
    setFieldsState((current) => ({ ...current, draft: change(current.draft) }));
  }

  return {
    card: draft.card,
    staffNotes: draft.staffNotes,
    setCardTitle: (title) => {
      updateDraft((current) => ({
        ...current,
        card: { ...current.card, title },
      }));
    },
    setCardDescription: (description) => {
      updateDraft((current) => ({
        ...current,
        card: { ...current.card, description },
      }));
    },
    setStaffNotes: (staffNotes) => {
      updateDraft((current) => ({ ...current, staffNotes }));
    },
    changeNote: draft.changeNote,
    setChangeNote: (changeNote) => {
      updateDraft((current) => ({ ...current, changeNote }));
    },
    isUnsaved: isTemplate && !isSameFields(draft, savedFields),
    fieldsToSave,
    resetTo: (response) => {
      const resetFields = savedFieldsOf(response ?? data);
      setFieldsState({ draft: resetFields, baseline: resetFields });
    },
    rebaseTo: (response) => {
      const rebasedFields = savedFieldsOf(response);
      setFieldsState((current) => ({ ...current, baseline: rebasedFields }));
    },
  };
}
