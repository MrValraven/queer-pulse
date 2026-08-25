import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";
import styles from "./DirectoryServices.module.css";

/**
 * "What it costs": the things this business sells, with the owner's own price
 * against each one.
 *
 * The single price band up in the header is unchanged and stays the
 * at-a-glance signal for scanning a grid. This section answers the question
 * that band cannot: what, specifically, and for how much. Prices are free
 * text, so "from 25 EUR", "sliding scale", "first session free" and "by quote"
 * all render as written rather than being forced into a number.
 *
 * Renders nothing when the business prices nothing here, which is most of them
 * and all of the demo fixtures.
 */
export function DirectoryServicesSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const services = place.services ?? [];
  if (services.length === 0) return null;

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="marketing:directory.detail.services.title"
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.subLine}>
        {t(
          place.owner.first
            ? "marketing:directory.detail.services.subNamed"
            : "marketing:directory.detail.services.sub",
          { name: place.owner.first },
        )}
      </p>
      <ul className={styles.list}>
        {services.map((service, index) => (
          // Index-keyed: this list is read-only and never reorders on screen,
          // and two rows can legitimately share a name and a price.
          <li key={index} className={styles.row}>
            <span className={styles.body}>
              <span className={styles.name}>{service.name}</span>
              {service.note.trim() !== "" && (
                <span className={styles.note}>{service.note}</span>
              )}
            </span>
            <span className={styles.price}>{service.price}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
