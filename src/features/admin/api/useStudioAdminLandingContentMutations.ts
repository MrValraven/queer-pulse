import { isSameIdSet, orderedByIds, renumbered } from "../studioAdmin.model";
import {
  createAdminStudioLandingCard,
  putAdminStudioLandingPhoto,
  removeAdminStudioLandingCard,
  removeAdminStudioLandingPhoto,
  reorderAdminStudioLandingCards,
  updateAdminStudioLandingCard,
  type AdminStudioLandingArtistCardDTO,
  type AdminStudioLandingDTO,
  type AdminStudioLandingPhotoDTO,
  type CreateAdminStudioLandingCardBody,
  type PutAdminStudioLandingPhotoBody,
  type StudioLandingPhotoSlot,
  type UpdateAdminStudioLandingCardBody,
} from "./studioLandingAdmin.api";
import { useLandingMutation } from "./useStudioAdminLandingWrite";

// Artist card and photo writes of the Studio page console.

// Artist cards.

const withCards = (
  landing: AdminStudioLandingDTO,
  artistCards: AdminStudioLandingArtistCardDTO[],
): AdminStudioLandingDTO => ({ ...landing, artistCards });

/** POST .../artist-cards. Consent is required. */
export function useCreateLandingCard() {
  return useLandingMutation<
    AdminStudioLandingArtistCardDTO,
    CreateAdminStudioLandingCardBody
  >({
    live: (body) => createAdminStudioLandingCard(body),
    demo: (data, body) => data.demoCreateCard(body),
    patch: (landing, card) =>
      withCards(landing, [...landing.artistCards, card]),
  });
}

export type UpdateLandingCardVariables = UpdateAdminStudioLandingCardBody & {
  cardId: string;
};

/** PATCH .../artist-cards/:cardId. Every save re-confirms consent. */
export function useUpdateLandingCard() {
  return useLandingMutation<
    AdminStudioLandingArtistCardDTO,
    UpdateLandingCardVariables
  >({
    live: ({ cardId, quote, hasConsent }) =>
      updateAdminStudioLandingCard(cardId, { quote, hasConsent }),
    demo: (data, { cardId, quote, hasConsent }) =>
      data.demoUpdateCard(cardId, { quote, hasConsent }),
    patch: (landing, saved) =>
      withCards(
        landing,
        landing.artistCards.map((card) =>
          card.id === saved.id ? saved : card,
        ),
      ),
  });
}

export function useRemoveLandingCard() {
  return useLandingMutation<void, { cardId: string }>({
    live: ({ cardId }) => removeAdminStudioLandingCard(cardId),
    demo: (data, { cardId }) => data.demoRemoveCard(cardId),
    patch: (landing, _result, { cardId }) =>
      withCards(
        landing,
        renumbered(landing.artistCards.filter((card) => card.id !== cardId)),
      ),
  });
}

export function useReorderLandingCards() {
  return useLandingMutation<
    AdminStudioLandingArtistCardDTO[],
    { cardIds: string[] }
  >({
    live: ({ cardIds }) => reorderAdminStudioLandingCards({ cardIds }),
    demo: (data, { cardIds }) => data.demoReorderCards(cardIds),
    patch: (landing, cards) => withCards(landing, renumbered(cards)),
    optimistic: (landing, { cardIds }) =>
      withCards(
        landing,
        renumbered(orderedByIds(landing.artistCards, cardIds)),
      ),
    isOrderValid: (landing, { cardIds }) =>
      isSameIdSet(cardIds, landing.artistCards),
  });
}

// Photos.

export type PutLandingPhotoVariables = PutAdminStudioLandingPhotoBody & {
  slot: StudioLandingPhotoSlot;
};

const withPhoto = (
  landing: AdminStudioLandingDTO,
  slot: StudioLandingPhotoSlot,
  photo: AdminStudioLandingPhotoDTO | null,
): AdminStudioLandingDTO => ({
  ...landing,
  photos: { ...landing.photos, [slot]: photo },
});

/** The wire body: a blank credit goes as null. */
function photoBodyOf(variables: PutLandingPhotoVariables) {
  const credit = variables.credit?.trim() ?? "";
  return {
    imageKey: variables.imageKey,
    altTextEn: variables.altTextEn,
    altTextPt: variables.altTextPt,
    credit: credit === "" ? null : credit,
    hasConsent: variables.hasConsent,
  };
}

/** PUT .../photos/:slot. `imageKey` is a fresh `work-image` upload key or
 *  the stored landing key. A codeless 403 reads as
 *  `studio_landing_photo_not_yours` (`landingPhotoErrorKeyOf`). */
export function usePutLandingPhoto() {
  return useLandingMutation<
    AdminStudioLandingPhotoDTO,
    PutLandingPhotoVariables
  >({
    live: (variables) =>
      putAdminStudioLandingPhoto(variables.slot, photoBodyOf(variables)),
    demo: (data, variables) =>
      data.demoPutPhoto(variables.slot, photoBodyOf(variables)),
    patch: (landing, photo, { slot }) => withPhoto(landing, slot, photo),
  });
}

export function useRemoveLandingPhoto() {
  return useLandingMutation<void, { slot: StudioLandingPhotoSlot }>({
    live: ({ slot }) => removeAdminStudioLandingPhoto(slot),
    demo: (data, { slot }) => data.demoRemovePhoto(slot),
    patch: (landing, _result, { slot }) => withPhoto(landing, slot, null),
  });
}
