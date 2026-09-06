import { WhoSeesWhatSheet } from "./WhoSeesWhatSheet";
import { AccountDataSheet } from "./AccountDataSheet";
import type { ProfilePageSheets } from "./useProfilePageSheets";

/**
 * The owner-only side sheets on `/members/:slug`: "Who sees what" and "Your
 * data". `SideSheet` already portals to `document.body`, so where this sits in
 * the page tree does not affect layout.
 *
 * Both are opened from `ProfileSettingsMenu`, which the desktop hero and the
 * mobile header each render for the owner. A `!useMobileLayout` guard used to
 * sit around them, and that was what put every setting inside them out of
 * reach on a phone; nothing here may reintroduce one.
 *
 * Lifted out of `ProfilePage` for the same reason `useProfilePageSheets` was:
 * the page component has to stay inside the repo's 200-line rule.
 */
export function ProfileOwnerSheets({
  sheets,
  ownerSlug,
}: {
  sheets: ProfilePageSheets;
  ownerSlug: string;
}) {
  return (
    <>
      {sheets.isWhoSeesWhatOpen && (
        <WhoSeesWhatSheet onClose={sheets.closeWhoSeesWhat} />
      )}
      {sheets.isAccountDataOpen && (
        <AccountDataSheet
          onClose={sheets.closeAccountData}
          ownerSlug={ownerSlug}
        />
      )}
    </>
  );
}
