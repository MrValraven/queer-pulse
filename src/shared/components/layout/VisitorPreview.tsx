import { useMemo, type ReactNode } from "react";
import {
  AuthContext,
  useAuth,
  type AuthContextValue,
} from "../../../app/providers/authContext";
import {
  VisitorPreviewContext,
  useIsVisitorPreviewRequested,
} from "./visitorPreviewContext";

/** The session fields a signed-out visitor sees. The functions stay real. */
const SIGNED_OUT_SESSION: Pick<
  AuthContextValue,
  | "loggedIn"
  | "checking"
  | "preparing"
  | "user"
  | "status"
  | "role"
  | "staffRoles"
  | "authError"
> = {
  loggedIn: false,
  checking: false,
  preparing: false,
  user: null,
  status: null,
  role: null,
  staffRoles: [],
  authError: null,
};

/**
 * Renders a landing page as a signed-out visitor sees it when the visitor
 * preview is requested (see `visitorPreviewContext.ts`). Its children read a
 * signed-out `useAuth()` and `useIsInVisitorPreview()` reads true.
 *
 * Both providers always render, with the real session passed through when no
 * preview is asked for. The tree keeps its shape when the flag flips (live
 * mode settles `/auth/me` after the first paint), so the page re-renders in
 * place and keeps its scroll, focus and fetched data.
 */
export function VisitorPreview({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const isRequested = useIsVisitorPreviewRequested();
  const value = useMemo<AuthContextValue>(
    () => (isRequested ? { ...auth, ...SIGNED_OUT_SESSION } : auth),
    [auth, isRequested],
  );
  return (
    <AuthContext.Provider value={value}>
      <VisitorPreviewContext.Provider value={isRequested}>
        {children}
      </VisitorPreviewContext.Provider>
    </AuthContext.Provider>
  );
}
