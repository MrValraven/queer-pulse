import type { ReactNode } from "react";
import { useLanguagePreferenceSync } from "./api/useLanguagePreferenceSync";

/**
 * Mount point for the server-side interface-language sync (PRD-325). Holds no
 * state and renders no UI, in the shape of `PushPreviewMirrorProvider`: the
 * sync needs one app-wide owner that runs on every signed-in session, wherever
 * the member lands.
 */
export function LanguagePreferenceSyncProvider({
  children,
}: {
  children: ReactNode;
}) {
  useLanguagePreferenceSync();
  return <>{children}</>;
}
