import type { ReactNode } from "react";
import { useReauthCompletion } from "../../features/settings/api/useReauthToken";

/**
 * Pure pass-through — exists only to run `useReauthCompletion()` at the right
 * spot in the provider tree: inside both `I18nProvider` (needs `t()`) and
 * `ToastProvider` (needs `useToast()`), which `AuthProvider` itself sits
 * above. Picks up a completed step-up reauth OAuth round trip once per app
 * load and toasts the outcome — see `useReauthToken.ts`.
 */
export function ReauthCompletionProvider({
  children,
}: {
  children: ReactNode;
}) {
  useReauthCompletion();
  return children;
}
