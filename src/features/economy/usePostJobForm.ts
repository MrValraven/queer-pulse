import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWizardForm } from "../../shared/hooks/useWizardForm";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  fieldLabelKey,
  isJobFieldId,
  professionBelongsToField,
} from "../members/workTaxonomy.data";
import type { CompanyProfile } from "./companies.data";
import {
  commitmentLabelKey,
  normalizeCommitment,
  normalizeSeniority,
} from "./jobVocabulary.data";
import type { Job } from "./jobs.data";

export interface PostJobState {
  /** Job field id (a JOB_FIELD_IDS member), or "" until chosen. */
  category: string;
  /** Profession id inside `category`, or "" for none. */
  profession: string;
  /** Commitment id (JobCommitmentId). */
  commitment: string;
  /** Seniority id (JobSeniorityId). */
  seniority: string;
  format: string;
  city: string;
  timezone: string;
  title: string;
  description: string;
  deadline: string;
  startDate: string;
  currency: string;
  rateMin: string;
  rateMax: string;
  ratePer: string;
  hidePay: boolean;
  barter: boolean;
  benefits: string[];
  inclusivity: string[];
  tags: string[];
  screening: string[];
  contacts: string[];
  email: string;
  link: string;
  agreed: boolean;
}

export const STEP_LABEL_KEYS = [
  "economy:postJob.stepLabels.type",
  "economy:postJob.stepLabels.details",
  "economy:postJob.stepLabels.pay",
  "economy:postJob.stepLabels.screening",
  "economy:postJob.stepLabels.review",
];

const DRAFT_KEY = "qp-postjob-draft";

const INITIAL: PostJobState = {
  category: "",
  profession: "",
  commitment: "freelanceGig",
  seniority: "anyLevel",
  format: "In-person (Lisbon)",
  city: "",
  timezone: "No preference",
  title: "",
  description: "",
  deadline: "",
  startDate: "",
  currency: "€",
  rateMin: "",
  rateMax: "",
  ratePer: "Month",
  hidePay: false,
  barter: false,
  benefits: [],
  inclusivity: [],
  tags: [],
  screening: [],
  contacts: ["Platform message"],
  email: "",
  link: "",
  agreed: false,
};

/**
 * Bring a stored draft up to the current shape. A draft saved before the job
 * taxonomy carries an English category label ("Design & creative") and English
 * commitment and seniority labels: the category comes back empty (the poster
 * picks a field again), the other two become ids, and a profession outside the
 * restored field is dropped.
 */
export function normalizePostJobDraft(
  raw: Partial<PostJobState> & Record<string, unknown>,
): PostJobState {
  const merged: PostJobState = { ...INITIAL, ...raw };
  const category = isJobFieldId(merged.category) ? merged.category : "";
  const profession =
    category &&
    typeof merged.profession === "string" &&
    professionBelongsToField(merged.profession, category)
      ? merged.profession
      : "";
  return {
    ...merged,
    category,
    profession,
    commitment: normalizeCommitment(String(merged.commitment ?? "")),
    seniority: normalizeSeniority(String(merged.seniority ?? "")),
  };
}

function readDraft(): PostJobState {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return INITIAL;
    return normalizePostJobDraft(
      JSON.parse(raw) as Partial<PostJobState> & Record<string, unknown>,
    );
  } catch {
    return INITIAL;
  }
}

const needsCity = (format: string) => /In-person|Hybrid/.test(format);
const showsTimezone = (format: string) => /Remote|Either|Hybrid/.test(format);

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "role"
  );
}

/** Parse the wizard's date field value (yyyy-mm-dd) into a real `Date` (local
 *  midnight, so the picked day never shifts across timezones); empty/invalid
 *  input means "no deadline", which the consumer renders as "Open" via
 *  `deadlineText()`/`useFormat()`, so the locale string stays out of here. */
function parseFormDeadline(d: string): Date | null {
  if (!d) return null;
  const parsed = new Date(`${d}T00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function usePostJobForm() {
  const { t } = useTranslation();
  const [state, setState] = useState<PostJobState>(readDraft);
  // Step index + navigation come from the shared wizard hook; gating stays in
  // the composer, which shows inline errors before allowing a step forward.
  const wizard = useWizardForm({ stepCount: STEP_LABEL_KEYS.length });
  const [justSaved, setJustSaved] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced autosave to localStorage; drives the "Saved just now" note.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
        setJustSaved(true);
      } catch {
        // Ignore storage failures.
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  const patch = useCallback((partial: Partial<PostJobState>) => {
    setJustSaved(false);
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleIn = useCallback(
    (key: "benefits" | "inclusivity" | "tags" | "contacts", value: string) => {
      setJustSaved(false);
      setState((prev) => {
        const arr = prev[key];
        return {
          ...prev,
          [key]: arr.includes(value)
            ? arr.filter((v) => v !== value)
            : [...arr, value],
        };
      });
    },
    [],
  );

  const clearDraft = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(DRAFT_KEY);
      } catch {
        // Ignore.
      }
    }
  }, []);

  const payLabel = useMemo(() => {
    if (state.hidePay)
      return state.barter ? "Barter / to discuss" : "Competitive";
    if (!state.rateMin && !state.rateMax)
      return state.barter ? "Open to barter" : "";
    const per =
      state.ratePer === "To discuss" ? "" : `/${state.ratePer.toLowerCase()}`;
    const range = state.rateMax
      ? `${state.currency}${state.rateMin}–${state.currency}${state.rateMax}`
      : `${state.currency}${state.rateMin}`;
    return `${range}${per ? ` ${per}` : ""}`;
  }, [state]);

  const stepValid = useCallback(
    (i: number): boolean => {
      if (i === 0) {
        if (state.category === "") return false;
        if (needsCity(state.format) && !state.city.trim()) return false;
      }
      if (i === 1) {
        if (!state.title.trim() || !state.description.trim()) return false;
      }
      if (i === 4) {
        if (state.contacts.includes("Email") && !state.email.trim())
          return false;
        if (state.contacts.includes("External link") && !state.link.trim())
          return false;
      }
      return true;
    },
    [state],
  );

  const canPublish = useMemo(
    () =>
      state.category !== "" &&
      state.title.trim() !== "" &&
      state.description.trim() !== "" &&
      state.agreed,
    [state],
  );

  const toJob = useCallback(
    (company: CompanyProfile, role: string): Job => {
      const location = needsCity(state.format)
        ? state.city || "Lisbon"
        : state.format;
      const salary = payLabel || "To discuss";
      const description =
        state.description.length > 180
          ? `${state.description.slice(0, 177)}…`
          : state.description;
      const qr = company.badges.some((b) => /queer/i.test(b.label));
      return {
        slug: `${slugify(state.title)}-${Date.now().toString(36)}`,
        category: state.category || null,
        profession: state.profession || null,
        commitment: state.commitment,
        seniority: state.seniority,
        qr,
        qrLabel: qr ? "Queer-run" : "Inclusive",
        organization: company.nameText,
        logo: company.logo,
        logoBg: "rgba(var(--accent-rgb),.14)",
        logoText: "var(--accent-ink)",
        title: state.title.trim(),
        // A label snapshot taken at publish time is enough for the demo board.
        type: t(commitmentLabelKey(state.commitment)),
        location,
        salary,
        deadline: parseFormDeadline(state.deadline),
        description,
        tags: state.tags,
        detail: {
          category: state.category ? t(fieldLabelKey(state.category)) : "",
          posted: new Date(),
          about: [state.description],
          dayToDay: [],
          lookingFor: state.tags,
          offer: state.benefits,
          aboutCompany: company.tagline,
          reviewerNote: `Posted by ${role} at ${company.nameText}. New listing. Not yet community-reviewed.`,
        },
      };
    },
    [state, payLabel, t],
  );

  return {
    state,
    step: wizard.currentStepIndex,
    setStep: wizard.goToStep,
    patch,
    toggleIn,
    payLabel,
    stepValid,
    canPublish,
    justSaved,
    clearDraft,
    toJob,
    needsCity: needsCity(state.format),
    showsTimezone: showsTimezone(state.format),
  };
}

export type PostJobForm = ReturnType<typeof usePostJobForm>;
