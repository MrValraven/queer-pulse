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
 * TODO (maintainer): replace EVERY placeholder below with the real, registered
 * legal-entity details before public launch. These values are interpolated
 * verbatim into the Imprint copy (both EN and PT) — nothing here is legally
 * verified, and the `imprint.operator.todo` line stays visible until the
 * registration number and address are confirmed.
 */
export const IMPRINT_ENTITY = {
  /** TODO: confirm the exact registered association name. */
  legalName: "Associação QueerPulse",
  /** TODO: the NIPC / legal registration number. */
  registryNumber: "TODO — NIPC / registration number",
  /** TODO: the full registered address. */
  registeredAddress: "TODO — registered address, Lisboa, Portugal",
  /** The general contact mailbox (already on the canonical .pt domain). */
  email: "hello@queerpulse.pt",
  /** TODO: the person legally responsible for the site's content. */
  representative: "TODO — legal representative name",
  /** TODO: hosting provider legal name + address. */
  hostingProvider: "TODO — hosting provider name and address",
};
