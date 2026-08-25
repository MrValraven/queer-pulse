import { useMemo } from "react";
import {
  allSocialsValid,
  anyDayOpen,
  emailValid,
  hoursExceptionsValid,
  hoursValid,
  ANCHOR,
  PHOTO_KEYS,
  type ListingDraft,
  type MissingField,
} from "./listBusiness.data";
import { servicesValid } from "./listingServices.data";

/** A still-missing item + the DOM anchor its chip jumps to. Holds the
 * catalog key, not the resolved string, so the chip label follows the
 * active language without this hook needing `t`. */
function add(list: MissingField[], labelKey: string, anchor: string) {
  list.push({ labelKey, anchor });
}

/**
 * Per-step "what's still needed" gating, kept out of `useListingForm` so that
 * hook stays about the draft's state rather than its validation rules.
 *
 * Requirements branch on the chosen path (item #2). A CLAIM (you own/run the
 * place) is held to the full bar. A SUGGEST (a regular recommending a place
 * they don't run) only has to give what a stranger can honestly know — name,
 * category, neighbourhood, where it is, and a one-line why — so the owner
 * detail, hours, price, tagline and photos never block the submit. The
 * outing/guide consents gate both paths regardless.
 */
export function useListingFormMissing(
  draft: ListingDraft,
): Record<number, MissingField[]> {
  return useMemo(() => {
    const isClaim = draft.path === "claim";
    /* A CO-MANAGER never sees the owner's own fields and never sends them, so
       they can never fill them in either. Requiring them would leave the save
       bar permanently blocked on inputs that are not on the page. `ownerRole`
       is not among them: it describes the business, so it stays required. */
    const isOwnerEditing = draft.managementRole !== "co_manager";

    const s0: MissingField[] = [];
    if (!draft.path)
      add(s0, "marketing:listBusiness.missing.path", ANCHOR.path);

    const s1: MissingField[] = [];
    if (!draft.name.trim())
      add(s1, "marketing:listBusiness.missing.name", ANCHOR.name);
    if (!draft.cats.length)
      add(s1, "marketing:listBusiness.missing.cats", ANCHOR.cats);
    // Neighbourhood is optional for an online-only business (no physical area).
    if (!draft.online && !draft.hood)
      add(s1, "marketing:listBusiness.missing.hood", ANCHOR.hood);
    if (isClaim && !draft.badge)
      add(s1, "marketing:listBusiness.missing.badge", ANCHOR.badge);
    if (isClaim && !draft.price)
      add(s1, "marketing:listBusiness.missing.price", ANCHOR.price);
    if (!draft.blurb.trim())
      add(s1, "marketing:listBusiness.missing.blurb", ANCHOR.blurb);
    // Services are optional, so this only fires when a row the owner STARTED
    // is still missing its name or its price — the same "finish what you began"
    // shape the socials chip has, never a demand for a price list.
    if (!servicesValid(draft.services ?? []))
      add(s1, "marketing:listBusiness.missing.services", ANCHOR.services);

    const s2: MissingField[] = [];
    if (isClaim && !draft.tagline.trim())
      add(s2, "marketing:listBusiness.missing.tagline", ANCHOR.tagline);
    if (!draft.whatItIs.some((line) => line.text.trim()))
      add(s2, "marketing:listBusiness.missing.whatItIs", ANCHOR.whatItIs);

    const s3: MissingField[] = [];
    // An online-only business has no physical location, so neither an address
    // nor a resolved pin is required. Both paths still need them otherwise.
    if (!draft.online && !draft.address.trim())
      add(s3, "marketing:listBusiness.missing.address", ANCHOR.address);
    if (!draft.online && (draft.latitude === null || draft.longitude === null))
      add(s3, "marketing:listBusiness.missing.pin", ANCHOR.address);
    // An online-only business has no hours editor to fill in, so neither an
    // open day nor a well-formed interval is required.
    if (!draft.online && isClaim && !anyDayOpen(draft.hours))
      add(s3, "marketing:listBusiness.missing.hours", ANCHOR.hours);
    if (!draft.online && !hoursValid(draft.hours))
      add(s3, "marketing:listBusiness.missing.hoursInvalid", ANCHOR.hours);
    // Dated overrides are optional, so this only fires when one that EXISTS is
    // malformed — the same "fix the format" shape the socials chip has.
    if (!hoursExceptionsValid(draft.hoursExceptions ?? []))
      add(
        s3,
        "marketing:listBusiness.missing.hoursExceptionsInvalid",
        ANCHOR.hoursExceptions,
      );
    // Socials are optional; this only fires when a filled one is malformed, so
    // the chip reads "fix the format", not "add socials" (item #10).
    if (!allSocialsValid(draft.social))
      add(s3, "marketing:listBusiness.missing.socialFormat", ANCHOR.social);

    const s4: MissingField[] = [];
    if (isClaim && isOwnerEditing && !draft.rel)
      add(s4, "marketing:listBusiness.missing.rel", ANCHOR.rel);
    if (isClaim && isOwnerEditing && !draft.ownerName.trim())
      add(s4, "marketing:listBusiness.missing.ownerName", ANCHOR.ownerName);
    if (isClaim && !draft.ownerRole.trim())
      add(s4, "marketing:listBusiness.missing.ownerRole", ANCHOR.ownerRole);
    if (isClaim && isOwnerEditing && !emailValid(draft.contactEmail))
      add(
        s4,
        "marketing:listBusiness.missing.contactEmail",
        ANCHOR.contactEmail,
      );
    // Accessibility: any photo that's present needs alt text, on both paths
    // (item #8). An empty slot never blocks.
    const photoNeedsAlt = PHOTO_KEYS.some(
      (key) => draft.photos[key].trim() && !draft.alt[key].trim(),
    );
    if (photoNeedsAlt)
      add(s4, "marketing:listBusiness.missing.alt", ANCHOR.photos);

    const s5: MissingField[] = [];
    if (isOwnerEditing && (!draft.consentOuting || !draft.consentGuide))
      add(s5, "marketing:listBusiness.missing.consent", ANCHOR.consent);
    // The affirming baseline is the condition of being listed, so the submit
    // stays out of reach until the submitter agrees to it. An existing listing
    // agreed when it was created, so this never blocks an owner's edit.
    if (!draft.affirmingBaselineAccepted)
      add(
        s5,
        "marketing:listBusiness.missing.affirmingBaseline",
        ANCHOR.affirmingBaseline,
      );

    const perStep: Record<number, MissingField[]> = {
      0: s0,
      1: s1,
      2: s2,
      3: s3,
      4: s4,
      5: s5,
    };
    return perStep;
  }, [draft]);
}
