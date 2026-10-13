import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { gettingInRows } from "./directoryGettingIn.data";
import { type DirectoryPlace } from "./directoryPlaces";
import { listingKindOf } from "./listBusiness/listingMobile.data";
import s from "./DirectorySpacePage.module.css";

/** "Before you go": how people get in, what entry costs, how to pay, NIF
 *  invoices and the languages spoken (codes translated, the owner's other
 *  languages as written). An online listing reads "Good to know". Renders
 *  nothing for a listing that answered none of it. */
export function DirectoryGettingInSection({
  place,
}: {
  place: DirectoryPlace;
}) {
  const { t } = useTranslation();
  const rows = gettingInRows(t, place);
  if (rows.length === 0) return null;
  const isOnline = listingKindOf(place) === "online";
  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey={
            isOnline
              ? "marketing:directory.detail.gettingIn.titleOnline"
              : "marketing:directory.detail.gettingIn.title"
          }
          components={{ em: <em /> }}
        />
      </h2>
      <dl className={s.gettingInRows}>
        {rows.map((row) => (
          <div key={row.key} className={s.gettingInRow}>
            <dt>{t(row.labelKey)}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
