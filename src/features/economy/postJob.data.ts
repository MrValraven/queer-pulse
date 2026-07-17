/* Static option lists for the Post-a-Job composer.
 *
 * CATEGORIES/COMMITMENTS/SENIORITY/FORMATS/TIMEZONES/RATE_PER carry a stable
 * canonical English `value` (used to build the posted job's content fields
 * and matched by usePostJobForm's needsCity/showsTimezone regexes) alongside
 * a `labelKey` the picker UI resolves via t() — see docs/i18n Trap 5.1.
 */
import type { TFunction } from "../../shared/i18n/types";

export interface Option {
  value: string;
  labelKey: string;
}

export const CATEGORIES: Option[] = [
  {
    value: "Legal & admin",
    labelKey: "economy:postJob.option.category.legalAdmin",
  },
  {
    value: "Design & creative",
    labelKey: "economy:postJob.option.category.designCreative",
  },
  {
    value: "Tech & engineering",
    labelKey: "economy:postJob.option.category.techEngineering",
  },
  {
    value: "Writing & editing",
    labelKey: "economy:postJob.option.category.writingEditing",
  },
  {
    value: "Translation",
    labelKey: "economy:postJob.option.category.translation",
  },
  {
    value: "Teaching & tutoring",
    labelKey: "economy:postJob.option.category.teachingTutoring",
  },
  {
    value: "Health & wellbeing",
    labelKey: "economy:postJob.option.category.healthWellbeing",
  },
  {
    value: "Practical help",
    labelKey: "economy:postJob.option.category.practicalHelp",
  },
  { value: "Other", labelKey: "economy:postJob.option.category.other" },
];

export const COMMITMENTS: Option[] = [
  {
    value: "Full-time",
    labelKey: "economy:postJob.option.commitment.fullTime",
  },
  {
    value: "Part-time",
    labelKey: "economy:postJob.option.commitment.partTime",
  },
  { value: "Contract", labelKey: "economy:postJob.option.commitment.contract" },
  {
    value: "Freelance / gig",
    labelKey: "economy:postJob.option.commitment.freelanceGig",
  },
  {
    value: "Volunteer",
    labelKey: "economy:postJob.option.commitment.volunteer",
  },
  {
    value: "Internship",
    labelKey: "economy:postJob.option.commitment.internship",
  },
];

export const SENIORITY: Option[] = [
  { value: "Any level", labelKey: "economy:postJob.option.seniority.anyLevel" },
  { value: "Entry", labelKey: "economy:postJob.option.seniority.entry" },
  { value: "Mid", labelKey: "economy:postJob.option.seniority.mid" },
  { value: "Senior", labelKey: "economy:postJob.option.seniority.senior" },
  {
    value: "Lead / Principal",
    labelKey: "economy:postJob.option.seniority.leadPrincipal",
  },
];

export const FORMATS: Option[] = [
  { value: "Remote", labelKey: "economy:postJob.option.format.remote" },
  {
    value: "In-person (Lisbon)",
    labelKey: "economy:postJob.option.format.inPersonLisbon",
  },
  { value: "Hybrid", labelKey: "economy:postJob.option.format.hybrid" },
  { value: "Either", labelKey: "economy:postJob.option.format.either" },
];

export const TIMEZONES: Option[] = [
  {
    value: "No preference",
    labelKey: "economy:postJob.option.timezone.noPreference",
  },
  {
    value: "WET / Lisbon (UTC+0)",
    labelKey: "economy:postJob.option.timezone.wetLisbon",
  },
  { value: "CET (UTC+1)", labelKey: "economy:postJob.option.timezone.cet" },
  {
    value: "±3h of Lisbon",
    labelKey: "economy:postJob.option.timezone.threeHoursOfLisbon",
  },
  {
    value: "Any overlap",
    labelKey: "economy:postJob.option.timezone.anyOverlap",
  },
];

export const CURRENCIES = ["€", "£", "$"];

export const RATE_PER: Option[] = [
  { value: "Hour", labelKey: "economy:postJob.option.ratePer.hour" },
  { value: "Day", labelKey: "economy:postJob.option.ratePer.day" },
  { value: "Project", labelKey: "economy:postJob.option.ratePer.project" },
  { value: "Month", labelKey: "economy:postJob.option.ratePer.month" },
  { value: "Year", labelKey: "economy:postJob.option.ratePer.year" },
  { value: "To discuss", labelKey: "economy:postJob.option.ratePer.toDiscuss" },
];

/** Look up an option's translated label by its canonical stored value, falling
 *  back to the raw value if unmatched (defensive — should not happen). Used
 *  wherever a picked value is displayed read-only (sidebar, preview, review). */
export function optionLabel(
  options: Option[],
  value: string,
  t: TFunction,
): string {
  const match = options.find((option) => option.value === value);
  return match ? t(match.labelKey) : value;
}

export const BENEFITS = [
  "Remote work stipend",
  "Healthcare / insurance",
  "Mental-health support",
  "Flexible hours",
  "Equity / profit share",
  "Learning budget",
  "Paid time off",
  "Relocation support",
];

export const INCLUSIVITY = [
  "Trans-inclusive workplace",
  "Pays a living wage",
  "Accessible workspace",
  "BIPOC-affirming",
  "Flexible for caregivers",
  "Disability-confident",
  "Gender-neutral facilities",
  "Uses your pronouns",
];

export const SKILL_SUGGESTIONS = [
  "Portuguese law",
  "Adobe Illustrator",
  "Figma",
  "Copywriting",
  "EN↔PT translation",
  "Bookkeeping",
  "React",
  "Photography",
  "Grant writing",
  "Social media",
  "Event production",
  "Brand strategy",
  "Immigration paperwork",
  "Trauma-informed care",
  "Web development",
  "Illustration",
  "Community organising",
  "Fundraising",
  "Video editing",
  "UX research",
];

export const CONTACT_METHODS = [
  "Platform message",
  "Email",
  "Forum reply",
  "External link",
];

/** The affiliation roles offered when a member claims a company.
 *  i18n Pattern A — `value` is the stable stored role (persisted via
 *  `affiliate(slug, role)`); `labelKey` is resolved via t() for display only. */
export const AFFILIATION_ROLES: { value: string; labelKey: string }[] = [
  { value: "Founder / owner", labelKey: "economy:affiliateRole.founder" },
  { value: "Hiring lead", labelKey: "economy:affiliateRole.hiringLead" },
  { value: "Team member", labelKey: "economy:affiliateRole.teamMember" },
  { value: "Recruiter", labelKey: "economy:affiliateRole.recruiter" },
  {
    value: "Volunteer coordinator",
    labelKey: "economy:affiliateRole.volunteerCoordinator",
  },
];
