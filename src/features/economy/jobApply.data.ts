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
  titleKey: string;
  descKey: string;
}

export const AVAILABILITY: Availability[] = [
  {
    value: "now",
    titleKey: "economy:jobApply.availability.now.title",
    descKey: "economy:jobApply.availability.now.desc",
  },
  {
    value: "2-4w",
    titleKey: "economy:jobApply.availability.soon.title",
    descKey: "economy:jobApply.availability.soon.desc",
  },
  {
    value: "1-3m",
    titleKey: "economy:jobApply.availability.later.title",
    descKey: "economy:jobApply.availability.later.desc",
  },
];

/** "Before you send" reassurance shown in the sidebar. */
export const APPLY_TIP_KEYS = [
  "economy:jobApply.tip.autocorrect",
  "economy:jobApply.tip.profileLink",
  "economy:jobApply.tip.replyTime",
  "economy:jobApply.tip.fixedComp",
];

/**
 * English answer text for the "available from" question submitted in the
 * application DTO. This is stored payload (an application record an employer
 * reviews later), not rendered UI chrome — kept in English regardless of the
 * active UI language so application records stay consistent for employers.
 */
export const AVAILABILITY_ANSWER: Record<string, string> = {
  now: "Immediately",
  "2-4w": "In 2–4 weeks",
  "1-3m": "In 1–3 months",
};
