import { useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { createCohostInvite } from "./api/events.api";
import { formToCreateEventDto } from "./api/events.adapters";
import { useCreateEvent } from "./api/useEventMutations";
import {
  COHOST_INVITE_DEFAULT_COMMITMENT,
  COHOST_INVITE_DEFAULT_ROLE,
} from "./createGathering.data";
import type { GatheringForm } from "./useGatheringForm";

/**
 * Publishing a gathering: the real create mutation, its toasts, and the
 * co-host invites that follow it (ruling R12).
 *
 * The success screen, the toast and `onPublished` fire only from the
 * mutation's own success, so a rejected create keeps the host on the form
 * with an error toast and nothing celebrated.
 */
export function usePublishGathering({
  form,
  onPublished,
}: {
  form: GatheringForm;
  /** Runs once the create succeeds (the page clears the stored draft). */
  onPublished: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const createEvent = useCreateEvent();
  // The slug the backend assigned, for the success CTA. Null in demo, where
  // nothing persists, so the CTA falls back to the board.
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  // Every saved date's slug in series order, for the share kit's calendar
  // file. A server that sends no list leaves the first slug on its own; demo
  // leaves the list empty.
  const [occurrenceSlugs, setOccurrenceSlugs] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  // Set before the create goes out and cleared once it settles. `isPending`
  // is a render-time value, so two presses inside one frame would both read it
  // as false and create two gatherings (and send every co-host invite twice);
  // the ref reads the first press straight away.
  const isPublishInFlightRef = useRef(false);

  /**
   * Invite each co-host on the new gathering. Invites go out in parallel and
   * the publish stands whatever they return: a failure toasts a warning with
   * how many did not go, and the host can invite again from the manage page.
   */
  const inviteCohosts = async (slug: string, cohostSlugs: string[]) => {
    const results = await Promise.allSettled(
      cohostSlugs.map((inviteeSlug) =>
        createCohostInvite(slug, {
          inviteeSlug,
          role: COHOST_INVITE_DEFAULT_ROLE,
          commitment: COHOST_INVITE_DEFAULT_COMMITMENT,
        }),
      ),
    );
    const failedCount = results.filter(
      (result) => result.status === "rejected",
    ).length;
    if (failedCount > 0) {
      showToast(
        t("gatherings:create.v2.toast.cohostInviteFailed", {
          count: failedCount,
        }),
        "warning",
      );
    }
  };

  const publish = () => {
    if (isPublishInFlightRef.current || createEvent.isPending) return;
    // Read now: the form may change while the request is out.
    const cohostSlugs = [...form.cohostSlugs];
    const payload = formToCreateEventDto(form);
    isPublishInFlightRef.current = true;
    createEvent.mutate(payload, {
      onSuccess: ({ slug, occurrenceSlugs: savedOccurrenceSlugs }) => {
        if (slug) setCreatedSlug(slug);
        setOccurrenceSlugs(savedOccurrenceSlugs ?? (slug ? [slug] : []));
        setIsPublished(true);
        onPublished();
        showToast(t("gatherings:create.toast.published"), "success");
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotionNow() ? "auto" : "smooth",
        });
        // Demo mode returns no slug, and there is nothing to invite onto.
        if (slug && cohostSlugs.length > 0) {
          void inviteCohosts(slug, cohostSlugs);
        }
      },
      onError: () =>
        showToast(t("gatherings:create.toast.publishError"), "error"),
      onSettled: () => {
        isPublishInFlightRef.current = false;
      },
    });
  };

  return {
    publish,
    isPending: createEvent.isPending,
    isPublished,
    createdSlug,
    occurrenceSlugs,
  };
}
