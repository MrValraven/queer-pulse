import { useCallback, useState } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { CreatePartnerApplicationDto, Region } from "./api/partners.api";
import { DEFAULT_REGION_LABEL_KEY } from "./submitPartnerApplication.data";

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

/** The fictional "current" year the demo/live app renders as — matches the
 * rest of the prototype's dated content. */
const CURRENT_YEAR = 2026;

function buildEmptyState(t: TFunction): SubmitPartnerState {
  return {
    name: "",
    logo: "",
    region: "pt",
    regionLabel: t(DEFAULT_REGION_LABEL_KEY.pt),
    city: "",
    desc: "",
    tags: "",
    tier: "",
    since: t("marketing:submitPartner.form.sinceDefault", {
      year: CURRENT_YEAR,
    }),
    eyebrow: "",
    tagline: "",
    handle: "",
  };
}

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
 *
 * Takes `t` so the region-label and "since" defaults prefill in the active
 * language — `t` is referentially stable per language (i18n extraction
 * brief §2), so this only recomputes the initializer if the hook itself
 * remounts, not on every render.
 */
export function useSubmitPartnerForm(t: TFunction) {
  const [state, setState] = useState<SubmitPartnerState>(() =>
    buildEmptyState(t),
  );
  const [touched, setTouched] = useState(false);

  const set = useCallback(
    <K extends keyof SubmitPartnerState>(
      key: K,
      value: SubmitPartnerState[K],
    ) => setState((s) => ({ ...s, [key]: value })),
    [],
  );

  /** Changing region prefills the human label — unless the user customised it. */
  const setRegion = useCallback(
    (region: Region) => {
      setState((s) => {
        const defaultLabelsInActiveLanguage = Object.values(
          DEFAULT_REGION_LABEL_KEY,
        ).map((labelKey) => t(labelKey));
        const untouchedLabel =
          !s.regionLabel.trim() ||
          defaultLabelsInActiveLanguage.includes(s.regionLabel.trim());
        return {
          ...s,
          region,
          regionLabel: untouchedLabel
            ? t(DEFAULT_REGION_LABEL_KEY[region])
            : s.regionLabel,
        };
      });
    },
    [t],
  );

  const missing = REQUIRED.filter((f) => !String(state[f]).trim());
  const valid = missing.length === 0;

  const errorFor = (f: RequiredField): string | null => {
    if (!touched) return null;
    return missing.includes(f)
      ? t("marketing:submitPartner.fields.requiredError")
      : null;
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
