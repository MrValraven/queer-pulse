import { useLocation, useNavigate } from "react-router-dom";
import { GUEST_PREVIEW_PARAM, type GuestPreviewRole } from "./guestPreview";

/**
 * Marks the history entry the host menu pushes to open a preview. Exit can
 * then step Back onto the host view it came from, so the history keeps one
 * host entry and one Back press leaves the page.
 */
const GUEST_PREVIEW_ENTRY_KEY = "isGuestPreviewEntry";

function isGuestPreviewEntry(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>)[GUEST_PREVIEW_ENTRY_KEY] === true
  );
}

/**
 * Every way in, across and out of a guest preview: the host menu enters it
 * on a new history entry, the bar's switch rewrites that entry in place, and
 * Exit goes Back to the host view when the menu opened the preview, or
 * rewrites the URL without `viewAs` when the preview was reached any other
 * way (a bookmarked link).
 */
export function useGuestPreviewNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  // Whatever the history entry carries; typed `any` by the router.
  const historyState: unknown = location.state;

  const pathWithRole = (role: GuestPreviewRole | null) => {
    const nextParams = new URLSearchParams(location.search);
    if (role === null) nextParams.delete(GUEST_PREVIEW_PARAM);
    else nextParams.set(GUEST_PREVIEW_PARAM, role);
    const search = nextParams.toString();
    return { pathname: location.pathname, search: search ? `?${search}` : "" };
  };

  const enterPreview = () => {
    const currentState: object =
      typeof historyState === "object" && historyState !== null
        ? historyState
        : {};
    void navigate(pathWithRole("member"), {
      state: { ...currentState, [GUEST_PREVIEW_ENTRY_KEY]: true },
    });
  };

  const showAs = (role: GuestPreviewRole) => {
    void navigate(pathWithRole(role), { replace: true, state: historyState });
  };

  const exitPreview = () => {
    if (isGuestPreviewEntry(historyState)) {
      void navigate(-1);
      return;
    }
    void navigate(pathWithRole(null), { replace: true, state: historyState });
  };

  return { enterPreview, showAs, exitPreview };
}
