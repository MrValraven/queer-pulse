import type { StudioPlaylistPersonDTO } from "./studio.types";
import type { StudioSupporterIdentityDTO } from "./studioListening.types";
import type {
  StudioBuyerPurchaseDTO,
  StudioPurchaseArtistDTO,
  StudioPurchaseDownloadTrackDTO,
  StudioPurchaseItemDTO,
  StudioPurchaseWallStateDTO,
  StudioSellerPurchaseDTO,
} from "./studioPurchases.types";
import { demoAllArtists } from "./studioDemoFormats.data";
import type { DemoPurchaseRow } from "./studioDemoPurchases.data";
import { catalogueItemOf } from "./studioDemoPurchaseStore";
import { DEMO_ACCOUNT_MEMBER } from "./studioDemoYourListening.data";
import {
  identityOf,
  optionsOfViewer,
  personaIdentityOf,
} from "./studioDemoYourSupporters";

const slugOf = (name: string) =>
  name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "-");

export function personOf(
  buyer: DemoPurchaseRow["buyer"],
): StudioPlaylistPersonDTO | null {
  if (buyer === "viewer") return DEMO_ACCOUNT_MEMBER;
  return buyer === null
    ? null
    : { slug: slugOf(buyer.name), displayName: buyer.name, avatarUrl: null };
}

export function wallIdentityOf(
  row: DemoPurchaseRow,
): StudioSupporterIdentityDTO {
  const persona = demoAllArtists().find(
    (artist) => artist.id === row.shownAsSubprofileId,
  );
  if (row.buyer === "viewer") return identityOf(row.shownAsSubprofileId);
  const member = personOf(row.buyer);
  return persona
    ? personaIdentityOf(persona)
    : { kind: "account", member: member ?? DEMO_ACCOUNT_MEMBER };
}

export function artistOfRow(row: DemoPurchaseRow): StudioPurchaseArtistDTO {
  const persona = demoAllArtists().find((artist) => artist.id === row.artistId);
  return persona
    ? {
        name: persona.name,
        subprofileId: persona.id,
        handle: persona.handle || null,
        isLinkable: persona.handle !== "",
      }
    : {
        name: row.gone?.artistName ?? "",
        subprofileId: null,
        handle: null,
        isLinkable: false,
      };
}

function itemOfRow(row: DemoPurchaseRow): StudioPurchaseItemDTO {
  const live =
    row.itemId === null ? null : catalogueItemOf(row.kind, row.itemId);
  return (
    live?.item ?? {
      kind: row.kind,
      title: row.gone?.title ?? "",
      releaseId: null,
      trackId: null,
      releaseType: null,
      coverUrl: null,
      isAvailable: false,
    }
  );
}

/** 'mp3' for audio/mpeg, 'm4a' for audio/mp4, null without audio. */
function formatOfContentType(contentType: string | null): "mp3" | "m4a" | null {
  if (contentType === "audio/mpeg") return "mp3";
  return contentType === "audio/mp4" ? "m4a" : null;
}

/** The code the download route would answer now, in the server's order. */
function downloadRefusalOf(
  releaseStatus: string,
  track: { isWithheld: boolean; hasAudio: boolean },
): string | null {
  if (releaseStatus === "taken_down")
    return "studio_download_release_taken_down";
  if (track.isWithheld) return "studio_download_track_withheld";
  return track.hasAudio ? null : "studio_download_track_not_ready";
}

export function downloadsOf(
  row: DemoPurchaseRow,
): StudioPurchaseDownloadTrackDTO[] {
  if (row.status !== "confirmed") return [];
  if (row.gone !== null) return row.gone.downloads;
  const live =
    row.itemId === null ? null : catalogueItemOf(row.kind, row.itemId);
  return (live?.tracks ?? []).map((track) => ({
    trackId: track.id,
    position: track.position,
    title: track.title,
    durationSeconds: track.durationSeconds,
    format: formatOfContentType(track.audioContentType),
    unavailableReason: downloadRefusalOf(live?.status ?? "", track),
  }));
}

export function wallStateOf(row: DemoPurchaseRow): StudioPurchaseWallStateDTO {
  return {
    isOnWall: row.isOnWall,
    shownAsSubprofileId: row.shownAsSubprofileId,
    shownAs: row.isOnWall ? wallIdentityOf(row) : null,
    needsNewIdentity: false,
    options: optionsOfViewer(),
  };
}

export function buyerPurchaseDto(row: DemoPurchaseRow): StudioBuyerPurchaseDTO {
  return {
    id: row.id,
    status: row.status,
    item: itemOfRow(row),
    artist: artistOfRow(row),
    amountCents: row.amountCents,
    referenceCode: row.referenceCode,
    payerName: row.payerName,
    declineReason: row.declineReason,
    declineNote: row.declineNote,
    createdAt: row.createdAt,
    decidedAt: row.decidedAt,
    wall: {
      isOnWall: row.isOnWall,
      shownAs: row.isOnWall ? wallIdentityOf(row) : null,
      needsNewIdentity: false,
    },
    downloads: downloadsOf(row),
  };
}

export function sellerPurchaseDto(
  row: DemoPurchaseRow,
): StudioSellerPurchaseDTO {
  return {
    id: row.id,
    status: row.status,
    item: itemOfRow(row),
    amountCents: row.amountCents,
    referenceCode: row.referenceCode,
    payerName: row.payerName,
    buyer: personOf(row.buyer),
    createdAt: row.createdAt,
    decidedAt: row.decidedAt,
  };
}
