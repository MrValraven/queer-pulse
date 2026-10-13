import { ChipSelect, RadioCardGroup } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import {
  LISTING_PAYMENT_METHODS,
  normalizePaymentMethods,
  PAYMENT_METHOD_LABEL_KEYS,
} from "../listingFacts.data";
import { listingKindOf } from "../listingMobile.data";
import type { ListingForm } from "../useListingForm";
import { FactFieldset } from "./EntryFields";
import {
  factFieldsetIds,
  NIF_CHOICE_LABEL_KEYS,
  NIF_CHOICES,
  nifChoiceOf,
  nifValueOf,
  type NifChoice,
} from "./practicalFacts.data";
import pageStyles from "../ListBusinessPage.module.css";

/** "Ways to pay" for a place and an out-and-about listing (online keeps its
 *  own list under "How people buy from you"), then "Invoices with your NIF"
 *  for every kind: yes, no, or not saying. */
export function WaysToPayFields({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const { draft, toggleWayToPay, setIssuesNifInvoices } = form;
  const payments = normalizePaymentMethods(draft.payments);
  const isOnline = listingKindOf(draft) === "online";
  const payIds = factFieldsetIds(ANCHOR.waysToPay);
  const nifIds = factFieldsetIds(ANCHOR.nifInvoices);

  return (
    <>
      {!isOnline && (
        <FactFieldset
          anchor={ANCHOR.waysToPay}
          legend={t("marketing:listBusiness.step3.pay.label")}
          helper={t("marketing:listBusiness.step3.pay.helper")}
        >
          <ChipSelect
            labelledBy={payIds.legendId}
            options={LISTING_PAYMENT_METHODS.map((method) => ({
              value: method,
              label: t(PAYMENT_METHOD_LABEL_KEYS[method]),
            }))}
            selected={new Set<string>(payments)}
            onToggle={(value) => {
              const [method] = normalizePaymentMethods([value]);
              if (method) toggleWayToPay(method);
            }}
          />
        </FactFieldset>
      )}
      <FactFieldset
        anchor={ANCHOR.nifInvoices}
        legend={t("marketing:listBusiness.step3.nif.label")}
        helper={t("marketing:listBusiness.step3.nif.helper")}
      >
        <RadioCardGroup<NifChoice>
          className={pageStyles.chipRow}
          optionClassName={pageStyles.chip}
          checkedClassName={pageStyles.chipOn}
          ariaLabel={t("marketing:listBusiness.step3.nif.label")}
          ariaLabelledBy={nifIds.legendId}
          value={nifChoiceOf(draft.issuesNifInvoices)}
          onChange={(choice) => setIssuesNifInvoices(nifValueOf(choice))}
          options={NIF_CHOICES.map((choice) => ({
            id: choice,
            render: t(NIF_CHOICE_LABEL_KEYS[choice]),
          }))}
        />
      </FactFieldset>
    </>
  );
}
