/** Table-of-contents rows for the Imprint / Legal Notice page (mirrors TermsPage.data). */
export const IMPRINT_TOC = [
  { id: "operator", titleKey: "imprint.operator.title" },
  { id: "contact", titleKey: "imprint.contact.title" },
  { id: "representation", titleKey: "imprint.representation.title" },
  { id: "hosting", titleKey: "imprint.hosting.title" },
  { id: "jurisdiction", titleKey: "imprint.jurisdiction.title" },
  { id: "disputes", titleKey: "imprint.disputes.title" },
];

/**
 * QueerPulse is currently run by a group of volunteers with no registered legal
 * entity, so the Imprint copy no longer names a company, registration number,
 * address, or legal representative. If a legal entity is ever registered, add
 * those fields back here and reintroduce the matching sections in
 * `ImprintPage.tsx` and the `imprint.*` copy.
 */
export const IMPRINT_ENTITY = {
  /** The general contact mailbox. */
  email: "hello@queerpulse.com",
};
