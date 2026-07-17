import type { ReactNode } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";

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

export const GIFT_ANNUAL = 96;
export const SPONSOR_MATCH_AMOUNTS = [96, 48, 24];
export const ACTIVATE_BY_DATE = new Date(2026, 8, 9); // 9 Sep 2026
const SPONSOR_POOL_SIZE = 13;

export function buildGiftModes(t: TFunction, fmt: Formatters): GiftMode[] {
  return [
    {
      id: "gift",
      icon: "gift",
      title: (
        <Translation
          i18nKey="settings:giftMembership.mode.gift.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="settings:giftMembership.mode.gift.body"
          components={{ b: <b /> }}
        />
      ),
      price: <em>{fmt.currency(GIFT_ANNUAL)}</em>,
      priceSub: t("settings:giftMembership.mode.gift.priceSub"),
    },
    {
      id: "sponsor",
      icon: "heart",
      jade: true,
      title: (
        <Translation
          i18nKey="settings:giftMembership.mode.sponsor.title"
          components={{ em: <em /> }}
        />
      ),
      body: (
        <Translation
          i18nKey="settings:giftMembership.mode.sponsor.body"
          values={{
            amount: fmt.currency(GIFT_ANNUAL),
            count: SPONSOR_POOL_SIZE,
          }}
          components={{ b: <b />, em: <em /> }}
        />
      ),
      price: (
        <>
          {SPONSOR_MATCH_AMOUNTS.map((amount, index) => (
            <span key={amount}>
              {index > 0 ? " / " : ""}
              <em>{fmt.currency(amount)}</em>
            </span>
          ))}
        </>
      ),
      priceSub: t("settings:giftMembership.mode.sponsor.priceSub"),
    },
  ];
}

export interface DeliveryOption {
  id: "now" | "schedule" | "print";
  label: string;
  desc: string;
  note: string;
}

const PRINT_POSTAGE = 4;

export function buildDeliveryOptions(
  t: TFunction,
  fmt: Formatters,
): DeliveryOption[] {
  const postage = fmt.currency(PRINT_POSTAGE);
  return [
    {
      id: "now",
      label: t("settings:giftMembership.delivery.now.label"),
      desc: t("settings:giftMembership.delivery.now.desc"),
      note: t("settings:giftMembership.delivery.now.note"),
    },
    {
      id: "schedule",
      label: t("settings:giftMembership.delivery.schedule.label"),
      desc: t("settings:giftMembership.delivery.schedule.desc"),
      note: t("settings:giftMembership.delivery.schedule.note"),
    },
    {
      id: "print",
      label: t("settings:giftMembership.delivery.print.label"),
      desc: t("settings:giftMembership.delivery.print.desc", {
        amount: postage,
      }),
      note: t("settings:giftMembership.delivery.print.note", {
        amount: postage,
      }),
    },
  ];
}

export function buildAnonOptions(t: TFunction) {
  return [
    { value: "no", label: t("settings:giftMembership.anon.no") },
    { value: "yes", label: t("settings:giftMembership.anon.yes") },
    { value: "initials", label: t("settings:giftMembership.anon.initials") },
  ];
}
