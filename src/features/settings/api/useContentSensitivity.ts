import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { logError } from "../../../shared/observability/logger";
import {
  DEFAULT_CONTENT_SENSITIVITY,
  getContentSensitivity,
  putContentSensitivity,
  type ContentSensitivityDTO,
} from "./contentSensitivity.api";

/**
 * The ids the Interests pane's `CONTENT_SETTINGS` list uses.
 *
 * Exported so `interests.data.ts` can type its `ContentSetting.id` with it:
 * that turns "the pane offers a switch nothing is stored for" from a silent
 * dead toggle into a compile error, which is the failure mode this whole
 * finding was.
 */
export type ContentSettingId = "dating" | "mentalHealth" | "sexualityIdentity";

/**
 * Which DTO field each switch owns. One place, so the pane never has to know
 * that the wire says `hide` while the checkbox says `show`.
 */
const FIELD_BY_SETTING: Record<ContentSettingId, keyof ContentSensitivityDTO> =
  {
    dating: "hideDating",
    mentalHealth: "hideMentalHealth",
    sexualityIdentity: "hideSexualityIdentity",
  };

export interface ContentSensitivityResult {
  /**
   * Whether this category is still shown in the member's feed. THE CHECKBOX
   * VALUE: checked means "show me this", matching the pane's labels, and the
   * one inversion against the stored `hide*` field lives here.
   */
  isShown: (setting: ContentSettingId) => boolean;
  /** Flip one category. Saves immediately; the other two keep their values. */
  setShown: (setting: ContentSettingId, isShownNext: boolean) => void;
  /** True while the live settings are first loading. */
  isLoading: boolean;
}

const CONTENT_SENSITIVITY_QUERY_KEY = ["content-sensitivity"] as const;

/**
 * The member's three content-sensitivity feed filters, dual-mode (PRD-10).
 *
 * - **Demo**: in-memory, everything shown, so the toggles are interactive in
 *   the standalone prototype without touching the network.
 * - **Live**: hydrates from `GET /me/content-sensitivity` (gated on a signed-in
 *   member) and writes each flip through `PUT` with an optimistic cache
 *   update, rolling back and toasting on failure.
 *
 * Saves on flip rather than joining the pane's dirty/save flow, following
 * `useLoginAlerts`. These switches now change what the member is shown, and a
 * filter that only takes effect once they find a Save button is a filter that
 * quietly did not take effect.
 *
 * The endpoint is a full replace of all three, so every write sends the whole
 * current shape with one field changed. The current shape comes from the cache
 * (falling back to the documented defaults), so two fast flips compose instead
 * of the second one resetting the first.
 */
export function useContentSensitivity(): ContentSensitivityResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [demoSensitivity, setDemoSensitivity] = useState<ContentSensitivityDTO>(
    DEFAULT_CONTENT_SENSITIVITY,
  );

  const query = useQuery<ContentSensitivityDTO>({
    queryKey: CONTENT_SENSITIVITY_QUERY_KEY,
    enabled: !demoMode && loggedIn,
    queryFn: () => getContentSensitivity(),
  });

  const current = demoMode
    ? demoSensitivity
    : (query.data ?? DEFAULT_CONTENT_SENSITIVITY);

  const isShown = useCallback(
    (setting: ContentSettingId) => !current[FIELD_BY_SETTING[setting]],
    [current],
  );

  const setShown = useCallback(
    (setting: ContentSettingId, isShownNext: boolean) => {
      const field = FIELD_BY_SETTING[setting];
      if (demoMode) {
        setDemoSensitivity((previous) => ({
          ...previous,
          [field]: !isShownNext,
        }));
        return;
      }
      const previous =
        queryClient.getQueryData<ContentSensitivityDTO>(
          CONTENT_SENSITIVITY_QUERY_KEY,
        ) ?? DEFAULT_CONTENT_SENSITIVITY;
      const next: ContentSensitivityDTO = {
        ...previous,
        [field]: !isShownNext,
      };
      queryClient.setQueryData<ContentSensitivityDTO>(
        CONTENT_SENSITIVITY_QUERY_KEY,
        next,
      );
      void putContentSensitivity(next)
        .then((fresh) =>
          queryClient.setQueryData<ContentSensitivityDTO>(
            CONTENT_SENSITIVITY_QUERY_KEY,
            fresh,
          ),
        )
        .catch((error) => {
          logError(error, { scope: "content-sensitivity" });
          // Roll back to exactly what the server last said, rather than to the
          // inverse of `next`: two fast flips would otherwise leave a toggle
          // showing a state nobody chose.
          queryClient.setQueryData<ContentSensitivityDTO>(
            CONTENT_SENSITIVITY_QUERY_KEY,
            previous,
          );
          showToast(t("settings:interests.content.toastError"), "error");
        });
    },
    [demoMode, queryClient, showToast, t],
  );

  return {
    isShown,
    setShown,
    isLoading: !demoMode && query.isLoading,
  };
}
