import { FiShield } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import s from "./DirectoryProvenance.module.css";

/**
 * Turn a `YYYY-MM-DD` wire date into a localized one. Built from the parts
 * rather than handed to `new Date(string)`, which would read the value as UTC
 * midnight and could render the day before in a western timezone.
 */
function formatIsoDate(
  value: string,
  formatDate: (date: Date) => string,
): string | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!parts) return null;
  const [, year, month, day] = parts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : formatDate(date);
}

/**
 * The evidence behind the "verified queer-owned" badge: who confirmed it, when
 * they last confirmed it, on what basis, and when it next needs re-checking.
 *
 * The badge and the safe-space seal further down the page both look
 * authoritative, so they should be checkable in the same way. The safe-space
 * block already names its verifier and its re-verified date; this says the same
 * kinds of things in the same order, directly under the badge it explains, so
 * the two read as siblings rather than as two different kinds of claim.
 *
 * Whether the badge applies at all is `place.queerOwnedVerified`, which the
 * server already computes as "granted and not lapsed". This component never
 * re-derives that from the expiry date: it renders only when the server says
 * the badge reads as verified, and then only when there is provenance to show.
 */
export function DirectoryQueerOwnedProvenance({
  place,
}: {
  place: DirectoryPlace;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const verification = place.queerOwnedVerification;

  if (!place.queerOwnedVerified || !verification) return null;

  const formatDate = (date: Date) => fmt.date(date);
  const reVerifiedAt = verification.reVerifiedAt
    ? formatIsoDate(verification.reVerifiedAt, formatDate)
    : null;
  const expiresAt = verification.expiresAt
    ? formatIsoDate(verification.expiresAt, formatDate)
    : null;
  const verifier = verification.verifier?.trim() ?? "";
  const basis = verification.basis?.trim() ?? "";

  // Nothing on record beyond the grant itself: the badge stands on its own
  // rather than being dressed up with an empty evidence panel.
  if (!verifier && !reVerifiedAt && !basis && !expiresAt) return null;

  const headlineKey =
    verifier && reVerifiedAt
      ? "marketing:directory.detail.queerOwned.byOnDate"
      : verifier
        ? "marketing:directory.detail.queerOwned.by"
        : "marketing:directory.detail.queerOwned.onDate";

  return (
    <div className={s.provenance}>
      <span className={s.icon} aria-hidden>
        <FiShield />
      </span>
      <div className={s.body}>
        {(verifier || reVerifiedAt) && (
          <p className={s.line}>
            <Translation
              i18nKey={headlineKey}
              values={{ verifier, date: reVerifiedAt ?? "" }}
              components={{ strong: <strong /> }}
            />
          </p>
        )}
        {basis && <p className={s.basis}>{basis}</p>}
        {expiresAt && (
          <p className={s.renewal}>
            {t("marketing:directory.detail.queerOwned.nextCheck", {
              date: expiresAt,
            })}
          </p>
        )}
      </div>
    </div>
  );
}
