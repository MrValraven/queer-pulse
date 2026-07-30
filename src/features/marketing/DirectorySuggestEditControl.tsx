import { useState } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type DirectoryPlace } from "./directoryPlaces";
import { DirectorySuggestEditModal } from "./DirectorySuggestEditModal";
import styles from "./DirectoryReportControl.module.css";

interface Props {
  place: DirectoryPlace;
  /** The viewer's own ref for this listing, present only when they own it. */
  ownerRef?: string;
}

/**
 * "Suggest an edit" — a subtle footer affordance next to `DirectoryReportControl`
 * on the business detail page's aside, letting a non-owner member flag a
 * correction (which field + a note) for the owner. Owners already have a
 * direct "Edit this listing" CTA (`DirectorySpacePage`), so this is gated to
 * hide when the viewer owns the listing (`ownerRef` set) — and, since the
 * suggestion is tied to a signed-in member, when they're logged out.
 */
export function DirectorySuggestEditControl({ place, ownerRef }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [suggesting, setSuggesting] = useState(false);

  if (ownerRef || !user) return null;

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setSuggesting(true)}
        aria-label={t("marketing:directory.detail.suggestEdit.ariaLabel", {
          name: place.name,
        })}
      >
        {t("marketing:directory.detail.suggestEdit.cta")}
      </button>

      {suggesting && (
        <DirectorySuggestEditModal
          slug={place.slug}
          placeName={place.name}
          onClose={() => setSuggesting(false)}
        />
      )}
    </div>
  );
}
