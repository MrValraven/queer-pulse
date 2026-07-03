/** Mock applicant, pre-filled from the "logged-in" QueerPulse profile. */
export const APPLICANT = {
  name: "Tomás Mendes",
  pronouns: "he/him",
  email: "tomas@example.com",
  location: "Alfama, Lisbon",
  profileUrl: "queerpulse.app/p/tomas-mendes",
};

export interface Availability {
  value: string;
  title: string;
  desc: string;
}

export const AVAILABILITY: Availability[] = [
  { value: "now", title: "Immediately", desc: "Ready now" },
  { value: "2-4w", title: "In 2–4 weeks", desc: "Notice period" },
  { value: "1-3m", title: "In 1–3 months", desc: "Wrapping up" },
];

/** "Before you send" reassurance shown in the sidebar. */
export const APPLY_TIPS = [
  "Triple-check your cover note — autocorrect loves rewriting “queer”.",
  "Linking just your QueerPulse profile is fine. They'll see your work.",
  "Most teams here reply to every application within 10 days.",
  "Compensation is fixed as posted, but title and start date are often open.",
];
