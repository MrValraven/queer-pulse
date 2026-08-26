import { currentUser } from "../members/data/members";
import type {
  CardProgramDTO,
  CardVerificationCountsDTO,
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
  // On, so the demo shows the composition a pronoun card actually has. The
  // second demo card below leaves it off, so both are reachable without
  // touching a setting.
  allowsPronouns: true,
  // The default treatment. The demo programme runs on a flat skin, where no
  // treatment applies at all, so this is only here to keep the shape whole.
  textBackdrop: "shade",
  // On, so the demo reaches the Renew control on the expired second card
  // below. Live programmes default it off: a community opts in.
  allowsSelfRenew: true,
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
    // Already resolved, like the avatar above: in live mode the backend sends
    // this only when the programme prints pronouns and the member has not
    // hidden theirs.
    holderPronouns: currentUser.pronouns ?? null,
    isPronounsHidden: false,
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
    holderPronouns: null,
    isPronounsHidden: false,
    // Demo mode shows a real, scannable symbol that resolves to a demo code.
    token: "demo-card-token",
    program: {
      ...DEMO_CARD_PROGRAM,
      skin: "jade",
      serialPrefix: "AZO",
      allowsMemberPhoto: false,
      allowsPronouns: false,
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
    // Checked at a door a few times. High enough that the roster has
    // something to show, low enough that it reads as ordinary use.
    verificationCount: 6,
    // Already gated, matching the live contract: this programme allows
    // photos and this holder has not vetoed theirs, so the card prints one.
    cardPhotoUrl: currentUser.photo ?? null,
    cardPronouns: currentUser.pronouns ?? null,
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
    // Never checked. The roster's empty per-card state is reachable in demo
    // without editing a fixture.
    verificationCount: 0,
    // Null on purpose: the second demo holder's card carries no photo, so
    // the issuer's view of it shows the empty slot a real card would.
    cardPhotoUrl: null,
    cardPronouns: "she/her",
  },
];

/**
 * The demo programme's aggregate. Two counts and a timestamp, the same shape
 * the live endpoint returns, so the panel renders the real component in demo
 * rather than a stand-in.
 *
 * THE NUMBERS AGREE WITH THE ROSTER ON THE SAME SCREEN. The programme holds
 * two cards, checked 6 times and 0 times, so the programme total is 6 and the
 * recent window is a subset of it. It used to read 148 and 23 beside a roster
 * that added up to 6, which is the kind of demo number a reader stops
 * trusting the moment they add the column up.
 */
export const DEMO_CARD_VERIFICATION_COUNTS: CardVerificationCountsDTO = {
  total: 6,
  recent: 3,
  recentDays: 30,
  lastVerifiedAt: "2026-08-21T20:15:00Z",
};
