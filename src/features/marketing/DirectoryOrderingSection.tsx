import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectoryOrderingBody } from "./DirectoryOrderingBody";
import { hasOrderingContent, isSessionsOnly } from "./directoryOrdering.data";
import s from "./DirectorySpacePage.module.css";

/**
 * "Ordering & delivery": how to buy from a business that sells online and how
 * it reaches you. Takes the hours section's place for an online-only listing
 * and follows the hours for a place that also sells online. Renders nothing
 * when the business has said nothing here. A business that only books
 * sessions reads "Booking & sessions" instead (see `isSessionsOnly`).
 */
export function DirectoryOrderingSection({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const details = place.onlineDetails;
  if (!details || !hasOrderingContent(details)) return null;
  const isSessions = isSessionsOnly(details);
  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey={
            isSessions
              ? "marketing:directory.detail.ordering.titleSessions"
              : "marketing:directory.detail.ordering.title"
          }
          components={{ em: <em /> }}
        />
      </h2>
      <p className={s.subLine}>
        {t(
          isSessions
            ? "marketing:directory.detail.ordering.subSessions"
            : "marketing:directory.detail.ordering.sub",
          { name: place.name },
        )}
      </p>
      <DirectoryOrderingBody details={details} />
    </section>
  );
}
