import type { MemberRole } from "../auth/api/auth.api";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { galleryShotsOf } from "./directoryGalleryShots";
import type { DirectoryPlace } from "./directoryPlaces";

export interface ListingPhotoRepositionAccess {
  /** The listing ref the save routes address; null for fixture places in demo. */
  ref: string | null;
  slug: string;
  /** True when the save goes through the admin route. */
  asAdmin: boolean;
}

export interface RepositionAccessInput {
  isPreview: boolean;
  hasPhotos: boolean;
  isDemoMode: boolean;
  /** True when a member session exists; the demo member needs one to reposition. */
  isSignedIn: boolean;
  /** Ref of the viewer's own or co-managed listing matching this page. */
  ownerRef: string | undefined;
  role: MemberRole | null;
  /** Ref carried by the place itself, used to address the admin route. */
  placeRef: string | null | undefined;
  slug: string;
}

/**
 * Decides who sees the "Reposition photos" control (design: "Who can do it").
 * The checks read in this order: the read-only preview never shows it, a
 * listing with zero real photos has nothing to frame, the demo member is
 * treated as staff on fixture places once signed in (the precedent is
 * `ListingPreviewDrawer.tsx:36`), an owner or active co-manager uses the
 * member route, and an admin uses the admin route when the place carries a
 * ref. Moderators and the directory_moderator grant get no control.
 */
export function repositionAccessFor(
  input: RepositionAccessInput,
): ListingPhotoRepositionAccess | null {
  if (input.isPreview) return null;
  if (!input.hasPhotos) return null;
  if (input.isDemoMode) {
    if (!input.isSignedIn) return null;
    return { ref: input.ownerRef ?? null, slug: input.slug, asAdmin: false };
  }
  if (input.ownerRef) {
    return { ref: input.ownerRef, slug: input.slug, asAdmin: false };
  }
  if (input.role === "admin" && input.placeRef) {
    return { ref: input.placeRef, slug: input.slug, asAdmin: true };
  }
  return null;
}

/** Thin read of the auth and demo contexts feeding `repositionAccessFor`. */
export function useListingPhotoRepositionAccess(options: {
  place: DirectoryPlace;
  ownerRef: string | undefined;
  isPreview: boolean;
}): ListingPhotoRepositionAccess | null {
  const { role, loggedIn } = useAuth();
  const { demoMode } = useDemoMode();
  const { place, ownerRef, isPreview } = options;
  return repositionAccessFor({
    isPreview,
    hasPhotos: galleryShotsOf(place).length > 0,
    isDemoMode: demoMode,
    isSignedIn: loggedIn,
    ownerRef,
    role,
    placeRef: place.ref,
    slug: place.slug,
  });
}
