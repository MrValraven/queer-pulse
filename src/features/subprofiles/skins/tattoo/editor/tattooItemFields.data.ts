import type {
  TattooCoverUpType,
  TattooFlashAvailability,
  TattooGuestSpotType,
  TattooScarWorkType,
  TattooShopProductType,
  TattooSkinTone,
} from "../tattooVocab.data";

/**
 * Select options for the tattoo item drawer. Each label reads
 * `subprofiles:tattooItem.<field>.<value>`; the empty skin tone reads
 * `subprofiles:tattooItem.skinTone.notSaid`.
 */

export interface TattooItemOption<Value extends string> {
  value: Value;
  labelKey: string;
}

export const FLASH_AVAILABILITY_OPTIONS: TattooItemOption<
  TattooFlashAvailability | ""
>[] = [
  { value: "", labelKey: "subprofiles:tattooItem.flashAvailability.notSet" },
  {
    value: "available",
    labelKey: "subprofiles:tattooItem.flashAvailability.available",
  },
  {
    value: "claimed",
    labelKey: "subprofiles:tattooItem.flashAvailability.claimed",
  },
  {
    value: "repeatable",
    labelKey: "subprofiles:tattooItem.flashAvailability.repeatable",
  },
];

export const SKIN_TONE_OPTIONS: TattooItemOption<TattooSkinTone | "">[] = [
  { value: "", labelKey: "subprofiles:tattooItem.skinTone.notSaid" },
  { value: "light", labelKey: "subprofiles:tattooItem.skinTone.light" },
  { value: "medium", labelKey: "subprofiles:tattooItem.skinTone.medium" },
  { value: "deep", labelKey: "subprofiles:tattooItem.skinTone.deep" },
];

export const COVER_UP_TYPE_OPTIONS: TattooItemOption<TattooCoverUpType>[] = [
  {
    value: "cover_up",
    labelKey: "subprofiles:tattooItem.coverUpType.cover_up",
  },
  { value: "rework", labelKey: "subprofiles:tattooItem.coverUpType.rework" },
];

export const SCAR_WORK_TYPE_OPTIONS: TattooItemOption<TattooScarWorkType>[] = [
  {
    value: "top_surgery",
    labelKey: "subprofiles:tattooItem.scarWorkType.top_surgery",
  },
  { value: "areola", labelKey: "subprofiles:tattooItem.scarWorkType.areola" },
  {
    value: "self_harm",
    labelKey: "subprofiles:tattooItem.scarWorkType.self_harm",
  },
  {
    value: "stretch_marks",
    labelKey: "subprofiles:tattooItem.scarWorkType.stretch_marks",
  },
  { value: "other", labelKey: "subprofiles:tattooItem.scarWorkType.other" },
];

export const GUEST_SPOT_TYPE_OPTIONS: TattooItemOption<TattooGuestSpotType>[] =
  [
    {
      value: "guest_spot",
      labelKey: "subprofiles:tattooItem.spotType.guest_spot",
    },
    {
      value: "convention",
      labelKey: "subprofiles:tattooItem.spotType.convention",
    },
  ];

export const SHOP_TYPE_OPTIONS: TattooItemOption<TattooShopProductType>[] = [
  { value: "print", labelKey: "subprofiles:tattooItem.shopType.print" },
  {
    value: "flash_sheet",
    labelKey: "subprofiles:tattooItem.shopType.flash_sheet",
  },
  { value: "sticker", labelKey: "subprofiles:tattooItem.shopType.sticker" },
  { value: "merch", labelKey: "subprofiles:tattooItem.shopType.merch" },
  { value: "other", labelKey: "subprofiles:tattooItem.shopType.other" },
];
