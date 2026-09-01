import { useCallback, useMemo, useState } from "react";
import {
  buildUpdateJobDto,
  isEmptyUpdate,
  jobFormatNeedsCity,
  jobFormatShowsTimezone,
  type JobEditDraft,
} from "./api/jobOwner.adapters";
import type { UpdateJobDto } from "./api/jobs.api";

/** Contact methods that make another field mandatory (`CONTACT_METHODS`). */
const EMAIL_CONTACT = "Email";
const LINK_CONTACT = "External link";

/** The backend caps title at 200 and the card blurb at 10000. */
const TITLE_MAX = 200;
const DESCRIPTION_MAX = 10000;

export type JobEditToggleKey = "benefits" | "inclusivity" | "tags" | "contacts";

/** Per-field catalog keys, so the page renders them through `t()`. */
export interface JobEditErrors {
  title?: string;
  description?: string;
  city?: string;
  rateMax?: string;
  email?: string;
  link?: string;
}

export interface EditJobForm {
  draft: JobEditDraft;
  patch: (partial: Partial<JobEditDraft>) => void;
  toggleIn: (key: JobEditToggleKey, value: string) => void;
  setScreeningQuestion: (index: number, value: string) => void;
  addScreeningQuestion: () => void;
  removeScreeningQuestion: (index: number) => void;
  errors: JobEditErrors;
  isValid: boolean;
  /** False when the diff is empty, so "Save" never sends an empty PATCH. */
  hasChanges: boolean;
  needsCity: boolean;
  showsTimezone: boolean;
  buildBody: () => UpdateJobDto;
}

/** Same ceiling the composer applies, so an edit cannot grow past it. */
export const MAX_SCREENING_QUESTIONS = 3;

/**
 * Form state for the poster's edit form (PRD-44).
 *
 * It holds the loaded draft as `original` and never mutates it, because the
 * PATCH body is a diff: an untouched control sends nothing at all, which is
 * what keeps a field the form could not faithfully render (a free-text
 * deadline, a demo prefill with no pay split) from being wiped on save.
 */
export function useEditJobForm(initial: JobEditDraft): EditJobForm {
  const [original] = useState<JobEditDraft>(initial);
  const [draft, setDraft] = useState<JobEditDraft>(initial);

  const patch = useCallback((partial: Partial<JobEditDraft>) => {
    setDraft((previous) => ({ ...previous, ...partial }));
  }, []);

  const toggleIn = useCallback((key: JobEditToggleKey, value: string) => {
    setDraft((previous) => {
      const current = previous[key];
      return {
        ...previous,
        [key]: current.includes(value)
          ? current.filter((entry) => entry !== value)
          : [...current, value],
      };
    });
  }, []);

  const setScreeningQuestion = useCallback((index: number, value: string) => {
    setDraft((previous) => ({
      ...previous,
      screening: previous.screening.map((question, questionIndex) =>
        questionIndex === index ? value : question,
      ),
    }));
  }, []);

  const addScreeningQuestion = useCallback(() => {
    setDraft((previous) =>
      previous.screening.length >= MAX_SCREENING_QUESTIONS
        ? previous
        : { ...previous, screening: [...previous.screening, ""] },
    );
  }, []);

  const removeScreeningQuestion = useCallback((index: number) => {
    setDraft((previous) => ({
      ...previous,
      screening: previous.screening.filter(
        (_question, questionIndex) => questionIndex !== index,
      ),
    }));
  }, []);

  const needsCity = jobFormatNeedsCity(draft.format);
  const showsTimezone = jobFormatShowsTimezone(draft.format);

  const errors = useMemo<JobEditErrors>(() => {
    const found: JobEditErrors = {};
    if (!draft.title.trim()) {
      found.title = "economy:editJob.error.titleRequired";
    } else if (draft.title.trim().length > TITLE_MAX) {
      found.title = "economy:editJob.error.titleTooLong";
    }
    if (!draft.description.trim()) {
      found.description = "economy:editJob.error.descriptionRequired";
    } else if (draft.description.trim().length > DESCRIPTION_MAX) {
      found.description = "economy:editJob.error.descriptionTooLong";
    }
    if (needsCity && !draft.city.trim()) {
      found.city = "economy:editJob.error.cityRequired";
    }
    const rateMin = Number(draft.rateMin);
    const rateMax = Number(draft.rateMax);
    if (
      draft.rateMin.trim() &&
      draft.rateMax.trim() &&
      Number.isFinite(rateMin) &&
      Number.isFinite(rateMax) &&
      rateMax < rateMin
    ) {
      found.rateMax = "economy:editJob.error.rateRange";
    }
    if (draft.contacts.includes(EMAIL_CONTACT) && !draft.email.trim()) {
      found.email = "economy:editJob.error.emailRequired";
    }
    if (draft.contacts.includes(LINK_CONTACT) && !draft.link.trim()) {
      found.link = "economy:editJob.error.linkRequired";
    }
    return found;
  }, [draft, needsCity]);

  const buildBody = useCallback(
    () => buildUpdateJobDto(original, draft),
    [original, draft],
  );

  const hasChanges = useMemo(
    () => !isEmptyUpdate(buildUpdateJobDto(original, draft)),
    [original, draft],
  );

  return {
    draft,
    patch,
    toggleIn,
    setScreeningQuestion,
    addScreeningQuestion,
    removeScreeningQuestion,
    errors,
    isValid: Object.keys(errors).length === 0,
    hasChanges,
    needsCity,
    showsTimezone,
    buildBody,
  };
}
