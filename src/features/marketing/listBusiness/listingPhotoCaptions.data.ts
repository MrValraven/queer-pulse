import type { PhotoKey } from "./listBusiness.data";
import type { ListingKind } from "./listingMobile.data";

const GALLERY_KEY = "marketing:listBusiness.step4.gallery";

/** Both detail slots share one caption per kind; the second out-and-about
 *  slot words its own so the two prompts differ. */
const DETAIL_CAPTION_KEYS: Record<ListingKind, string> = {
  place: `${GALLERY_KEY}.detail`,
  online: `${GALLERY_KEY}.detailOnline`,
  mobile: `${GALLERY_KEY}.detailMobile`,
};

/**
 * The prompt an empty photo slot shows, for each kind: a space for a place,
 * a product or a workspace online, and the work and the people for an
 * out-and-about listing. The wizard's gallery and the full-page preview read
 * the same captions.
 */
export const PHOTO_CAPTION_KEYS: Record<
  PhotoKey,
  Record<ListingKind, string>
> = {
  wide: {
    place: `${GALLERY_KEY}.wide`,
    online: `${GALLERY_KEY}.wideOnline`,
    mobile: `${GALLERY_KEY}.wideMobile`,
  },
  d1: DETAIL_CAPTION_KEYS,
  d2: {
    ...DETAIL_CAPTION_KEYS,
    mobile: `${GALLERY_KEY}.detail2Mobile`,
  },
  vibe: {
    place: `${GALLERY_KEY}.vibe`,
    online: `${GALLERY_KEY}.vibeOnline`,
    mobile: `${GALLERY_KEY}.vibeMobile`,
  },
};
