import { useEffect, useId, useState } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ManagedListingItem } from "../../marketing/listBusiness/api/managedListings.api";
import { useManagedListings } from "../../marketing/listBusiness/api/useManagedListings";
import { Field } from "../CreateGatheringFields";
import { meetingPointPrefill } from "../runByListing";
import type { GatheringForm } from "../useGatheringForm";

/** The option value for "No business". */
const NO_BUSINESS_VALUE = "";

/** Where a refused publish lands the host (`usePublishGathering`). */
export const RUN_BY_FIELD_ANCHOR = "create-gathering-run-by";

/**
 * The businesses a host may name as running a gathering: the listings they
 * own or co-manage that can take a new link (the endpoint leaves out paused
 * and closed ones), plus "No business". Shared by the create form and the
 * manage page's editor. Reports the picked listing (or null), whose `id` is
 * what a save sends.
 */
export function RunByPicker({
  id,
  items,
  value,
  onChange,
  describedBy,
}: {
  id: string;
  items: ManagedListingItem[];
  /** The picked listing's id, or null for none. */
  value: string | null;
  onChange: (item: ManagedListingItem | null) => void;
  describedBy?: string;
}) {
  const { t } = useTranslation();
  return (
    <Select
      id={id}
      aria-describedby={describedBy}
      options={[
        {
          value: NO_BUSINESS_VALUE,
          label: t("gatherings:create.v2.who.runByNone"),
        },
        ...items.map((item) => ({ value: item.id, label: item.name })),
      ]}
      value={value ?? NO_BUSINESS_VALUE}
      onChange={(next) =>
        onChange(items.find((item) => item.id === next) ?? null)
      }
    />
  );
}

/**
 * "Run by one of your businesses", optional, in the "Who is it for?"
 * chapter. Shown only to a host who manages at least one listing. Picking a
 * business with a public meeting point fills the gathering's neighbourhood
 * and address where they are still empty, and the hint says so.
 *
 * A pick the server refused on publish (a business hidden or paused since,
 * or one this host no longer runs) shows its error here until the host picks
 * again. A restored draft naming a business this host no longer runs is
 * dropped once sign-in has settled and the list has loaded, so the publish never sends it.
 */
export function RunByField({ form }: { form: GatheringForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const selectId = `${fieldId}-run-by`;
  const { checking } = useAuth();
  const { items, isResolving } = useManagedListings();
  const [prefilledFrom, setPrefilledFrom] = useState<string | null>(null);
  const { runByListingId, setRunByListingId } = form;
  const isUnmanaged =
    runByListingId !== null &&
    !checking &&
    !isResolving &&
    !items.some((item) => item.id === runByListingId);
  useEffect(() => {
    if (isUnmanaged) setRunByListingId(null);
  }, [isUnmanaged, setRunByListingId]);
  if (items.length === 0) return null;

  const choose = (item: ManagedListingItem | null) => {
    setRunByListingId(item?.id ?? null);
    const prefill = meetingPointPrefill(
      { hood: form.hood, address: form.address },
      item?.meetingPoint ?? null,
    );
    if (prefill.hood !== undefined) form.setHood(prefill.hood);
    if (prefill.address !== undefined) form.setAddress(prefill.address);
    const isPrefilled =
      prefill.hood !== undefined || prefill.address !== undefined;
    setPrefilledFrom(isPrefilled && item ? item.name : null);
  };

  const hint = prefilledFrom
    ? t("gatherings:create.v2.who.runByPrefilled", { name: prefilledFrom })
    : t("gatherings:create.v2.who.runByHint");
  return (
    <Field
      label={t("gatherings:create.v2.who.runByLabel")}
      htmlFor={selectId}
      isOptional
      anchorId={RUN_BY_FIELD_ANCHOR}
      hint={form.isRunByListingRefused ? undefined : hint}
      error={
        form.isRunByListingRefused
          ? t("gatherings:create.v2.who.runByRefused")
          : undefined
      }
    >
      <RunByPicker
        id={selectId}
        describedBy={
          form.isRunByListingRefused ? `${selectId}-error` : `${selectId}-hint`
        }
        items={items}
        value={runByListingId}
        onChange={choose}
      />
    </Field>
  );
}
