import type { Region } from "./api/partners.api";

/** Region options for the apply form — value is the lowercase API region. */
export const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: "pt", label: "Portugal" },
  { value: "eu", label: "Europe" },
  { value: "int", label: "International" },
];

/** The default human `regionLabel` prefilled per region (user can override). */
export const DEFAULT_REGION_LABEL: Record<Region, string> = {
  pt: "Portugal",
  eu: "Europe",
  int: "International",
};

/** The set of default labels, so the form knows when the user has customised it. */
export const DEFAULT_LABELS: string[] = Object.values(DEFAULT_REGION_LABEL);

/** Tips shown in the sidebar while filling out the application. */
export const APPLY_TIPS: { title: string; body: string }[] = [
  {
    title: "We read every application",
    body: "Partnerships here are operational, not promotional. Tell us what your organisation actually does and who it serves — not a mission statement.",
  },
  {
    title: "Shared values, not brand alignment",
    body: "We prioritise organisations that centre the identities marginalised within queer spaces as well as outside them. Say where your work sits.",
  },
  {
    title: "What happens next",
    body: "Your application arrives as pending. A member of the team reviews it, and we'll be in touch — whether it's a yes, a not-yet, or a question.",
  },
];
