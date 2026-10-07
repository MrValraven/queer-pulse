import { CheckLine } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { ANCHOR } from "../listBusiness.data";
import type { ListingForm } from "../useListingForm";
import { OnlineSellingFields } from "./OnlineSellingFields";
import styles from "../ListBusinessPage.module.css";

/** A place's "We also sell online", below its hours. Ticking it reveals the
 *  online selling fields (no pick-up: the place has an address) and makes the
 *  main link required. Unticking keeps every answer in the draft; the save
 *  sends the empty block until it is ticked again. */
export function AlsoSellsOnlineField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const isOn = form.draft.hasOnlineShop === true;
  return (
    <>
      <div id={ANCHOR.hasOnlineShop} className={styles.onlineToggleRow}>
        <CheckLine
          checked={isOn}
          onChange={form.setHasOnlineShop}
          title={t("marketing:listBusiness.online.alsoSells.title")}
          sub={t("marketing:listBusiness.online.alsoSells.sub")}
        />
      </div>
      {isOn && (
        <>
          <h3 className={styles.groupH}>
            {t("marketing:listBusiness.online.alsoSells.heading")}
          </h3>
          <OnlineSellingFields form={form} variant="place" />
        </>
      )}
    </>
  );
}
