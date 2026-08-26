import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type {
  CommunitySupportOfferDTO,
  CommunitySupportOfferListDTO,
} from "../../communities/api/communitySupportOffers.api";
import {
  communitySupportOffersKey,
  countOpenOffers,
} from "../../communities/api/useCommunitySupportOffers";
import {
  offerCommunitySupport,
  type CreateCommunitySupportOfferInput,
} from "./adminCommunitySupport.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface OfferCommunitySupportVars extends CreateCommunitySupportOfferInput {
  slug: string;
}

/**
 * Offer a community support from the admin health modal (OPS-05).
 *
 * The modal used to call nothing at all: it closed itself, toasted "Support
 * sent to <name>'s moderators" with an Undo that withdrew nothing, and the
 * community never heard from anyone. This is the real write, and the toast now
 * waits for the server.
 *
 * Demo mode synthesizes the row it would have written and never touches the
 * network, the same shape every other dual-mode admin mutation takes, and then
 * writes it into the community mod-tools cache so the demo tells one story end
 * to end: send the offer here, read it there. A demo that toasted the send and
 * left the community's own pane saying nobody had offered anything would be
 * the same fake success this feature exists to remove. The live path fakes
 * nothing: a failure surfaces as a failure.
 */
export function useOfferCommunitySupport() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    CommunitySupportOfferDTO,
    Error,
    OfferCommunitySupportVars
  >({
    demoMode,
    // The modal reports its own failure, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: ({ options, note }) => ({
      id: `demo-support-${Date.now()}`,
      options,
      note: note?.trim() ? note.trim() : null,
      status: "new",
      offeredBy: null,
      offeredByName: null,
      respondedBy: null,
      respondedAt: null,
      createdAt: new Date().toISOString(),
    }),
    live: ({ slug, options, note }) =>
      offerCommunitySupport(slug, { options, note }),
    logLabel: "admin.community.offerSupport",
    logContext: ({ slug, options }) => ({ slug, options }),
    // Demo has no server to re-read, so the synthesized offer is written
    // straight into the key the community's Mod tools pane and the rail's
    // badge both read. Live skips this and invalidates below instead.
    onSuccess: (offer, { slug }) => {
      if (!demoMode) return;
      queryClient.setQueryData<CommunitySupportOfferListDTO>(
        communitySupportOffersKey(slug, true),
        (previous) => {
          const offers = [offer, ...(previous?.offers ?? [])];
          return { offers, openCount: countOpenOffers(offers) };
        },
      );
    },
    // The community's own mod-tools pane is the surface this write feeds. An
    // admin who also moderates that community sees the new offer without a
    // reload; for everybody else the invalidation is a cheap no-op.
    onLiveSuccess: (_data, { slug }) => {
      void queryClient.invalidateQueries({
        queryKey: communitySupportOffersKey(slug, false),
      });
    },
  });
}
