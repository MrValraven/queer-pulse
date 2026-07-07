import { useCallback, useState } from "react";
import type { CreatePartnerApplicationDto, Region } from "./api/partners.api";
import {
  DEFAULT_LABELS,
  DEFAULT_REGION_LABEL,
} from "./submitPartnerApplication.data";

export interface SubmitPartnerState {
  name: string;
  logo: string;
  region: Region;
  regionLabel: string;
  city: string;
  desc: string;
  tags: string;
  tier: string;
  since: string;
  eyebrow: string;
  tagline: string;
  /** Honeypot — real people leave it blank. */
  handle: string;
}

const EMPTY: SubmitPartnerState = {
  name: "",
  logo: "",
  region: "pt",
  regionLabel: DEFAULT_REGION_LABEL.pt,
  city: "",
  desc: "",
  tags: "",
  tier: "",
  since: "Applying · 2026",
  eyebrow: "",
  tagline: "",
  handle: "",
};

const splitCommas = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/** Fields that must be filled before the application can be submitted. */
export type RequiredField =
  | "name"
  | "logo"
  | "regionLabel"
  | "city"
  | "desc"
  | "tier"
  | "since"
  | "eyebrow"
  | "tagline";

const REQUIRED: RequiredField[] = [
  "name",
  "logo",
  "regionLabel",
  "city",
  "desc",
  "tier",
  "since",
  "eyebrow",
  "tagline",
];

/**
 * State + payload builder for the "Apply to partner" form. Holds every field the
 * focused form collects, validates the required ones, and maps the whole thing
 * onto the backend's `CreatePartnerApplicationDto` (the long rich arrays are
 * omitted here — an admin fleshes them out, or the org supplies them later).
 */
export function useSubmitPartnerForm() {
  const [state, setState] = useState<SubmitPartnerState>(EMPTY);
  const [touched, setTouched] = useState(false);

  const set = useCallback(
    <K extends keyof SubmitPartnerState>(
      key: K,
      value: SubmitPartnerState[K],
    ) => setState((s) => ({ ...s, [key]: value })),
    [],
  );

  /** Changing region prefills the human label — unless the user customised it. */
  const setRegion = useCallback((region: Region) => {
    setState((s) => {
      const untouchedLabel =
        !s.regionLabel.trim() || DEFAULT_LABELS.includes(s.regionLabel.trim());
      return {
        ...s,
        region,
        regionLabel: untouchedLabel
          ? DEFAULT_REGION_LABEL[region]
          : s.regionLabel,
      };
    });
  }, []);

  const missing = REQUIRED.filter((f) => !String(state[f]).trim());
  const valid = missing.length === 0;

  const errorFor = (f: RequiredField): string | null => {
    if (!touched) return null;
    return missing.includes(f) ? "This field is required." : null;
  };

  const toDto = (): CreatePartnerApplicationDto => {
    const tags = splitCommas(state.tags);
    return {
      name: state.name.trim(),
      logo: state.logo.trim(),
      region: state.region,
      regionLabel: state.regionLabel.trim(),
      city: state.city.trim(),
      desc: state.desc.trim(),
      tier: state.tier.trim(),
      since: state.since.trim(),
      eyebrow: state.eyebrow.trim(),
      tagline: state.tagline.trim(),
      ...(tags.length ? { tags } : {}),
      ...(state.handle.trim() ? { handle: state.handle.trim() } : {}),
    };
  };

  return {
    state,
    set,
    setRegion,
    valid,
    errorFor,
    markTouched: () => setTouched(true),
    toDto,
  };
}

export type SubmitPartnerForm = ReturnType<typeof useSubmitPartnerForm>;
