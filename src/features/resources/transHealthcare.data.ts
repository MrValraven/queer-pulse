/**
 * i18n Pattern A: every reader-facing string on this page resolves through a
 * `resources:` catalog key. Proper names (ILGA Portugal, APAV), phone numbers
 * and web addresses stay literal in `CONTACTS.org`.
 */
export interface Step {
  n: number;
  titleKey: string;
  descriptionKey: string;
  timeKey?: string;
  costKey?: string;
  tipKey?: string;
}

export interface Section {
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
            titleKey: "resources:transHealthcare.hrtSns.step1.title",
            descriptionKey:
              "resources:transHealthcare.hrtSns.step1.description",
            timeKey: "resources:transHealthcare.hrtSns.step1.time",
            costKey: "resources:transHealthcare.hrtSns.step1.cost",
            tipKey: "resources:transHealthcare.hrtSns.step1.tip",
          },
          {
            n: 2,
            titleKey: "resources:transHealthcare.hrtSns.step2.title",
            descriptionKey:
              "resources:transHealthcare.hrtSns.step2.description",
            timeKey: "resources:transHealthcare.hrtSns.step2.time",
            costKey: "resources:transHealthcare.hrtSns.step2.cost",
            tipKey: "resources:transHealthcare.hrtSns.step2.tip",
          },
          {
            n: 3,
            titleKey: "resources:transHealthcare.hrtSns.step3.title",
            descriptionKey:
              "resources:transHealthcare.hrtSns.step3.description",
            timeKey: "resources:transHealthcare.hrtSns.step3.time",
            costKey: "resources:transHealthcare.hrtSns.step3.cost",
          },
        ],
      },
      {
        titleKey: "resources:transHealthcare.section.genderClinic",
        steps: [
          {
            n: 4,
            titleKey: "resources:transHealthcare.hrtSns.step4.title",
            descriptionKey:
              "resources:transHealthcare.hrtSns.step4.description",
            timeKey: "resources:transHealthcare.hrtSns.step4.time",
            costKey: "resources:transHealthcare.hrtSns.step4.cost",
            tipKey: "resources:transHealthcare.hrtSns.step4.tip",
          },
          {
            n: 5,
            titleKey: "resources:transHealthcare.hrtSns.step5.title",
            descriptionKey:
              "resources:transHealthcare.hrtSns.step5.description",
            timeKey: "resources:transHealthcare.hrtSns.step5.time",
            costKey: "resources:transHealthcare.hrtSns.step5.cost",
          },
          {
            n: 6,
            titleKey: "resources:transHealthcare.hrtSns.step6.title",
            descriptionKey:
              "resources:transHealthcare.hrtSns.step6.description",
            timeKey: "resources:transHealthcare.hrtSns.step6.time",
            costKey: "resources:transHealthcare.hrtSns.step6.cost",
            tipKey: "resources:transHealthcare.hrtSns.step6.tip",
          },
        ],
      },
      {
        titleKey: "resources:transHealthcare.section.ongoingCare",
        steps: [
          {
            n: 7,
            titleKey: "resources:transHealthcare.hrtSns.step7.title",
            descriptionKey:
              "resources:transHealthcare.hrtSns.step7.description",
            timeKey: "resources:transHealthcare.hrtSns.step7.time",
            costKey: "resources:transHealthcare.hrtSns.step7.cost",
            tipKey: "resources:transHealthcare.hrtSns.step7.tip",
          },
          {
            n: 8,
            titleKey: "resources:transHealthcare.hrtSns.step8.title",
            descriptionKey:
              "resources:transHealthcare.hrtSns.step8.description",
            timeKey: "resources:transHealthcare.hrtSns.step8.time",
            costKey: "resources:transHealthcare.hrtSns.step8.cost",
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
            titleKey: "resources:transHealthcare.hrtPrivate.step1.title",
            descriptionKey:
              "resources:transHealthcare.hrtPrivate.step1.description",
            timeKey: "resources:transHealthcare.hrtPrivate.step1.time",
            costKey: "resources:transHealthcare.hrtPrivate.step1.cost",
            tipKey: "resources:transHealthcare.hrtPrivate.step1.tip",
          },
          {
            n: 2,
            titleKey: "resources:transHealthcare.hrtPrivate.step2.title",
            descriptionKey:
              "resources:transHealthcare.hrtPrivate.step2.description",
            timeKey: "resources:transHealthcare.hrtPrivate.step2.time",
            costKey: "resources:transHealthcare.hrtPrivate.step2.cost",
            tipKey: "resources:transHealthcare.hrtPrivate.step2.tip",
          },
          {
            n: 3,
            titleKey: "resources:transHealthcare.hrtPrivate.step3.title",
            descriptionKey:
              "resources:transHealthcare.hrtPrivate.step3.description",
            timeKey: "resources:transHealthcare.hrtPrivate.step3.time",
            costKey: "resources:transHealthcare.hrtPrivate.step3.cost",
          },
        ],
      },
      {
        titleKey: "resources:transHealthcare.section.ongoing",
        steps: [
          {
            n: 4,
            titleKey: "resources:transHealthcare.hrtPrivate.step4.title",
            descriptionKey:
              "resources:transHealthcare.hrtPrivate.step4.description",
            timeKey: "resources:transHealthcare.hrtPrivate.step4.time",
            costKey: "resources:transHealthcare.hrtPrivate.step4.cost",
          },
          {
            n: 5,
            titleKey: "resources:transHealthcare.hrtPrivate.step5.title",
            descriptionKey:
              "resources:transHealthcare.hrtPrivate.step5.description",
            timeKey: "resources:transHealthcare.hrtPrivate.step5.time",
            costKey: "resources:transHealthcare.hrtPrivate.step5.cost",
            tipKey: "resources:transHealthcare.hrtPrivate.step5.tip",
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
            titleKey: "resources:transHealthcare.legalName.step1.title",
            descriptionKey:
              "resources:transHealthcare.legalName.step1.description",
            timeKey: "resources:transHealthcare.legalName.step1.time",
            costKey: "resources:transHealthcare.legalName.step1.cost",
            tipKey: "resources:transHealthcare.legalName.step1.tip",
          },
          {
            n: 2,
            titleKey: "resources:transHealthcare.legalName.step2.title",
            descriptionKey:
              "resources:transHealthcare.legalName.step2.description",
            timeKey: "resources:transHealthcare.legalName.step2.time",
            costKey: "resources:transHealthcare.legalName.step2.cost",
          },
          {
            n: 3,
            titleKey: "resources:transHealthcare.legalName.step3.title",
            descriptionKey:
              "resources:transHealthcare.legalName.step3.description",
            timeKey: "resources:transHealthcare.legalName.step3.time",
            costKey: "resources:transHealthcare.legalName.step3.cost",
          },
          {
            n: 4,
            titleKey: "resources:transHealthcare.legalName.step4.title",
            descriptionKey:
              "resources:transHealthcare.legalName.step4.description",
            timeKey: "resources:transHealthcare.legalName.step4.time",
            costKey: "resources:transHealthcare.legalName.step4.cost",
            tipKey: "resources:transHealthcare.legalName.step4.tip",
          },
          {
            n: 5,
            titleKey: "resources:transHealthcare.legalName.step5.title",
            descriptionKey:
              "resources:transHealthcare.legalName.step5.description",
            timeKey: "resources:transHealthcare.legalName.step5.time",
            costKey: "resources:transHealthcare.legalName.step5.cost",
            tipKey: "resources:transHealthcare.legalName.step5.tip",
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
            titleKey: "resources:transHealthcare.genderMarker.step1.title",
            descriptionKey:
              "resources:transHealthcare.genderMarker.step1.description",
            timeKey: "resources:transHealthcare.genderMarker.step1.time",
            costKey: "resources:transHealthcare.genderMarker.step1.cost",
            tipKey: "resources:transHealthcare.genderMarker.step1.tip",
          },
          {
            n: 2,
            titleKey: "resources:transHealthcare.genderMarker.step2.title",
            descriptionKey:
              "resources:transHealthcare.genderMarker.step2.description",
            timeKey: "resources:transHealthcare.genderMarker.step2.time",
            costKey: "resources:transHealthcare.genderMarker.step2.cost",
          },
          {
            n: 3,
            titleKey: "resources:transHealthcare.genderMarker.step3.title",
            descriptionKey:
              "resources:transHealthcare.genderMarker.step3.description",
            timeKey: "resources:transHealthcare.genderMarker.step3.time",
            costKey: "resources:transHealthcare.genderMarker.step3.cost",
            tipKey: "resources:transHealthcare.genderMarker.step3.tip",
          },
          {
            n: 4,
            titleKey: "resources:transHealthcare.genderMarker.step4.title",
            descriptionKey:
              "resources:transHealthcare.genderMarker.step4.description",
            timeKey: "resources:transHealthcare.genderMarker.step4.time",
            costKey: "resources:transHealthcare.genderMarker.step4.cost",
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
            titleKey: "resources:transHealthcare.surgery.step1.title",
            descriptionKey:
              "resources:transHealthcare.surgery.step1.description",
            timeKey: "resources:transHealthcare.surgery.step1.time",
            costKey: "resources:transHealthcare.surgery.step1.cost",
            tipKey: "resources:transHealthcare.surgery.step1.tip",
          },
          {
            n: 2,
            titleKey: "resources:transHealthcare.surgery.step2.title",
            descriptionKey:
              "resources:transHealthcare.surgery.step2.description",
            timeKey: "resources:transHealthcare.surgery.step2.time",
            costKey: "resources:transHealthcare.surgery.step2.cost",
          },
          {
            n: 3,
            titleKey: "resources:transHealthcare.surgery.step3.title",
            descriptionKey:
              "resources:transHealthcare.surgery.step3.description",
            timeKey: "resources:transHealthcare.surgery.step3.time",
            costKey: "resources:transHealthcare.surgery.step3.cost",
            tipKey: "resources:transHealthcare.surgery.step3.tip",
          },
          {
            n: 4,
            titleKey: "resources:transHealthcare.surgery.step4.title",
            descriptionKey:
              "resources:transHealthcare.surgery.step4.description",
            timeKey: "resources:transHealthcare.surgery.step4.time",
            costKey: "resources:transHealthcare.surgery.step4.cost",
            tipKey: "resources:transHealthcare.surgery.step4.tip",
          },
        ],
      },
    ],
  },
];

/**
 * `org` stays literal: these are the organisations' own names. `roleKey` and
 * `contactKey` resolve through the catalog, and the PT values for the pure
 * phone/web-address contacts are deliberately identical to the EN ones.
 */
export interface Contact {
  org: string;
  roleKey: string;
  contactKey: string;
}

export const CONTACTS: Contact[] = [
  {
    org: "ILGA Portugal",
    roleKey: "resources:transHealthcare.contact.ilga.role",
    contactKey: "resources:transHealthcare.contact.ilga.contact",
  },
  {
    org: "rede ex aequo",
    roleKey: "resources:transHealthcare.contact.redeExAequo.role",
    contactKey: "resources:transHealthcare.contact.redeExAequo.contact",
  },
  {
    org: "APAV",
    roleKey: "resources:transHealthcare.contact.apav.role",
    contactKey: "resources:transHealthcare.contact.apav.contact",
  },
  {
    org: "Linha SNS 24",
    roleKey: "resources:transHealthcare.contact.sns24.role",
    contactKey: "resources:transHealthcare.contact.sns24.contact",
  },
  {
    org: "CHULN Gender Clinic",
    roleKey: "resources:transHealthcare.contact.chuln.role",
    contactKey: "resources:transHealthcare.contact.chuln.contact",
  },
];
