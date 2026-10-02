import type { ListingDraft } from "../marketing/listBusiness/listBusiness.data";

/**
 * Demo-only business halves of the drafts in `ADMIN_LISTING_DRAFTS`, keyed by
 * draft id, shaped like `GET /admin/listing-drafts/:id`'s `payload`. Like the
 * server, they carry none of the member's own answers (see
 * `MEMBER_ONLY_DRAFT_KEYS`), and they are fabricated, so live mode never reads
 * them.
 */
export const ADMIN_LISTING_DRAFT_PAYLOADS: Record<
  string,
  Partial<ListingDraft>
> = {
  "listing-draft-0004": {
    name: "Tasca da Graça",
    cats: ["food"],
    hood: "Graça",
    price: "€",
    blurb: "Petiscos, vinho da casa and a long table for whoever turns up.",
    tagline: "Your table at the top of the hill",
    tags: ["Petiscos", "Natural wine"],
    langs: ["Português", "English"],
    address: "Largo da Graça 12, Lisboa",
    social: {
      instagram: "tascadagraca",
      website: "",
      email: "",
      phone: "",
    },
  },
  "listing-draft-0003": {
    name: "Estúdio Lilás",
    cats: ["design"],
    hood: "Arroios",
    price: "€€",
    blurb: "Risograph printing and zines, by appointment.",
  },
  "listing-draft-0002": {},
  "listing-draft-0001": {
    name: "Barbearia Norte",
    cats: ["grooming"],
    hood: "Intendente",
    price: "€",
    blurb: "Gender-neutral cuts, priced by time, not by gender.",
    tags: ["Walk-ins", "Fades"],
    address: "Rua do Benformoso 40, Lisboa",
  },
};
