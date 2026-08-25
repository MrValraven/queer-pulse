import type { ListingDraft } from "../listBusiness.data";

/** One "find you online" contact row: which social field it edits, the input
 *  type, its placeholder key, and the format-error key (empty when the field
 *  has no format to get wrong). */
export interface SocialFieldRow {
  key: keyof ListingDraft["social"];
  type: string;
  placeholderKey: string;
  errKey: string;
}

export const SOCIAL_FIELDS: SocialFieldRow[] = [
  {
    key: "instagram",
    type: "text",
    placeholderKey: "marketing:listBusiness.social.instagram.placeholder",
    errKey: "",
  },
  {
    key: "website",
    type: "url",
    placeholderKey: "marketing:listBusiness.social.website.placeholder",
    errKey: "marketing:listBusiness.social.website.err",
  },
  {
    key: "email",
    type: "email",
    placeholderKey: "marketing:listBusiness.social.email.placeholder",
    errKey: "marketing:listBusiness.social.email.err",
  },
  {
    key: "phone",
    type: "tel",
    placeholderKey: "marketing:listBusiness.social.phone.placeholder",
    errKey: "marketing:listBusiness.social.phone.err",
  },
];
