import type { OwnedPartnerDTO, Region } from "./api/partners.api";
import type { UpdatePartnerProfileDto } from "./api/partners.api";

/**
 * Everything a partner may change about its own profile, flattened into one
 * editable draft (PRD-263).
 *
 * Flat and all-strings (bar `region` and `tags`) on purpose: the editor is a
 * form, the wire shape is not, and keeping the translation between them in one
 * named place is what stops "an emptied phone field" meaning `""` on one save
 * and `null` on the next.
 */
export interface PartnerProfileDraft {
  city: string;
  region: Region;
  regionLabel: string;
  logo: string;
  tagline: string;
  desc: string;
  /** One paragraph per blank-line-separated block, as the public page renders
   *  `about`. */
  about: string;
  funding: string;
  tags: Set<string>;
  phone: string;
  phoneNote: string;
  email: string;
  website: string;
  address: string;
}

export function toPartnerProfileDraft(
  partner: OwnedPartnerDTO,
): PartnerProfileDraft {
  return {
    city: partner.city,
    region: partner.region,
    regionLabel: partner.regionLabel,
    logo: partner.logo,
    tagline: partner.tagline,
    desc: partner.desc,
    about: partner.about.join("\n\n"),
    funding: partner.funding,
    tags: new Set(partner.tags),
    phone: partner.contact.phone ?? "",
    phoneNote: partner.contact.phoneNote ?? "",
    email: partner.contact.email ?? "",
    website: partner.contact.website ?? "",
    address: partner.contact.address ?? "",
  };
}

export function toUpdatePartnerProfileDto(
  draft: PartnerProfileDraft,
): UpdatePartnerProfileDto {
  return {
    city: draft.city.trim(),
    region: draft.region,
    regionLabel: draft.regionLabel.trim(),
    logo: draft.logo.trim(),
    tagline: draft.tagline.trim(),
    desc: draft.desc.trim(),
    about: draft.about
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0),
    funding: draft.funding.trim(),
    tags: Array.from(draft.tags),
    // `contact` REPLACES the whole block server-side — it is one document the
    // backend always stores fully populated — so every subfield rides along on
    // every save, and an emptied field is stored as null rather than as an
    // empty string every read site would then have to treat as empty.
    contact: {
      phone: draft.phone.trim() || null,
      phoneNote: draft.phoneNote.trim() || null,
      email: draft.email.trim() || null,
      website: draft.website.trim() || null,
      address: draft.address.trim() || null,
    },
  };
}
