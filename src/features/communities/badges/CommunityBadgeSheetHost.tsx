import { AnimatePresence } from "motion/react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CommunityBadgeSheet } from "./CommunityBadgeSheet";
import {
  BADGE_FOCUS_PARAM,
  readBadgeSheetParams,
  withBadgeSheetClosed,
  wasBadgeSheetPushed,
  withBadgeSheetOpen,
  type BadgeSheetTab,
} from "./communityBadgeSheet.model";

export interface CommunityBadgeSheetHostProps {
  slug: string | undefined;
  communityName: string;
  isSpace: boolean;
}

/**
 * Mounts the badge sheet whenever the URL asks for it (`?badges=open` or
 * `?badges=gifts`), so a notification, the sidebar card and the hero button
 * all open it by link. Spaces have no badges, so the param is ignored there.
 * Switching tabs replaces the history entry, so Back never steps through the
 * sheet's tabs. Closing steps back one entry when the card or hero button
 * pushed the sheet (they mark it in the router state), so one Back is never
 * a no-op; a deep link has no marker and closes by replacing.
 */
export function CommunityBadgeSheetHost({
  slug,
  communityName,
  isSpace,
}: CommunityBadgeSheetHostProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState: unknown = location.state;
  const wasPushed = wasBadgeSheetPushed(locationState);
  const { isOpen, tab, focusBadgeId } = readBadgeSheetParams(searchParams);
  const shouldShowSheet = Boolean(slug) && !isSpace && isOpen;

  // A tab switch drops the link's focus id: it has done its job once, and a
  // round trip through Gifts would otherwise scroll to the same badge again.
  const changeTab = (nextTab: BadgeSheetTab) => {
    setSearchParams(
      (current) => {
        const next = withBadgeSheetOpen(current, nextTab);
        next.delete(BADGE_FOCUS_PARAM);
        return next;
      },
      { replace: true, state: locationState },
    );
  };
  const closeSheet = () => {
    if (wasPushed) {
      void navigate(-1);
      return;
    }
    setSearchParams((current) => withBadgeSheetClosed(current), {
      replace: true,
    });
  };

  return (
    <AnimatePresence>
      {shouldShowSheet && slug && (
        <CommunityBadgeSheet
          key="community-badge-sheet"
          slug={slug}
          communityName={communityName}
          tab={tab}
          focusBadgeId={focusBadgeId}
          onTabChange={changeTab}
          onClose={closeSheet}
        />
      )}
    </AnimatePresence>
  );
}
