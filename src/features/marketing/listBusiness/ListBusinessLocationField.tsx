import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { LocationPickerMap } from "../LocationPickerMap";
import { parseGoogleMapsUrl } from "./googleMapsLink";
import { resolveMapLink } from "./api/listings.api";
import { ANCHOR, type ListingDraft } from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

type MapLinkStatus = "idle" | "resolving" | "error" | "demoHint";

interface ListBusinessLocationFieldProps {
  draft: ListingDraft;
  set: (patch: Partial<ListingDraft>) => void;
}

/** Address text + "paste a Google Maps link" flow: resolves a pasted link to
 *  coordinates (locally for a full share-URL, via the backend for a short
 *  goo.gl link) and renders a draggable pin once coordinates exist. Extracted
 *  from StepPractical to keep that component under the 200-line cap. */
export function ListBusinessLocationField({
  draft,
  set,
}: ListBusinessLocationFieldProps) {
  const { t } = useTranslation();
  const demoMode = useDemoMode();
  const [mapLink, setMapLink] = useState("");
  const [linkStatus, setLinkStatus] = useState<MapLinkStatus>("idle");
  const [resolvedPlaceName, setResolvedPlaceName] = useState<string | null>(
    null,
  );

  async function handleFindOnMap() {
    const trimmed = mapLink.trim();
    if (!trimmed) return;
    setLinkStatus("idle");

    const localMatch = parseGoogleMapsUrl(trimmed);
    if (localMatch) {
      set({
        latitude: localMatch.latitude,
        longitude: localMatch.longitude,
        geocoded: true,
      });
      setResolvedPlaceName(localMatch.placeName ?? null);
      return;
    }
    if (demoMode) {
      // Demo mode never hits the network: any link that didn't parse locally
      // (short goo.gl link, a google.com/maps link with no coord pattern, or
      // garbage) surfaces the same "paste the full link" hint instead of
      // calling resolveMapLink.
      setLinkStatus("demoHint");
      return;
    }
    setLinkStatus("resolving");
    try {
      const resolved = await resolveMapLink(trimmed);
      set({
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        geocoded: true,
      });
      setResolvedPlaceName(resolved.placeName ?? null);
      setLinkStatus("idle");
    } catch {
      setLinkStatus("error");
    }
  }

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.address}
        label={t("marketing:listBusiness.step3.addressLabel")}
        required
        helper={t("marketing:listBusiness.step3.addressHelper")}
      >
        <input
          type="text"
          maxLength={120}
          placeholder={t("marketing:listBusiness.step3.addressPlaceholder")}
          value={draft.address}
          onChange={(e) => set({ address: e.target.value })}
        />
      </FormField>

      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step3.mapLinkLabel")}
        required
        helper={t("marketing:listBusiness.step3.mapLinkHelper")}
      >
        <div className={styles.geoRow}>
          <div>
            <input
              type="url"
              inputMode="url"
              maxLength={2048}
              placeholder={t("marketing:listBusiness.step3.mapLinkPlaceholder")}
              value={mapLink}
              onChange={(event) => setMapLink(event.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            onClick={handleFindOnMap}
            disabled={linkStatus === "resolving" || mapLink.trim().length === 0}
          >
            {linkStatus === "resolving"
              ? t("marketing:listBusiness.step3.resolving")
              : t("marketing:listBusiness.step3.findOnMap")}
          </Button>
        </div>
      </FormField>

      {linkStatus === "error" && (
        <div className={styles.mapStatusError} role="status">
          {t("marketing:listBusiness.step3.resolveError")}
        </div>
      )}
      {linkStatus === "demoHint" && (
        <div className={styles.mapStatus} role="status">
          {t("marketing:listBusiness.step3.unsupportedLinkDemo")}
        </div>
      )}

      {draft.latitude !== null && draft.longitude !== null && (
        <div className={styles.mapWrap}>
          <LocationPickerMap
            latitude={draft.latitude}
            longitude={draft.longitude}
            onChange={(latitude, longitude) => set({ latitude, longitude })}
          />
          <div className={styles.mapStatus}>
            <FiCheck size={13} />{" "}
            {t("marketing:listBusiness.step3.pinPlaced", {
              place: resolvedPlaceName ?? draft.address.split(",")[0] ?? "",
            })}
          </div>
          {resolvedPlaceName && resolvedPlaceName !== draft.address && (
            <button
              type="button"
              className={styles.usePlaceNameChip}
              onClick={() => set({ address: resolvedPlaceName })}
            >
              {t("marketing:listBusiness.step3.usePlaceName", {
                place: resolvedPlaceName,
              })}
            </button>
          )}
        </div>
      )}
    </>
  );
}
