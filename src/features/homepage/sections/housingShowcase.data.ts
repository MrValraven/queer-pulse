// Showcase content for the homepage Housing section's two example listing
// cards, shown in both demo and live mode by product decision — not backed
// by the real housing listing API. Mirrors the convention in
// ./Communities.data.ts: rich per-item literals live here, never inline in
// the component body. Unlike most homepage showcase data, this content is
// fully translated (via `getHousingListings(t)`) rather than left
// English-only — see the note in en/homepage.ts's "Housing" block for why
// this is an intentional exception to the file's i18n scope rule. Proper
// names (landlord names) stay as plain literals here since names aren't
// localized.
import type { TFunction } from "../../../shared/i18n/types";
import type { AvatarTint } from "../../../shared/components/ui";

export type HousingListingId = "a" | "b";
export type HousingTabKey = "room" | "landlord";

export interface HousingRoomChip {
  label: string;
  /** Renders on the accent-filled chip instead of the plum-tinted one. */
  accent?: boolean;
}

/** A checkmarked line with a bold lead-in phrase, e.g. "**No deposit.** First month only." */
export interface HousingLeadLine {
  lead: string;
  rest: string;
}

export interface HousingHouseholdMember {
  initials: string;
  tint: AvatarTint;
  /** Omitted for the "+N more" bubble, which isn't a depicted person. */
  src?: string;
}

export interface HousingRoomContent {
  /** Reused from ../../economy/housingListings.ts — same neighborhoods, same
   *  photo pool the platform's real housing board already uses. */
  photoUrl: string;
  photoPlaceholder: string;
  chips: HousingRoomChip[];
  title: string;
  meta: string;
  price: HousingLeadLine;
  /** Width (%) of the jade fill in the median-price context bar. */
  priceBarFillPercent: number;
  household: {
    avatars: HousingHouseholdMember[];
    name: string;
    sub: string;
  };
  signals: HousingLeadLine[];
}

export interface HousingLandlordQuote {
  initials: string;
  tint: AvatarTint;
  src?: string;
  quote: string;
  who: string;
}

export interface HousingLandlordFact {
  text: string;
  /** true = verified/known (jade check); false = not yet known (muted, neutral icon). */
  known: boolean;
}

export interface HousingLandlordContent {
  avatarInitial: string;
  avatarSrc?: string;
  name: string;
  sub: string;
  /** Positive summary line, shown when the landlord has a track record. */
  verdict?: string;
  quotes?: HousingLandlordQuote[];
  flag?: HousingLeadLine;
  /** Shown instead of quotes when nobody has reviewed this landlord yet. */
  emptyState?: { title: string; body: string };
  /** "What we do know" list, paired with `emptyState` for a new landlord. */
  facts?: HousingLandlordFact[];
  footNote: string;
  footCta?: string;
}

export interface HousingListing {
  id: HousingListingId;
  peekLabel: string;
  room: HousingRoomContent;
  landlord: HousingLandlordContent;
}

export function getHousingListings(t: TFunction): HousingListing[] {
  const reviewsFootNote = t("homepage:housing.reviewsFootNote");
  const reviewsFootCta = t("homepage:housing.reviewsFootCta");

  return [
    {
      id: "a",
      peekLabel: t("homepage:housing.listings.a.peekLabel"),
      room: {
        // Same photo as the "arroios-room-share" listing in housingListings.ts.
        photoUrl:
          "https://images.unsplash.com/photo-1543709525-e8764409abff?q=80&w=800&auto=format&fit=crop",
        photoPlaceholder: t("homepage:housing.listings.a.photoPlaceholder"),
        chips: [
          { label: t("homepage:housing.listings.a.chips.0"), accent: true },
          { label: t("homepage:housing.listings.a.chips.1") },
        ],
        title: t("homepage:housing.listings.a.title"),
        meta: t("homepage:housing.listings.a.meta"),
        price: {
          lead: t("homepage:housing.listings.a.price.lead"),
          rest: t("homepage:housing.listings.a.price.rest"),
        },
        priceBarFillPercent: 78,
        household: {
          avatars: [
            {
              initials: "V",
              tint: "coral",
              src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop",
            },
            {
              initials: "T",
              tint: "jade",
              src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
            },
            { initials: "+1", tint: "plum" },
          ],
          name: t("homepage:housing.listings.a.household.name"),
          sub: t("homepage:housing.listings.a.household.sub"),
        },
        signals: [
          {
            lead: t("homepage:housing.listings.a.signals.0.lead"),
            rest: t("homepage:housing.listings.a.signals.0.rest"),
          },
          {
            lead: t("homepage:housing.listings.a.signals.1.lead"),
            rest: t("homepage:housing.listings.a.signals.1.rest"),
          },
          {
            lead: t("homepage:housing.listings.a.signals.2.lead"),
            rest: t("homepage:housing.listings.a.signals.2.rest"),
          },
        ],
      },
      landlord: {
        avatarInitial: "A",
        avatarSrc:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
        name: "Sr. Almeida",
        sub: t("homepage:housing.listings.a.landlord.sub"),
        verdict: t("homepage:housing.listings.a.landlord.verdict"),
        quotes: [
          {
            initials: "R",
            tint: "jade",
            src: "https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=400&auto=format&fit=crop",
            quote: t("homepage:housing.listings.a.landlord.quotes.0.quote"),
            who: t("homepage:housing.listings.a.landlord.quotes.0.who"),
          },
          {
            initials: "N",
            tint: "coral",
            src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
            quote: t("homepage:housing.listings.a.landlord.quotes.1.quote"),
            who: t("homepage:housing.listings.a.landlord.quotes.1.who"),
          },
          {
            initials: "J",
            tint: "plum",
            src: "https://images.unsplash.com/photo-1582896911227-c966f6e7fb93?q=80&w=400&auto=format&fit=crop",
            quote: t("homepage:housing.listings.a.landlord.quotes.2.quote"),
            who: t("homepage:housing.listings.a.landlord.quotes.2.who"),
          },
        ],
        flag: {
          lead: t("homepage:housing.listings.a.landlord.flag.lead"),
          rest: t("homepage:housing.listings.a.landlord.flag.rest"),
        },
        footNote: reviewsFootNote,
        footCta: reviewsFootCta,
      },
    },
    {
      id: "b",
      peekLabel: t("homepage:housing.listings.b.peekLabel"),
      room: {
        // Same photo as the "graca-studio-shortterm" listing in housingListings.ts.
        photoUrl:
          "https://images.unsplash.com/photo-1579632151052-92f741fb9b79?q=80&w=800&auto=format&fit=crop",
        photoPlaceholder: t("homepage:housing.listings.b.photoPlaceholder"),
        chips: [
          { label: t("homepage:housing.listings.b.chips.0"), accent: true },
          { label: t("homepage:housing.listings.b.chips.1") },
        ],
        title: t("homepage:housing.listings.b.title"),
        meta: t("homepage:housing.listings.b.meta"),
        price: {
          lead: t("homepage:housing.listings.b.price.lead"),
          rest: t("homepage:housing.listings.b.price.rest"),
        },
        priceBarFillPercent: 92,
        household: {
          avatars: [
            {
              initials: "B",
              tint: "jade",
              src: "https://images.unsplash.com/photo-1499887142886-791eca5918cd?q=80&w=400&auto=format&fit=crop",
            },
          ],
          name: "Beatriz M.",
          sub: t("homepage:housing.listings.b.household.sub"),
        },
        signals: [
          {
            lead: t("homepage:housing.listings.b.signals.0.lead"),
            rest: t("homepage:housing.listings.b.signals.0.rest"),
          },
          {
            lead: t("homepage:housing.listings.b.signals.1.lead"),
            rest: t("homepage:housing.listings.b.signals.1.rest"),
          },
          {
            lead: t("homepage:housing.listings.b.signals.2.lead"),
            rest: t("homepage:housing.listings.b.signals.2.rest"),
          },
        ],
      },
      landlord: {
        avatarInitial: "R",
        avatarSrc:
          "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=400&auto=format&fit=crop",
        name: "Ana Ruiz",
        sub: t("homepage:housing.listings.b.landlord.sub"),
        emptyState: {
          title: t("homepage:housing.listings.b.landlord.emptyState.title"),
          body: t("homepage:housing.listings.b.landlord.emptyState.body"),
        },
        facts: [
          {
            text: t("homepage:housing.listings.b.landlord.facts.0.text"),
            known: true,
          },
          {
            text: t("homepage:housing.listings.b.landlord.facts.1.text"),
            known: true,
          },
          {
            text: t("homepage:housing.listings.b.landlord.facts.2.text"),
            known: false,
          },
        ],
        footNote: reviewsFootNote,
        footCta: reviewsFootCta,
      },
    },
  ];
}
