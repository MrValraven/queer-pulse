import { useState } from "react";
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
  isUnsaved: boolean;
  /** The save body's template part; null outside a template. */
  fieldsToSave: QuizshowTemplateFields | null;
  resetTo: (response: QuizshowQuizResponse | null) => void;
}

const BLANK_FIELDS: QuizshowTemplateFields = {
  card: {
    title: { en: "", pt: "" },
    description: { en: "", pt: "" },
  },
  staffNotes: "",
};

function savedFieldsOf(response: QuizshowQuizResponse): QuizshowTemplateFields {
  const meta = templateMetaOf(response);
  if (meta === null) return BLANK_FIELDS;
  return { card: meta.card, staffNotes: meta.staffNotes };
}

function isSameText(first: QuizshowText, second: QuizshowText): boolean {
  return first.en === second.en && first.pt === second.pt;
}

function isSameFields(
  first: QuizshowTemplateFields,
  second: QuizshowTemplateFields,
): boolean {
  return (
    isSameText(first.card.title, second.card.title) &&
    isSameText(first.card.description, second.card.description) &&
    first.staffNotes === second.staffNotes
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
    isUnsaved: isTemplate && !isSameFields(draft, savedFields),
    fieldsToSave: isTemplate ? draft : null,
    resetTo: (response) => {
      const resetFields = savedFieldsOf(response ?? data);
      setFieldsState({ draft: resetFields, baseline: resetFields });
    },
  };
}
