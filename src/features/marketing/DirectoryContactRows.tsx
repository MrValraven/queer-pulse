import {
  operatingStateOf,
  type DirectoryPlace,
  websiteHref,
  websiteLabel,
} from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

/**
 * Every way to reach this business: phone, website, Instagram, email.
 *
 * A permanently closed business keeps its phone and inbox VISIBLE as part of
 * the record but stops offering them as things you can dial or write to, since
 * nobody is on the other end. Its website and Instagram stay live links: an
 * archived page or feed often carries the closure notice itself. A moved
 * business keeps every route, because the premises changed and the business
 * carried on.
 *
 * Extracted out of `DirectorySpaceAside` when the practical answers moved into
 * the main column, so the rows themselves are unchanged and have exactly one
 * definition.
 */
export function DirectoryContactRows({ place }: { place: DirectoryPlace }) {
  const isPermanentlyClosed = operatingStateOf(place) === "permanently_closed";
  const instagramUrl = place.social.instagram
    ? `https://instagram.com/${place.social.instagram.replace(/^@/, "")}`
    : undefined;

  return (
    <>
      {place.social.phone && (
        <div className={s.contactRow}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 5.15 8.81 19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.16.93.4 1.83.7 2.7" />
          </svg>
          {isPermanentlyClosed ? (
            <span className={s.contactDead}>{place.social.phone}</span>
          ) : (
            <a href={`tel:${place.social.phone.replace(/\s/g, "")}`}>
              {place.social.phone}
            </a>
          )}
        </div>
      )}
      {place.social.website && (
        <div className={s.contactRow}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx={12} cy={12} r={10} />
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" />
          </svg>
          <a
            href={websiteHref(place.social.website)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {websiteLabel(place.social.website)}
          </a>
        </div>
      )}
      {instagramUrl && (
        <div className={s.contactRow}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <rect x={2} y={2} width={20} height={20} rx={5} />
            <circle cx={12} cy={12} r={4} />
            <line x1={17.5} y1={6.5} x2={17.5} y2={6.5} />
          </svg>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            {place.social.instagram}
          </a>
        </div>
      )}
      {place.social.email && (
        <div className={s.contactRow}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <rect x={2} y={4} width={20} height={16} rx={2} />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {isPermanentlyClosed ? (
            <span className={s.contactDead}>{place.social.email}</span>
          ) : (
            <a href={`mailto:${place.social.email}`}>{place.social.email}</a>
          )}
        </div>
      )}
    </>
  );
}
