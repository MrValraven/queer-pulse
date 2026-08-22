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
  cardName: "Sócie",
  validityMonths: 12,
  allowsPrint: false,
  allowsWallet: false,
  allowsPublicBadge: true,
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
    program: { ...DEMO_CARD_PROGRAM, skin: "jade", serialPrefix: "AZO" },
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
    avatarUrl: null,
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
  },
];
