import { useCallback, useState } from "react";
import { useRequiredFieldValidation } from "../../shared/hooks/useWizardForm";
import type { TFunction } from "../../shared/i18n/types";
import type { CreatePartnerApplicationDto, Region } from "./api/partners.api";
import {
  DEFAULT_REGION_LABEL_KEY,
  DEFAULT_TIER,
  EYEBROW_PREFIX,
  MAX_TAGS,
} from "./submitPartnerApplication.data";
import { leadingInitials } from "../../shared/lib/initials";

export interface SubmitPartnerState {
  name: string;
  logo: string;
  /** True once the applicant manually edits the logo — stops auto-derivation. */
  logoTouched: boolean;
  region: Region;
  city: string;
  /** The kind of organisation only; the "Partner · " eyebrow prefix is added on submit. */
  orgType: string;
  tagline: string;
  description: string;
  tags: Set<string>;
  website: string;
  email: string;
  /** Honeypot — real people leave it blank. */
  handle: string;
}

/** The fictional "current" year the demo/live app renders as. */
const CURRENT_YEAR = 2026;

function buildEmptyState(): SubmitPartnerState {
  return {
    name: "",
    logo: "",
    logoTouched: false,
    region: "pt",
    city: "",
    orgType: "",
    tagline: "",
    description: "",
    tags: new Set(),
    website: "",
    email: "",
    handle: "",
  };
}

/**
 * Badge initials from the organisation name: first letter of up to the first
 * three significant words, uppercased, capped at the field's 5-char limit.
 * "Casa T" → "CT"; "Casa Trans Lisboa" → "CTL".
 */
function deriveInitials(name: string): string {
  return leadingInitials(name, { wordCount: 3 });
}

/** Fields that must be filled before the application can be submitted. */
export type RequiredField = "name" | "orgType" | "city" | "tagline" | "description";

const REQUIRED: RequiredField[] = ["name", "orgType", "city", "tagline", "description"];

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
  const [state, setState] = useState<SubmitPartnerState>(buildEmptyState);

  const set = useCallback(
    <K extends keyof SubmitPartnerState>(
      key: K,
      value: SubmitPartnerState[K],
    ) => setState((previous) => ({ ...previous, [key]: value })),
    [],
  );

  /** Name drives the derived logo until the applicant edits the logo directly. */
  const setName = useCallback((value: string) => {
    setState((previous) => ({
      ...previous,
      name: value,
      logo: previous.logoTouched ? previous.logo : deriveInitials(value),
    }));
  }, []);

  const setLogo = useCallback((value: string) => {
    setState((previous) => ({ ...previous, logo: value, logoTouched: true }));
  }, []);

  const setRegion = useCallback((region: Region) => {
    setState((previous) => ({ ...previous, region }));
  }, []);

  const toggleTag = useCallback((value: string) => {
    setState((previous) => {
      const tags = new Set(previous.tags);
      if (tags.has(value)) tags.delete(value);
      else if (tags.size < MAX_TAGS) tags.add(value);
      return { ...previous, tags };
    });
  }, []);

  const requiredValidation = useRequiredFieldValidation({
    values: state,
    requiredFields: REQUIRED,
    buildError: () => t("marketing:submitPartner.fields.requiredError"),
  });
  const valid = requiredValidation.isValid;
  const errorFor = requiredValidation.errorFor;

  const toDto = (): CreatePartnerApplicationDto => {
    const tags = Array.from(state.tags);
    const website = state.website.trim();
    const email = state.email.trim();
    const hasContact = Boolean(website || email);
    return {
      name: state.name.trim(),
      logo: state.logo.trim() || deriveInitials(state.name),
      region: state.region,
      regionLabel: t(DEFAULT_REGION_LABEL_KEY[state.region]),
      city: state.city.trim(),
      desc: state.description.trim(),
      tier: DEFAULT_TIER,
      since: t("marketing:submitPartner.form.sinceDefault", {
        year: CURRENT_YEAR,
      }),
      eyebrow: `${EYEBROW_PREFIX}${state.orgType.trim()}`,
      tagline: state.tagline.trim(),
      ...(tags.length ? { tags } : {}),
      ...(hasContact
        ? {
            contact: {
              website: website || null,
              email: email || null,
              phone: null,
              phoneNote: null,
              address: null,
            },
          }
        : {}),
      ...(state.handle.trim() ? { handle: state.handle.trim() } : {}),
    };
  };

  return {
    state,
    set,
    setName,
    setLogo,
    setRegion,
    toggleTag,
    tagCount: state.tags.size,
    tagsFull: state.tags.size >= MAX_TAGS,
    valid,
    errorFor,
    markTouched: requiredValidation.markSubmitted,
    toDto,
  };
}

export type SubmitPartnerForm = ReturnType<typeof useSubmitPartnerForm>;
