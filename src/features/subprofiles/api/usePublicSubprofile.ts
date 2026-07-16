import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getProfileSubprofiles,
  getSubprofileByHandle,
} from "./subprofiles.api";
import {
  publicSubprofileToView,
  type PublicSubprofileView,
} from "./subprofiles.adapters";
import {
  mockPublicByHandle,
  mockPublicByOwnerSlug,
  mockSubprofilesForProfile,
} from "../data/subprofiles.data";

/** Args discriminate the two public entry points: a standalone `/p/:handle`
 *  persona, or a linked persona nested under `/members/:slug/:subslug`. */
export type PublicSubprofileArgs =
  | { handle: string; ownerSlug?: undefined; subslug?: undefined }
  | { handle?: undefined; ownerSlug: string; subslug: string };

/** Public view of a subprofile — by global handle, or by owner slug + persona
 *  slug (the nested linked URL). Demo reads the mock registry with the same
 *  gating the backend applies; live calls the matching endpoint. */
export function usePublicSubprofile(args: PublicSubprofileArgs) {
  const { demoMode } = useDemoMode();
  const { handle, ownerSlug, subslug } = args;
  return useQuery<PublicSubprofileView | null>({
    queryKey: ["subprofile", "public", demoMode, handle, ownerSlug, subslug],
    enabled: Boolean(handle || (ownerSlug && subslug)),
    queryFn: async () => {
      if (handle) {
        if (demoMode) {
          const dto = mockPublicByHandle(handle);
          return dto ? publicSubprofileToView(dto) : null;
        }
        return publicSubprofileToView(await getSubprofileByHandle(handle));
      }
      if (!ownerSlug || !subslug) return null;
      if (demoMode) {
        const dto = mockPublicByOwnerSlug(ownerSlug, subslug);
        return dto ? publicSubprofileToView(dto) : null;
      }
      // Nested linked persona: the API lists an owner's linked+published personas;
      // find the one matching the slug in the URL.
      const list = await getProfileSubprofiles(ownerSlug);
      const dto = list.find((s) => s.slug === subslug);
      return dto ? publicSubprofileToView(dto) : null;
    },
  });
}

/** All of a member's linked + published personas (the main-profile "Also as…"
 *  block). Demo reads the mock registry; live calls GET /profiles/:slug/subprofiles. */
export function useProfileSubprofiles(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<PublicSubprofileView[]>({
    queryKey: ["subprofiles", "byProfile", demoMode, slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return [];
      const dtos = demoMode
        ? mockSubprofilesForProfile(slug)
        : await getProfileSubprofiles(slug);
      return dtos.map(publicSubprofileToView);
    },
  });
}
