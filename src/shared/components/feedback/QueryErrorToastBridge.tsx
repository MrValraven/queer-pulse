import { useCallback, useEffect } from "react";
import { useToast } from "./useToast";
import { useTranslation } from "../../i18n/useTranslation";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  setQueryErrorToastEmitter,
  setQueryErrorDemoMode,
  setQueryErrorTranslator,
} from "../../api/errorHandling";

/**
 * Bridges the live toast function + demo flag into the React Query cache-level
 * error handlers, which run outside React and so can't call hooks themselves.
 * Mirrors the AuthErrorToast / setOnAuthLost pattern. Renders nothing.
 */
export function QueryErrorToastBridge() {
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();

  // `t()` returns the key itself when the catalog has no entry for it, which
  // would put a raw `shared:apiError.server` in front of a member. Fall back to
  // the English the handler carries in that case, so a key that has not shipped
  // yet degrades to the old copy instead of to a debug string.
  const translate = useCallback(
    (key: string, fallback: string) => {
      const translated = t(key);
      return translated === key ? fallback : translated;
    },
    [t],
  );

  useEffect(() => {
    setQueryErrorToastEmitter(showToast);
    return () => setQueryErrorToastEmitter(null);
  }, [showToast]);

  useEffect(() => {
    setQueryErrorTranslator(translate);
    return () => setQueryErrorTranslator(null);
  }, [translate]);

  useEffect(() => {
    setQueryErrorDemoMode(demoMode);
  }, [demoMode]);

  return null;
}
