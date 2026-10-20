import { useStudioAccess } from "./api/useStudioAccess";
import type { StudioAccountMenuItem } from "./studioAccountMenu.data";
import { useIsStudioStaff } from "./useIsStudioStaff";
import { useStudioShowcase } from "./useStudioShowcase";

/** Who sees which menu row: everyone; artist rows need an uploadable
 *  persona (or the showcase); showcase rows only the showcase; staff rows
 *  Moderators and Admins. */
export function useStudioMenuItemFilter(): {
  isItemVisible: (item: StudioAccountMenuItem) => boolean;
} {
  const isShowcase = useStudioShowcase();
  const { uploadablePersonas } = useStudioAccess();
  const isStaff = useIsStudioStaff();
  const hasArtistPages = uploadablePersonas.length > 0;
  const isItemVisible = (item: StudioAccountMenuItem) =>
    item.audience === "everyone" ||
    (item.audience === "artist" && (hasArtistPages || isShowcase)) ||
    (item.audience === "showcase" && isShowcase) ||
    (item.audience === "staff" && isStaff);
  return { isItemVisible };
}
