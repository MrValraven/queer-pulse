import { useId, type Dispatch } from "react";
import { FiRotateCcw } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field } from "../CreateGatheringFields";
import { CostKindField } from "../steps/CostKindField";
import { PlaceFields } from "../steps/PlaceFields";
import type {
  AddMonthAction,
  AddMonthCostValues,
  AddMonthPlaceValues,
} from "./addMonthState";
import {
  useAddMonthCostForm,
  useAddMonthPlaceForm,
} from "./useAddMonthFieldForms";

interface AddMonthSharedEditProps {
  place: AddMonthPlaceValues;
  cost: AddMonthCostValues;
  dispatch: Dispatch<AddMonthAction>;
  /** The server refused the linked venue listing on the last publish. */
  isVenueListingRefused: boolean;
}

/**
 * The place and cost every date in the month shares, edited with the
 * wizard's own fields. The quiet button hands both back to the starting
 * event's values in one action.
 */
export function AddMonthSharedEdit({
  place,
  cost,
  dispatch,
  isVenueListingRefused,
}: AddMonthSharedEditProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const placeForm = useAddMonthPlaceForm({
    place,
    dispatch,
    isVenueListingRefused,
  });
  const costForm = useAddMonthCostForm({ cost, dispatch });
  return (
    <>
      <Field
        label={t("gatherings:addMonth.edit.placeHeading")}
        labelId={headingId}
      >
        <div role="group" aria-labelledby={headingId}>
          <PlaceFields form={placeForm} />
        </div>
      </Field>
      <Field
        label={t("gatherings:addMonth.edit.costHeading")}
        labelId={`${headingId}-cost`}
      >
        <div role="group" aria-labelledby={`${headingId}-cost`}>
          <CostKindField form={costForm} />
        </div>
      </Field>
      <Field label={<></>}>
        <Button
          type="button"
          variant="quiet"
          size="sm"
          onClick={() => dispatch({ type: "resetShared" })}
        >
          <FiRotateCcw aria-hidden />{" "}
          {t("gatherings:addMonth.edit.resetToTemplate")}
        </Button>
      </Field>
    </>
  );
}
