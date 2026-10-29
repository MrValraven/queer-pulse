import { ApiError } from "../../shared/api/client";
import { heroImage } from "../studio/studioArtist.data";
import type {
  AdminStudioLandingArtistCardDTO,
  AdminStudioLandingPhotoDTO,
  CreateAdminStudioLandingCardBody,
  PutAdminStudioLandingPhotoBody,
  StudioLandingPhotoSlot,
  UpdateAdminStudioLandingCardBody,
} from "./api/studioLandingAdmin.api";
import { isSameIdSet, orderedByIds, renumbered } from "./studioAdmin.model";
import {
  LIMITS,
  demoRefusal,
  DEMO_STAFF,
  INELIGIBLE_PERSONA_IDS,
} from "./studioAdminLandingDemoBase";
import {
  current,
  commit,
  nextId,
  personaOf,
} from "./studioAdminLandingDemoStore";

// Demo writes for artist cards and photos.

export function demoCreateCard(body: CreateAdminStudioLandingCardBody) {
  if (body.hasConsent !== true)
    throw demoRefusal("studio_landing_consent_required", 400);
  const landing = current();
  const artist = personaOf(body.subprofileId);
  if (!artist || INELIGIBLE_PERSONA_IDS.has(artist.id))
    throw demoRefusal("studio_landing_persona_not_eligible", 422);
  if (landing.artistCards.some((card) => card.artist.id === artist.id))
    throw demoRefusal("studio_landing_card_exists", 409);
  if (landing.artistCards.length >= LIMITS.cards)
    throw demoRefusal("studio_landing_cards_full", 409);
  const card: AdminStudioLandingArtistCardDTO = {
    id: nextId("demo-landing-card"),
    artist,
    quote: body.quote?.trim() || null,
    position: landing.artistCards.length + 1,
    consentedAt: new Date().toISOString(),
    createdBy: DEMO_STAFF,
    isShown: true,
    isFoundingArtist: landing.foundingArtists.some(
      (listed) => listed.artist.id === artist.id,
    ),
  };
  commit({ ...landing, artistCards: [...landing.artistCards, card] });
  return card;
}

export function demoUpdateCard(
  cardId: string,
  body: UpdateAdminStudioLandingCardBody,
) {
  const landing = current();
  const card = landing.artistCards.find((item) => item.id === cardId);
  if (!card) throw demoRefusal("studio_landing_card_not_found", 404);
  if (body.hasConsent !== true)
    throw demoRefusal("studio_landing_consent_required", 400);
  const saved = {
    ...card,
    quote: body.quote?.trim() || null,
    consentedAt: new Date().toISOString(),
  };
  commit({
    ...landing,
    artistCards: landing.artistCards.map((item) =>
      item.id === cardId ? saved : item,
    ),
  });
  return saved;
}

export function demoRemoveCard(cardId: string): void {
  const landing = current();
  if (!landing.artistCards.some((card) => card.id === cardId))
    throw demoRefusal("studio_landing_card_not_found", 404);
  commit({
    ...landing,
    artistCards: renumbered(
      landing.artistCards.filter((card) => card.id !== cardId),
    ),
  });
}

export function demoReorderCards(cardIds: string[]) {
  const landing = current();
  if (!isSameIdSet(cardIds, landing.artistCards))
    throw demoRefusal("studio_landing_order_mismatch", 409);
  const artistCards = renumbered(orderedByIds(landing.artistCards, cardIds));
  commit({ ...landing, artistCards });
  return artistCards;
}

export function demoPutPhoto(
  slot: StudioLandingPhotoSlot,
  body: PutAdminStudioLandingPhotoBody,
): AdminStudioLandingPhotoDTO {
  if (body.hasConsent !== true)
    throw demoRefusal("studio_landing_consent_required", 400);
  const landing = current();
  const stored = landing.photos[slot];
  const isIssued =
    body.imageKey === stored?.imageKey ||
    body.imageKey.startsWith("demo-") ||
    // A demo upload is a `blob:` URL (see useUploadImage).
    body.imageKey.startsWith("blob:") ||
    body.imageKey.startsWith("https://");
  // The upload ownership check answers before any Studio code exists.
  if (!isIssued)
    throw new ApiError(403, "Referenced upload does not belong to you", {
      message: "Referenced upload does not belong to you",
    });
  const photo: AdminStudioLandingPhotoDTO = {
    slot,
    imageKey: body.imageKey.startsWith("demo-")
      ? `studio-landing/${slot}/${body.imageKey}`
      : body.imageKey.startsWith("blob:")
        ? `studio-landing/${slot}/demo-upload`
        : body.imageKey,
    url:
      body.imageKey === stored?.imageKey
        ? stored.url
        : body.imageKey.startsWith("https://")
          ? body.imageKey
          : heroImage,
    altText: { en: body.altTextEn, pt: body.altTextPt },
    credit: body.credit?.trim() || null,
    consentedAt: new Date().toISOString(),
    updatedBy: DEMO_STAFF,
  };
  commit({ ...landing, photos: { ...landing.photos, [slot]: photo } });
  return photo;
}

export function demoRemovePhoto(slot: StudioLandingPhotoSlot): void {
  const landing = current();
  commit({ ...landing, photos: { ...landing.photos, [slot]: null } });
}
