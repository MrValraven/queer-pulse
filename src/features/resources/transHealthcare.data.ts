export interface Step {
  n: number;
  title: string;
  desc: string;
  time?: string;
  cost?: string;
  tip?: string;
}

export interface Section {
  /**
   * i18n Pattern A — section headers are short chrome, translated via a
   * catalog key. `steps` below stay English (FLAGGED, not swept — see
   * transHealthcare catalog header comment): dense, high-precision
   * medical/legal procedural detail pending dedicated native review.
   */
  titleKey: string;
  steps: Step[];
}

export interface Path {
  id: string;
  labelKey: string;
  sections: Section[];
}

export const PATHS: Path[] = [
  {
    id: "hrt-sns",
    labelKey: "resources:transHealthcare.path.hrtSns.label",
    sections: [
      {
        titleKey: "resources:transHealthcare.section.gettingIntoSystem",
        steps: [
          {
            n: 1,
            title: "Register with a centros de saúde",
            desc: "You need to be registered with a primary care health centre (centro de saúde) in Lisbon. If you are not, contact SNS 24 (808 24 24 24) or visit your nearest centro de saúde with your NIF, residency proof, and ID.",
            time: "Same day",
            cost: "Free",
            tip: "If you are unregistered or do not have a local GP assigned, ILGA Portugal can help you navigate the registration system.",
          },
          {
            n: 2,
            title: "Book an appointment with your GP (Médico de Família)",
            desc: 'Ask specifically for a referral for gender dysphoria assessment. You do not need to use the term "gender dysphoria" — you can say you want a referral to a specialist for gender identity support.',
            time: "Days to weeks",
            cost: "Free",
            tip: "If your GP is unhelpful or you do not have one assigned, ask to change GPs or use ILGA's accompaniment service.",
          },
          {
            n: 3,
            title: "GP refers you to psychiatry or psychology",
            desc: "The SNS pathway typically requires a psychiatric or psychological assessment before HRT. Your GP writes a referral to the mental health team at your local hospital or to the CHLC gender clinic.",
            time: "2–8 weeks",
            cost: "Free",
          },
        ],
      },
      {
        titleKey: "resources:transHealthcare.section.genderClinic",
        steps: [
          {
            n: 4,
            title: "Initial assessment appointment",
            desc: "At Hospital de Santa Maria (CHLC) or the referral hospital. The first appointment is an information session — you are not being evaluated for worthiness. Bring your GP referral letter, ID, and any relevant mental health history.",
            time: "4–18 months waiting",
            cost: "Free (SNS)",
            tip: "The waiting list is long. Register early even if you are uncertain. You can withdraw at any time.",
          },
          {
            n: 5,
            title: "Ongoing psychiatric or psychological support",
            desc: "Typically 2–4 appointments over 3–6 months. These are consultations, not gatekeeping — you are not being asked to prove your identity. Having a private therapist in parallel can help.",
            time: "3–6 months",
            cost: "Free (SNS)",
          },
          {
            n: 6,
            title: "HRT prescription",
            desc: "Once the team supports HRT, your endocrinologist or GP prescribes hormones. The prescription is valid at any pharmacy. Some medications are subsidised under the SNS (comparticipados).",
            time: "After approval",
            cost: "€10–40/month (subsidised)",
            tip: "Keep all receipts — some costs may be partially reimbursed. Ask your GP about the comparticipação subsidy.",
          },
        ],
      },
      {
        titleKey: "resources:transHealthcare.section.ongoingCare",
        steps: [
          {
            n: 7,
            title: "Regular blood tests and follow-up",
            desc: "Typically every 3 months in the first year, then every 6 months. Blood tests are done at the hospital or your centros de saúde. Results are reviewed by your prescribing doctor.",
            time: "Ongoing",
            cost: "Free (SNS)",
            tip: "Ask for a copy of your blood results every time. You are entitled to them, and they help if you ever switch providers.",
          },
          {
            n: 8,
            title: "Monitoring and dose adjustments",
            desc: "Hormone levels are adjusted over time. This is a collaborative process — tell your doctor what you are experiencing. Many trans people in Lisbon also supplement SNS care with private endocrinology for faster adjustments.",
            time: "Ongoing",
            cost: "Free (SNS)",
          },
        ],
      },
    ],
  },
  {
    id: "hrt-private",
    labelKey: "resources:transHealthcare.path.hrtPrivate.label",
    sections: [
      {
        titleKey: "resources:transHealthcare.section.findingPrivateProvider",
        steps: [
          {
            n: 1,
            title: "Find a trans-affirming private endocrinologist or GP",
            desc: "The QueerPulse Solidarity Pricing Registry lists trans-affirming GPs offering sliding-scale fees. ILGA Portugal also maintains a list of recommended providers.",
            time: "Days",
            cost: "€50–150 first consultation",
            tip: "Ask explicitly whether they have experience prescribing HRT for trans patients before booking.",
          },
          {
            n: 2,
            title: "First consultation",
            desc: "Bring any previous relevant records (mental health assessments, blood tests, previous prescriptions). Private providers may prescribe HRT without a psychiatric assessment — ask at booking.",
            time: "Can be within days",
            cost: "€60–150",
            tip: "Informed consent model — many private providers in Lisbon now work this way. You do not need a psychiatric diagnosis.",
          },
          {
            n: 3,
            title: "Prescription and pharmacy",
            desc: "You will receive a private prescription valid at any pharmacy. Some medications are not subsidised on a private prescription — ask your doctor about alternatives.",
            time: "Same day",
            cost: "€20–80/month",
          },
        ],
      },
      {
        titleKey: "resources:transHealthcare.section.ongoing",
        steps: [
          {
            n: 4,
            title: "Blood tests",
            desc: "Can be done at private labs (Synlab, Germano de Sousa) or via a convenção (agreement) with the SNS. Results typically back within 24–48 hours.",
            time: "Every 3–6 months",
            cost: "€30–80 per panel",
          },
          {
            n: 5,
            title: "Follow-up appointments",
            desc: "Frequency varies — most providers want to see you at 3 months, then 6 months once stable.",
            time: "Ongoing",
            cost: "€50–120/appointment",
            tip: "Consider switching to SNS for ongoing monitoring once you are stable, to reduce costs. This is possible and common.",
          },
        ],
      },
    ],
  },
  {
    id: "legal-name",
    labelKey: "resources:transHealthcare.path.legalName.label",
    sections: [
      {
        titleKey: "resources:transHealthcare.section.legalProcess",
        steps: [
          {
            n: 1,
            title: "Understand your rights",
            desc: "Under Lei 38/2018 (in force since 2019), any person over 18 can change their first name and gender marker on civil documents through self-declaration. No medical evidence, surgery, or psychiatric report is required. 16–17 year olds can apply with parental consent.",
            time: "Read first",
            cost: "Free to understand",
            tip: "ILGA Portugal has a free, detailed guide in PT and EN. Download it before you start.",
          },
          {
            n: 2,
            title: "Book an appointment at the Conservatória do Registo Civil",
            desc: 'You can do this online at agendamento.mj.pt or by phone. The Conservatória in Lisbon is at Rua Rodrigo da Fonseca 226. Ask for an appointment for "alteração de nome e sexo ao abrigo da Lei 38/2018".',
            time: "1–4 weeks to get appointment",
            cost: "Free",
          },
          {
            n: 3,
            title: "The appointment",
            desc: "You appear in person and make a declaration. You will need your Bilhete de Identidade or Cartão de Cidadão, NIF, and NISS. You declare your name and gender marker. No supporting documents are required.",
            time: "30–60 minutes",
            cost: "Free",
          },
          {
            n: 4,
            title: "Waiting period",
            desc: "There is a 1-month waiting period after the declaration, during which you can withdraw. After 1 month, the change is registered automatically. You will be notified by the Conservatória.",
            time: "1 month",
            cost: "Free",
            tip: "ILGA Portugal recommends using this period to prepare employers, doctors, and landlords for the change so everything updates together.",
          },
          {
            n: 5,
            title: "New documents",
            desc: "After registration: request a new Cartão de Cidadão at any Loja do Cidadão or at IRN. Also update: NIF, NISS, SNS records, passport (if needed), bank accounts, employer HR records.",
            time: "1–4 weeks for new CC",
            cost: "€15 for Cartão de Cidadão",
            tip: "Bring your name change certificate to every update — request multiple certified copies from the Conservatória at the time of registration.",
          },
        ],
      },
    ],
  },
  {
    id: "gender-marker",
    labelKey: "resources:transHealthcare.path.genderMarker.label",
    sections: [
      {
        titleKey: "resources:transHealthcare.section.genderMarkerChange",
        steps: [
          {
            n: 1,
            title: "Included in the Lei 38/2018 process",
            desc: "In Portugal, gender marker (M/F) change on civil documents is done in the same appointment as the legal name change — they are a single process. You do not need separate applications.",
            time: "Same as name change",
            cost: "Free",
            tip: "The Conservatória will update your birth registration to reflect your chosen gender marker. This flows to all other documents.",
          },
          {
            n: 2,
            title: "After the change: updating records",
            desc: "SNS records: contact your centro de saúde with your updated Cartão de Cidadão. Tax authority (AT): update via Portal das Finanças or in person. Social security (NISS): update at Segurança Social Direta online or in person.",
            time: "Days to weeks",
            cost: "Free",
          },
          {
            n: 3,
            title: "Passport and travel documents",
            desc: "Apply for a new passport after your Cartão de Cidadão is updated. Submit at any Loja do Cidadão or the Passport Office with your new CC and €65 fee. Urgent passport available for €100.",
            time: "1–4 weeks",
            cost: "€65–100",
            tip: "If you travel frequently, apply for the new passport as soon as your CC arrives — do not wait.",
          },
          {
            n: 4,
            title: "Non-binary or outside M/F",
            desc: "Portuguese law currently only provides for M and F markers on civil documents. Advocacy for X/non-binary markers is ongoing — ILGA Portugal is the best source for current status.",
            time: "Ongoing advocacy",
            cost: "N/A",
          },
        ],
      },
    ],
  },
  {
    id: "surgery",
    labelKey: "resources:transHealthcare.path.surgery.label",
    sections: [
      {
        titleKey: "resources:transHealthcare.section.surgeryInPortugal",
        steps: [
          {
            n: 1,
            title: "SNS pathway: via the gender clinic",
            desc: "Gender-affirming surgeries are available through the SNS at CHLC (Hospital de Santa Maria) following the gender clinic pathway. You must be in the SNS pathway and have been receiving HRT for a minimum period (typically 12 months for most surgeries).",
            time: "2–5+ years from referral",
            cost: "Free (SNS)",
            tip: "Waiting lists for surgery are very long. Register for the SNS pathway as early as possible even if surgery is not immediately your goal.",
          },
          {
            n: 2,
            title: "Psychiatric support letter",
            desc: "For surgery through the SNS, a letter from a psychiatrist or psychologist involved in your care is typically required. This is documentation, not gatekeeping — your gender clinic team provides it.",
            time: "Included in pathway",
            cost: "Free (SNS)",
          },
          {
            n: 3,
            title: "Private surgery in Portugal",
            desc: "Private gender-affirming surgery is available in Portugal from specialist plastic and urological surgeons. Costs range widely — ask ILGA Portugal for current surgeon recommendations and transparent pricing.",
            time: "Faster than SNS",
            cost: "€4,000–20,000+ depending on procedure",
            tip: "Some insurers in Portugal cover gender-affirming surgery — check your policy. ILGA Portugal has experience with insurance appeals.",
          },
          {
            n: 4,
            title: "Surgery abroad",
            desc: "Many community members access surgery in Spain (Barcelona, Madrid), Thailand, and Germany. ILGA Portugal can advise on reputable providers. Travel and recovery support may be available through mutual aid.",
            time: "Varies",
            cost: "Varies by country",
            tip: "The QueerPulse community has members with firsthand experience of surgery abroad. Post in the forum or contact us to be connected.",
          },
        ],
      },
    ],
  },
];

export const CONTACTS: { org: string; role: string; contact: string }[] = [
  {
    org: "ILGA Portugal",
    role: "Legal support, referrals, advocacy",
    contact: "ilga-portugal.pt · 213 887 615",
  },
  {
    org: "rede ex aequo",
    role: "Youth LGBTQ+ support (under 30)",
    contact: "rea.pt · apoio@rea.pt",
  },
  {
    org: "APAV",
    role: "Victim support, hate crimes",
    contact: "apav.pt · 116 006",
  },
  {
    org: "Linha SNS 24",
    role: "Health referrals, GP allocation",
    contact: "808 24 24 24",
  },
  {
    org: "CHLC Gender Clinic",
    role: "Hospital de Santa Maria, Lisboa",
    contact: "SNS referral required",
  },
];
