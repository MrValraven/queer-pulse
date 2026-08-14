import type { IconType } from "react-icons";
import {
  FiActivity,
  FiClock,
  FiDollarSign,
  FiHeart,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiUsers,
} from "react-icons/fi";
import { FaSyringe, FaVirus } from "react-icons/fa6";
import { LuDna, LuLeaf, LuMicroscope, LuScale } from "react-icons/lu";
import { routes } from "../../app/routeMap";

export type TabId = "testing" | "prep" | "hiv" | "guides";
export type ClinicType = "public" | "ngo" | "private" | "pharmacy";

/** i18n Pattern A — `id` is the stored tab value; `labelKey` resolves via `t()`. */
export const TABS: { id: TabId; labelKey: string }[] = [
  { id: "testing", labelKey: "resources:sexualHealth.tab.testing" },
  { id: "prep", labelKey: "resources:sexualHealth.tab.prep" },
  { id: "hiv", labelKey: "resources:sexualHealth.tab.hiv" },
  { id: "guides", labelKey: "resources:sexualHealth.tab.guides" },
];

export interface ClinicMeta {
  icon: IconType;
  text: string;
}
export interface ClinicDetail {
  tests: string;
  bring: string;
  access: string;
  note: string;
}
export interface Clinic {
  type: ClinicType;
  typeLabel: string;
  name: string;
  description: string;
  meta: ClinicMeta[];
  verified?: boolean;
  button: string;
  review?: string;
  details: ClinicDetail;
}
export const CLINICS: Clinic[] = [
  {
    type: "ngo",
    typeLabel: "NGO · Free",
    name: "CheckpointLx",
    description: "Lisbon's leading queer-specific sexual health service. Free, anonymous testing for HIV, syphilis, hepatitis B & C, and gonorrhoea. PrEP counselling. Staff are experienced with queer and trans clients. No appointment needed on drop-in days.",
    meta: [
      { icon: FiMapPin, text: "Rua de São Lázaro, Intendente" },
      { icon: FiClock, text: "Tue & Thu 18:00–21:00, Sat 14:00–18:00" },
    ],
    verified: true,
    button: "View details",
    review: "4.9 · 84 member reviews",
    details: {
      tests:
        "HIV, syphilis, hepatitis B & C, gonorrhoea. Rapid results the same evening.",
      bring:
        "Nothing required. No ID, no SNS number, no appointment on drop-in days.",
      access:
        "Ground-floor entrance, step-free. Trans-experienced staff. Service available in PT and EN.",
      note: "Busiest in the first hour. Arriving later in the session usually means a shorter wait.",
    },
  },
  {
    type: "ngo",
    typeLabel: "NGO · Free",
    name: "GAT Lisboa",
    description: "Community-based harm reduction and sexual health. Free HIV rapid tests, peer counselling, PrEP navigation support, and an anonymous STI referral service. Particularly strong on outreach to migrants and people in sex work.",
    meta: [
      { icon: FiMapPin, text: "Rua do Século, Bairro Alto" },
      { icon: FiClock, text: "Mon–Fri 10:00–18:00" },
    ],
    verified: true,
    button: "View details",
    review: "4.8 · 61 member reviews",
    details: {
      tests:
        "HIV rapid test on site; referrals for the full STI panel. PrEP navigation support.",
      bring:
        "Nothing required for a rapid test. For referrals, an SNS number helps but staff can advise without one.",
      access:
        "Peer counsellors who speak PT, EN, and FR. Especially experienced with migrants and people in sex work.",
      note: "Walk-in for rapid tests; PrEP navigation is best booked by phone first.",
    },
  },
  {
    type: "public",
    typeLabel: "SNS · Free",
    name: "CAD: Centro de Aconselhamento e Deteção",
    description: "The public SNS HIV testing and counselling service. Free, confidential, with a counsellor present. Also provides hepatitis B vaccination and referrals to PrEP. You need to register with the SNS but no insurance required.",
    meta: [
      { icon: FiMapPin, text: "Multiple locations across Lisbon" },
      { icon: FiClock, text: "By appointment" },
    ],
    button: "View details",
    review: "4.3 · 29 member reviews",
    details: {
      tests:
        "HIV testing with a counsellor, hepatitis B vaccination, and PrEP referrals.",
      bring:
        "Your SNS number. No private insurance needed; EU citizens can use an EHIC card.",
      access:
        "Multiple SNS sites across the city. Pick the one nearest you when booking.",
      note: "Confidential: results are never shared without your consent, including with your GP.",
    },
  },
  {
    type: "pharmacy",
    typeLabel: "Pharmacy · €15–25",
    name: "Rapid HIV test: any pharmacy",
    description: "Available over the counter at most pharmacies. Result in 15 minutes. Detects HIV from 3 months after potential exposure. Ask for a teste rápido de VIH. No prescription needed, no record kept.",
    meta: [
      { icon: FiMapPin, text: "Any farmácia" },
      { icon: FiClock, text: "Walk-in, no appointment" },
    ],
    button: "View details",
    details: {
      tests: "Rapid finger-prick HIV test, result in about 15 minutes.",
      bring: "€15–25 in cash or card. No prescription, no ID, no record kept.",
      access:
        "Available at most pharmacies. Larger ones are more likely to stock it.",
      note: "Detects HIV from roughly 3 months after a potential exposure; test again if it was more recent.",
    },
  },
  {
    type: "private",
    typeLabel: "Private · Paid",
    name: "Clínica da Travessa: Sexual Health",
    description: "Private clinic with queer-affirming staff. Full STI panel (HIV, syphilis, gonorrhoea, chlamydia, HSV, hepatitis B & C, HPV). Results within 48 hours. Offers PrEP prescription outside the SNS pathway for those who prefer it.",
    meta: [
      { icon: FiMapPin, text: "Príncipe Real" },
      { icon: FiClock, text: "Mon–Sat, by appointment" },
    ],
    verified: true,
    button: "View details",
    review: "4.7 · 38 member reviews",
    details: {
      tests:
        "Full STI panel: HIV, syphilis, gonorrhoea, chlamydia, HSV, hepatitis B & C, HPV. Results within 48 hours.",
      bring:
        "A booking and a payment method. PrEP prescriptions available outside the SNS pathway.",
      access:
        "Queer-affirming staff; private, discreet setting. Appointments PT and EN.",
      note: "Paid service, useful when you want a fast, comprehensive panel without the SNS wait.",
    },
  },
];
export const TYPE_CLASS: Record<ClinicType, string> = {
  public: "typePublic",
  ngo: "typeNgo",
  private: "typePrivate",
  pharmacy: "typePharmacy",
};
/** i18n Pattern A — `id` is the stored filter value; `labelKey` resolves via `t()`. */
export const CLINIC_FILTERS: { id: ClinicType | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "resources:sexualHealth.testing.filter.all" },
  { id: "public", labelKey: "resources:sexualHealth.testing.filter.public" },
  { id: "ngo", labelKey: "resources:sexualHealth.testing.filter.ngo" },
  {
    id: "pharmacy",
    labelKey: "resources:sexualHealth.testing.filter.pharmacy",
  },
  { id: "private", labelKey: "resources:sexualHealth.testing.filter.private" },
];

export const TESTING_INFO: {
  icon: IconType;
  title: string;
  color: string;
  background: string;
  border: string;
  body: string;
}[] = [
  {
    icon: FiClock,
    title: "How often?",
    color: "var(--jade)",
    background: "rgba(74,140,111,.06)",
    border: "rgba(74,140,111,.18)",
    body: "If you have multiple partners: every 3 months. Single partner, both tested: less frequently. HIV rapid test at any pharmacy takes 15 minutes.",
  },
  {
    icon: FiLock,
    title: "Confidential",
    color: "var(--accent-ink)",
    background: "rgba(232,119,90,.05)",
    border: "rgba(232,119,90,.18)",
    body: "All public SNS sexual health services are confidential. No results are shared without your consent, including with your GP.",
  },
  {
    icon: FiDollarSign,
    title: "Cost",
    color: "var(--plum)",
    background: "rgba(45,27,61,.04)",
    border: "rgba(45,27,61,.12)",
    body: "SNS CAD centres are free. Rapid HIV tests at pharmacies cost €15–25. NGO services (CheckpointLx, GAT) are free and anonymous.",
  },
];

export const PREP_STEPS = [
  {
    title: "Book an appointment at a CAD or sexual health clinic",
    description: "Tell them you're interested in PrEP. CheckpointLx and GAT can help you navigate the referral if you're unsure where to start.",
    note: "CheckpointLx offers PrEP counselling every Tuesday evening. No appointment needed.",
  },
  {
    title: "Initial eligibility assessment & blood tests",
    description: "A counsellor will discuss your situation and arrange blood tests: HIV, hepatitis B, creatinine (kidney function), and STI panel. Results in 5–10 days.",
    note: "You must be HIV-negative to start PrEP.",
  },
  {
    title: "Prescription issued: medication collected free from SNS pharmacy",
    description: "If eligible, you'll receive a prescription for tenofovir/emtricitabine. Collect from any SNS-contracted pharmacy at no cost with your SNS number.",
    note: "No SNS number? GAT Lisboa can advise on alternative pathways.",
  },
  {
    title: "Quarterly check-ins",
    description: "Every 3 months: HIV test, STI screen, and kidney function check. This is also where you get your next prescription. Appointments are 20–30 minutes.",
  },
];

export const PREP_FAQ = [
  {
    q: "Do I need a Portuguese SNS number?",
    a: "EU citizens can access SNS services with their EHIC card. Non-EU residents should register with the SNS. You're entitled to do this if you're legally resident in Portugal. If you're in a more complex situation, GAT Lisboa specialises in supporting people without straightforward documentation.",
  },
  {
    q: "Can I take PrEP on-demand (event-based) rather than daily?",
    a: "Yes, the 2-1-1 protocol (two pills 2–24 hours before sex, one 24 hours after, one 48 hours after) is supported in Portugal and is effective for receptive anal sex. Discuss with your clinician whether daily or on-demand is right for you.",
  },
  {
    q: "Does PrEP protect against other STIs?",
    a: "PrEP only prevents HIV. It doesn't protect against syphilis, gonorrhoea, chlamydia, herpes, HPV, or hepatitis C. Condoms remain useful for STI prevention, and regular testing every 3 months is part of the PrEP programme for this reason.",
  },
  {
    q: "I'm trans and taking hormones. Does this affect PrEP?",
    a: "For trans women on oestrogen, some studies suggest slightly lower drug levels. Daily dosing (rather than on-demand) is recommended. PrEP and HRT are generally safe to take together. Discuss with a clinician who has experience with trans patients; CheckpointLx has trans-experienced staff.",
  },
];

export interface InfoCard {
  icon: IconType;
  title: string;
  body: string;
  link?: { label: string; href: string; external?: boolean };
}

export const HIV_INFO: InfoCard[] = [
  {
    icon: FiHeart,
    title: "Just tested positive?",
    body: "Take a breath. Modern HIV treatment is effective and straightforward. The CAD service or your GP can refer you immediately to an infectious disease specialist. Treatment usually begins within days of diagnosis.",
    link: {
      label: "Linha SIDA: 800 210 008 (free)",
      href: "tel:800210008",
      external: true,
    },
  },
  {
    icon: FiActivity,
    title: "PEP: after potential exposure",
    body: "Post-exposure prophylaxis must be started within 72 hours (ideally 24). Go to any hospital A&E and ask for PEP. Do not wait. It's free through the SNS and highly effective when taken on time.",
  },
  {
    icon: FiUsers,
    title: "Community peer support",
    body: "The QueerPulse HIV+ peer support group is private, moderated, and limited to members who have opted in. A space to share experience without stigma or unsolicited advice.",
    link: { label: "Find the group", href: routes.communities },
  },
  {
    icon: LuScale,
    title: "Rights & non-disclosure",
    body: "Portuguese law on HIV criminalisation is nuanced. You are not legally obligated to disclose to every partner in every situation. The legal reality is complex. Talk to GAT or a lawyer if you have concerns.",
    link: { label: "Legal resources", href: routes.legal },
  },
];

export const GUIDES: InfoCard[] = [
  {
    icon: FaSyringe,
    title: "HPV & hepatitis B vaccination",
    body: "Both are free through the SNS for certain groups, and strongly recommended. HPV vaccination is now available up to age 45 through some clinics. Ask your GP or CheckpointLx.",
  },
  {
    icon: FaVirus,
    title: "Mpox: what to know",
    body: "Mpox can affect anyone, but some queer networks have higher exposure. Vaccination is available via SNS for close contacts and higher-risk individuals. CheckpointLx maintains an up-to-date guide.",
  },
  {
    icon: LuMicroscope,
    title: "Bacterial STIs: syphilis, gonorrhoea, chlamydia",
    body: "All are curable with antibiotics and all are on the rise across Europe. Many have no symptoms. Testing every 3 months if sexually active is the most reliable way to catch them early.",
  },
  {
    icon: FiMessageCircle,
    title: "Talking to partners about testing",
    body: "A practical guide to having the conversation: different scripts for different situations. Written by community members, not clinical guidelines.",
    // No standalone guide page exists yet, so we render no CTA rather than a
    // dead "Read the guide →" link (href:"#"). Add a `link` here once the
    // guide has a real route.
  },
  {
    icon: LuLeaf,
    title: "Sexual health & substance use",
    body: "Practical harm reduction for people who use substances in sexual contexts: chemsex, MDMA, alcohol. No judgment, practical information about risk reduction.",
    link: { label: "Read the guide", href: routes.harmReduction },
  },
  {
    icon: LuDna,
    title: "Sexual health for trans & non-binary people",
    body: "Bodies vary, practices vary, and most sexual health guidance is written for cisgender people. A community-written guide to navigating the system and finding clinicians who understand.",
    link: { label: "Trans Hub", href: routes.transHub },
  },
];
