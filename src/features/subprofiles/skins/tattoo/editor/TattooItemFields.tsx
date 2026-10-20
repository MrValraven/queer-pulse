import { useId } from "react";
import styles from "./TattooItemFields.module.css";
import {
  DatePicker,
  FormField,
  Select,
} from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import { ImageUploadField } from "../../../ImageUploadField";
import {
  TATTOO_LIMITS,
  isTattooItemSection,
  type TattooCoverUpType,
  type TattooFlashAvailability,
  type TattooGuestSpotType,
  type TattooScarWorkType,
  type TattooShopProductType,
  type TattooSkinTone,
} from "../tattooVocab.data";
import {
  COVER_UP_TYPE_OPTIONS,
  FLASH_AVAILABILITY_OPTIONS,
  GUEST_SPOT_TYPE_OPTIONS,
  SCAR_WORK_TYPE_OPTIONS,
  SHOP_TYPE_OPTIONS,
  SKIN_TONE_OPTIONS,
  type TattooItemOption,
} from "./tattooItemFields.data";
import {
  isTattooPrice,
  withImagesChanged,
  withStructuredKey,
} from "./tattooItemDraft";
import { TattooFlashDayEventPicker } from "./TattooFlashDayEventPicker";
import { TattooPhotoFields } from "./TattooPhotoFields";
import { TattooPlacementsField } from "./TattooPlacementsField";
import { TattooSessionsField } from "./TattooSessionsField";

interface TattooItemFieldsProps {
  draft: SubprofileItemView;
  original: SubprofileItemView;
  isNew: boolean;
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}

type SectionProps = TattooItemFieldsProps;

function TextInputField({
  label,
  value,
  placeholder,
  maxLength,
  inputMode,
  error,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "decimal";
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <FormField label={label} error={error}>
      <input
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </FormField>
  );
}

function OptionSelectField<Value extends string>({
  label,
  helper,
  options,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  helper?: string;
  options: TattooItemOption<Value>[];
  value: string;
  placeholder?: string;
  onChange: (value: Value) => void;
}) {
  const { t } = useTranslation();
  return (
    <FormField label={label} helper={helper}>
      <Select
        options={options.map((option) => ({
          value: option.value,
          label: t(option.labelKey),
        }))}
        value={value}
        placeholder={placeholder}
        onChange={(chosen) => onChange((chosen ?? "") as Value)}
      />
    </FormField>
  );
}

/** The record without one key (the wire type has no empty value for it). */
function withoutKey<Shape extends object, Key extends keyof Shape>(
  record: Shape,
  key: Key,
): Omit<Shape, Key> {
  const remaining = { ...record };
  delete remaining[key];
  return remaining;
}

function FlashFields({ draft, onPatch }: SectionProps) {
  const { t } = useTranslation();
  const flash = draft.structured?.flash ?? {};
  const price = flash.price ?? "";
  const writeFlash = (partial: typeof flash) =>
    onPatch(withStructuredKey(draft, "flash", { ...flash, ...partial }));
  return (
    <>
      <OptionSelectField
        label={t("subprofiles:tattooItem.flashAvailability.label")}
        options={FLASH_AVAILABILITY_OPTIONS}
        value={flash.availability ?? ""}
        onChange={(availability: TattooFlashAvailability | "") => {
          if (availability !== "") return writeFlash({ availability });
          // "Not set" removes the key; the wire type has no empty value.
          onPatch(
            withStructuredKey(
              draft,
              "flash",
              withoutKey(flash, "availability"),
            ),
          );
        }}
      />
      <TextInputField
        label={t("subprofiles:tattooItem.size.label")}
        value={flash.size ?? ""}
        placeholder={t("subprofiles:tattooItem.size.placeholder")}
        maxLength={TATTOO_LIMITS.sizeMax}
        onChange={(size) => writeFlash({ size })}
      />
      <TextInputField
        label={t("subprofiles:tattooItem.price.label")}
        value={price}
        placeholder={t("subprofiles:tattooItem.price.placeholder")}
        inputMode="decimal"
        error={
          isTattooPrice(price)
            ? undefined
            : t("subprofiles:tattooItem.status.priceInvalid")
        }
        onChange={(nextPrice) => writeFlash({ price: nextPrice })}
      />
      <TattooPlacementsField
        placements={flash.placements ?? []}
        onChange={(placements) => writeFlash({ placements })}
      />
    </>
  );
}

function WannaDoFields({ draft, onPatch }: SectionProps) {
  const { t } = useTranslation();
  const flash = draft.structured?.flash ?? {};
  const writeFlash = (partial: typeof flash) =>
    onPatch(withStructuredKey(draft, "flash", { ...flash, ...partial }));
  return (
    <>
      <TextInputField
        label={t("subprofiles:tattooItem.size.label")}
        value={flash.size ?? ""}
        placeholder={t("subprofiles:tattooItem.size.placeholder")}
        maxLength={TATTOO_LIMITS.sizeMax}
        onChange={(size) => writeFlash({ size })}
      />
      <TattooPlacementsField
        placements={flash.placements ?? []}
        onChange={(placements) => writeFlash({ placements })}
      />
    </>
  );
}

function HealedFields(props: SectionProps) {
  const { t } = useTranslation();
  const { draft, onPatch } = props;
  const healed = draft.structured?.healed ?? {};
  const writeHealed = (partial: typeof healed) =>
    onPatch(withStructuredKey(draft, "healed", { ...healed, ...partial }));
  return (
    <>
      <TextInputField
        label={t("subprofiles:tattooItem.healedFor.label")}
        value={healed.healedFor ?? ""}
        placeholder={t("subprofiles:tattooItem.healedFor.placeholder")}
        maxLength={TATTOO_LIMITS.healedForMax}
        onChange={(healedFor) => writeHealed({ healedFor })}
      />
      <TextInputField
        label={t("subprofiles:tattooItem.placement.label")}
        value={healed.placement ?? ""}
        placeholder={t("subprofiles:tattooItem.placement.placeholder")}
        maxLength={TATTOO_LIMITS.healedPlacementMax}
        onChange={(placement) => writeHealed({ placement })}
      />
      <OptionSelectField
        label={t("subprofiles:tattooItem.skinTone.label")}
        helper={t("subprofiles:tattooItem.skinTone.helper")}
        options={SKIN_TONE_OPTIONS}
        value={healed.skinTone ?? ""}
        onChange={(skinTone) =>
          writeHealed({ skinTone: skinTone as TattooSkinTone })
        }
      />
      <TattooPhotoFields {...props} />
    </>
  );
}

function CoverUpFields(props: SectionProps) {
  const { t } = useTranslation();
  const beforePhotoLabelId = useId();
  const { draft, onPatch } = props;
  const coverUp = draft.structured?.coverUp;
  const writeCoverUp = (partial: Partial<NonNullable<typeof coverUp>>) =>
    onPatch(
      withImagesChanged(
        draft,
        withStructuredKey(draft, "coverUp", {
          type: coverUp?.type ?? ("" as TattooCoverUpType),
          beforeImageUrl: coverUp?.beforeImageUrl ?? "",
          ...partial,
        }),
      ),
    );
  return (
    <>
      <OptionSelectField
        label={t("subprofiles:tattooItem.coverUpType.label")}
        options={COVER_UP_TYPE_OPTIONS}
        value={coverUp?.type ?? ""}
        onChange={(type: TattooCoverUpType) => writeCoverUp({ type })}
      />
      <FormField>
        <div role="group" aria-labelledby={beforePhotoLabelId}>
          <span id={beforePhotoLabelId} className={styles.groupLabel}>
            {t("subprofiles:tattooItem.beforePhoto.label")}
          </span>
          <ImageUploadField
            value={coverUp?.beforeImageUrl ?? ""}
            kind="work-image"
            onChange={(beforeImageUrl) => writeCoverUp({ beforeImageUrl })}
          />
        </div>
      </FormField>
      <TattooPhotoFields {...props} />
    </>
  );
}

function ScarWorkFields(props: SectionProps) {
  const { t } = useTranslation();
  const { draft, onPatch } = props;
  return (
    <>
      <OptionSelectField
        label={t("subprofiles:tattooItem.scarWorkType.label")}
        options={SCAR_WORK_TYPE_OPTIONS}
        value={draft.structured?.scarWork?.type ?? ""}
        onChange={(type: TattooScarWorkType) =>
          onPatch(withStructuredKey(draft, "scarWork", { type }))
        }
      />
      <TattooPhotoFields {...props} />
    </>
  );
}

function GuestSpotFields({ draft, onPatch }: SectionProps) {
  const { t } = useTranslation();
  const spot = draft.structured?.spot;
  const writeSpot = (partial: Partial<NonNullable<typeof spot>>) =>
    onPatch(
      withStructuredKey(draft, "spot", {
        type: spot?.type ?? ("" as TattooGuestSpotType),
        ...(spot ?? {}),
        ...partial,
      }),
    );
  return (
    <>
      <OptionSelectField
        label={t("subprofiles:tattooItem.spotType.label")}
        options={GUEST_SPOT_TYPE_OPTIONS}
        value={spot?.type ?? ""}
        onChange={(type: TattooGuestSpotType) => writeSpot({ type })}
      />
      <FormField label={t("subprofiles:tattooItem.endDate.label")}>
        <DatePicker
          mode="date"
          label={t("subprofiles:tattooItem.endDate.label")}
          value={spot?.endDate ? spot.endDate : null}
          min={draft.date || undefined}
          clearable
          onChange={(endDate) => writeSpot({ endDate: endDate ?? "" })}
        />
      </FormField>
    </>
  );
}

function FlashDayFields({ draft, onPatch }: SectionProps) {
  const { t } = useTranslation();
  const flashDay = draft.structured?.flashDay ?? {};
  return (
    <>
      <TattooFlashDayEventPicker draft={draft} onPatch={onPatch} />
      <TextInputField
        label={t("subprofiles:tattooItem.cause.label")}
        value={flashDay.cause ?? ""}
        placeholder={t("subprofiles:tattooItem.cause.placeholder")}
        maxLength={TATTOO_LIMITS.causeMax}
        onChange={(cause) =>
          onPatch(withStructuredKey(draft, "flashDay", { ...flashDay, cause }))
        }
      />
    </>
  );
}

function ShopFields({ draft, onPatch }: SectionProps) {
  const { t } = useTranslation();
  const shop = draft.structured?.shop;
  const price = shop?.price ?? "";
  const writeShop = (partial: Partial<NonNullable<typeof shop>>) =>
    onPatch(
      withStructuredKey(draft, "shop", {
        type: shop?.type ?? ("" as TattooShopProductType),
        ...(shop ?? {}),
        ...partial,
      }),
    );
  return (
    <>
      <OptionSelectField
        label={t("subprofiles:tattooItem.shopType.label")}
        options={SHOP_TYPE_OPTIONS}
        value={shop?.type ?? ""}
        onChange={(type: TattooShopProductType) => writeShop({ type })}
      />
      <TextInputField
        label={t("subprofiles:tattooItem.price.label")}
        value={price}
        placeholder={t("subprofiles:tattooItem.price.placeholder")}
        inputMode="decimal"
        error={
          isTattooPrice(price)
            ? undefined
            : t("subprofiles:tattooItem.status.priceInvalid")
        }
        onChange={(nextPrice) => writeShop({ price: nextPrice })}
      />
    </>
  );
}

/** The in-progress fields: the sessions list, then the shared photo fields. */
function InProgressFields(props: SectionProps) {
  return (
    <>
      <TattooSessionsField draft={props.draft} onPatch={props.onPatch} />
      <TattooPhotoFields {...props} />
    </>
  );
}

/** The tattoo item fields for one drawer draft, by section; null outside TATTOO_ITEM_SECTIONS. */
export function TattooItemFields(props: TattooItemFieldsProps) {
  const section = props.draft.section;
  if (!isTattooItemSection(section)) return null;
  switch (section) {
    case "flash":
      return <FlashFields {...props} />;
    case "wanna_dos":
      return <WannaDoFields {...props} />;
    case "healed":
      return <HealedFields {...props} />;
    case "in_progress":
      return <InProgressFields {...props} />;
    case "cover_ups":
      return <CoverUpFields {...props} />;
    case "scar_work":
      return <ScarWorkFields {...props} />;
    case "guest_spots":
      return <GuestSpotFields {...props} />;
    case "flash_days":
      return <FlashDayFields {...props} />;
    case "shop":
      return <ShopFields {...props} />;
  }
}
