import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CompanyProfile } from "./companies.data";
import type { Job } from "./jobs.data";

export interface PostJobState {
  category: string;
  commitment: string;
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

export const STEP_LABELS = [
  "Type & role",
  "Details",
  "Pay & perks",
  "Screening",
  "Review",
];

const DRAFT_KEY = "qp-postjob-draft";

const INITIAL: PostJobState = {
  category: "Design & creative",
  commitment: "Freelance / gig",
  seniority: "Any level",
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

function readDraft(): PostJobState {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return INITIAL;
    return { ...INITIAL, ...(JSON.parse(raw) as Partial<PostJobState>) };
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

function fmtDeadline(d: string) {
  if (!d) return "Open";
  try {
    return new Date(`${d}T00:00`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return d;
  }
}

export function usePostJobForm() {
  const [state, setState] = useState<PostJobState>(readDraft);
  const [step, setStep] = useState(0);
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
      const desc =
        state.description.length > 180
          ? `${state.description.slice(0, 177)}…`
          : state.description;
      const qr = company.badges.some((b) => /queer/i.test(b.label));
      return {
        slug: `${slugify(state.title)}-${Date.now().toString(36)}`,
        cat: slugify(state.category.split(" ")[0] ?? state.category),
        qr,
        qrLabel: qr ? "Queer-run" : "Inclusive",
        org: company.nameText,
        logo: company.logo,
        logoBg: "rgba(var(--accent-rgb),.14)",
        logoText: "var(--accent-ink)",
        title: state.title.trim(),
        type: state.commitment,
        location,
        salary,
        deadline: fmtDeadline(state.deadline),
        desc,
        tags: state.tags.length ? state.tags : [state.category],
        detail: {
          category: state.category,
          posted: "Posted just now",
          about: [state.description],
          dayToDay: [],
          lookingFor: state.tags,
          offer: state.benefits,
          aboutCompany: company.tagline,
          reviewerNote: `Posted by ${role} at ${company.nameText}. New listing — not yet community-reviewed.`,
        },
      };
    },
    [state, payLabel],
  );

  return {
    state,
    step,
    setStep,
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
