import { useEffect } from "react";
import { useToast } from "./useToast";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  setQueryErrorToastEmitter,
  setQueryErrorDemoMode,
} from "../../api/errorHandling";

/**
 * Bridges the live toast function + demo flag into the React Query cache-level
 * error handlers, which run outside React and so can't call hooks themselves.
 * Mirrors the AuthErrorToast / setOnAuthLost pattern. Renders nothing.
 */
export function QueryErrorToastBridge() {
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();

  useEffect(() => {
    setQueryErrorToastEmitter(showToast);
    return () => setQueryErrorToastEmitter(null);
  }, [showToast]);

  useEffect(() => {
    setQueryErrorDemoMode(demoMode);
  }, [demoMode]);

  return null;
}
