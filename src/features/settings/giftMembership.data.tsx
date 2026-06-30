import type { ReactNode } from "react";

export type ModeIcon = "gift" | "heart";

export interface GiftMode {
  id: "gift" | "sponsor";
  icon: ModeIcon;
  jade?: boolean;
  title: ReactNode;
  body: ReactNode;
  price: ReactNode;
  priceSub: string;
}

export const GIFT_MODES: GiftMode[] = [
  {
    id: "gift",
    icon: "gift",
    title: (
      <>
        Gift it · <em>to someone you know</em>
      </>
    ),
    body: (
      <>
        For: a partner. A friend. The colleague who keeps asking how to join.{" "}
        <b>They get an invitation by name</b>, with a personal note from you.
        They sign up using a single-use link. If they decline, you get refunded.
      </>
    ),
    price: (
      <>
        €<em>96</em>
      </>
    ),
    priceSub: "/ year · Sustainer · same as your own",
  },
  {
    id: "sponsor",
    icon: "heart",
    jade: true,
    title: (
      <>
        Sponsor · <em>anonymously, for whoever needs it</em>
      </>
    ),
    body: (
      <>
        For: paying forward. Your gift sits in the <b>solidarity pool</b>.
        Members who can't afford the €96 apply with a sentence — we approve, no
        proof asked. <em>13 members are in the pool right now.</em> Your gift
        gets matched within days.
      </>
    ),
    price: (
      <>
        €<em>96</em> / €48 / €24
      </>
    ),
    priceSub: "give any amount · matched by name or anonymously",
  },
];

export interface DeliveryOption {
  id: "now" | "schedule" | "print";
  label: string;
  desc: string;
  note: string;
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "now",
    label: "Now",
    desc: "Sent in the next minute · email arrives instantly",
    note: "delivered immediately",
  },
  {
    id: "schedule",
    label: "Schedule",
    desc: "Pick a date · we send at 09:00 in their timezone",
    note: "scheduled · pick a date next step",
  },
  {
    id: "print",
    label: "Print & post",
    desc: "+ €4 postage · risograph card · arrives in 5–7 days",
    note: "printed + posted · +€4",
  },
];

export const ANON_OPTIONS = [
  { value: "no", label: "No — show my name to the recipient" },
  { value: "yes", label: "Yes — anonymous to recipient" },
  { value: "initials", label: "Just my initials" },
];
