import { currentUser } from "../members/data/members";
import type {
  CardProgramDTO,
  IssuerCardDTO,
  MyCardDTO,
} from "./api/cards.api";

export const DEMO_CARD_PROGRAM: CardProgramDTO = {
  isEnabled: true,
  skin: "plum",
  accentToken: "accent",
  crestUrl: null,
  backgroundPreset: null,
  backgroundUrl: null,
  cardName: "Sócie",
  validityMonths: 12,
  allowsPrint: false,
  allowsWallet: false,
  allowsPublicBadge: true,
  // On, so the demo shows what a photo card actually looks like. The second
  // demo card below leaves it off, so both compositions are reachable
  // without touching a setting.
  allowsMemberPhoto: true,
  photoStyle: "color",
  serialPrefix: "LQC",
};

export const DEMO_MY_CARDS: MyCardDTO[] = [
  {
    id: "demo-card-1",
    serial: "LQC-7K4M2",
    status: "active",
    issuedAt: "2026-02-14T10:00:00Z",
    expiresAt: "2027-02-14T10:00:00Z",
    communityName: "Lisboa Queer Collective",
    communitySlug: "lisboa-queer-collective",
    role: "member",
    holderName: "Tiago Costa",
    // Already resolved: in live mode the backend only sends this when the
    // programme allows photos and the member has not hidden theirs, so the
    // fixture matches that contract rather than the raw profile avatar.
    holderAvatarUrl: currentUser.photo ?? null,
    isPhotoHidden: false,
    // Demo mode shows a real, scannable symbol that resolves to a demo code.
    token: "demo-card-token",
    program: DEMO_CARD_PROGRAM,
  },
  {
    id: "demo-card-2",
    serial: "AZO-3P9WQ",
    status: "expired",
    issuedAt: "2025-01-09T10:00:00Z",
    expiresAt: "2026-01-09T10:00:00Z",
    communityName: "Azores Queer",
    communitySlug: "azores-queer",
    role: "mod",
    holderName: "Tiago Costa",
    holderAvatarUrl: null,
    isPhotoHidden: false,
    // Demo mode shows a real, scannable symbol that resolves to a demo code.
    token: "demo-card-token",
    program: {
      ...DEMO_CARD_PROGRAM,
      skin: "jade",
      serialPrefix: "AZO",
      allowsMemberPhoto: false,
    },
  },
];

export const DEMO_CARD_HOLDERS: IssuerCardDTO[] = [
  {
    id: "demo-card-1",
    serial: "LQC-7K4M2",
    status: "active",
    issuedAt: "2026-02-14T10:00:00Z",
    expiresAt: "2027-02-14T10:00:00Z",
    revokedAt: null,
    revokedReason: null,
    holderSlug: "tiago",
    holderName: "Tiago Costa",
    avatarUrl: currentUser.photo ?? null,
    role: "member",
    token: "demo-card-token",
    // Already gated, matching the live contract: this programme allows
    // photos and this holder has not vetoed theirs, so the card prints one.
    cardPhotoUrl: currentUser.photo ?? null,
  },
  {
    id: "demo-card-3",
    serial: "LQC-8HN4X",
    status: "suspended",
    issuedAt: "2026-03-02T10:00:00Z",
    expiresAt: "2027-03-02T10:00:00Z",
    revokedAt: null,
    revokedReason: "Paused while a report is reviewed",
    holderSlug: "rita",
    holderName: "Rita Valente",
    avatarUrl: null,
    role: "mod",
    token: "demo-card-token",
    // Null on purpose: the second demo holder's card carries no photo, so
    // the issuer's view of it shows the empty slot a real card would.
    cardPhotoUrl: null,
  },
];
