/** A dialable number: digits and a leading plus, nothing else. */
export const telHrefOf = (phone: string): string =>
  `tel:${phone.replace(/[^\d+]/g, "")}`;

/** The address an email link opens a draft to. */
export const mailtoHrefOf = (email: string): string => `mailto:${email}`;
