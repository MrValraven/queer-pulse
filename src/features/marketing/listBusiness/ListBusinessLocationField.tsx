import { useState } from "react";
import { FiCheck, FiGlobe } from "react-icons/fi";
import { Button, CheckLine, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { LocationPickerMap } from "../LocationPickerMap";
import { parseGoogleMapsUrl } from "./googleMapsLink";
import { geocodeAddress, resolveMapLink } from "./api/listings.api";
import {
  ANCHOR,
  neighbourhoodCentroid,
  type ListingDraft,
} from "./listBusiness.data";
import styles from "./ListBusinessPage.module.css";

type MapLinkStatus = "idle" | "resolving" | "error" | "demoHint";
/** State of the "Locate this address" flow, independent of the map-link flow:
 *  `resolving` (live geocode in flight), `error` (geocode failed — the
 *  neighbourhood fallback is offered), `demo` (demo mode dropped a centroid pin
 *  because it can't hit the geocoder). */
type AddressStatus = "idle" | "resolving" | "error" | "demo";

interface ListBusinessLocationFieldProps {
  draft: ListingDraft;
  set: (patch: Partial<ListingDraft>) => void;
}

interface AddressLocateSectionProps {
  address: string;
  hood: string;
  status: AddressStatus;
  onAddressChange: (value: string) => void;
  onLocate: () => void;
  onDropNeighbourhoodPin: () => void;
}

/** Address input + "Locate this address" (geocode / demo-centroid) + a
 *  neighbourhood-centroid fallback chip, so a member with only a street address
 *  is never stuck at the location gate (item #1). Presentational — the parent
 *  owns the geocode/centroid logic. */
function AddressLocateSection({
  address,
  hood,
  status,
  onAddressChange,
  onLocate,
  onDropNeighbourhoodPin,
}: AddressLocateSectionProps) {
  const { t } = useTranslation();
  const hasNeighbourhood = hood.trim().length > 0;

  return (
    <>
      <FormField
        className={styles.lbField}
        id={ANCHOR.address}
        label={t("marketing:listBusiness.step3.addressLabel")}
        required
        helper={t("marketing:listBusiness.step3.addressHelper")}
      >
        <div className={styles.geoRow}>
          <div>
            <input
              type="text"
              maxLength={120}
              placeholder={t("marketing:listBusiness.step3.addressPlaceholder")}
              value={address}
              onChange={(event) => onAddressChange(event.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            onClick={onLocate}
            disabled={status === "resolving" || address.trim().length === 0}
          >
            {status === "resolving"
              ? t("marketing:listBusiness.step3.resolving")
              : t("marketing:listBusiness.step3.locateAddress")}
          </Button>
        </div>
      </FormField>

      {status === "error" && (
        <div className={styles.mapStatusError} role="status">
          {t("marketing:listBusiness.step3.locateError")}
        </div>
      )}
      {status === "demo" && (
        <div className={styles.mapStatus} role="status">
          {t("marketing:listBusiness.step3.locateDemoHint")}
        </div>
      )}
      {hasNeighbourhood && (
        <button
          type="button"
          className={styles.usePlaceNameChip}
          onClick={onDropNeighbourhoodPin}
        >
          {t("marketing:listBusiness.step3.dropNeighbourhoodPin", { hood })}
        </button>
      )}
    </>
  );
}

interface MapLinkSectionProps {
  value: string;
  status: MapLinkStatus;
  onChange: (value: string) => void;
  onFind: () => void;
}

/** The original paste-a-Google-Maps-link flow, kept as a second way to place
 *  the pin. No longer marked required — it's one option among three. */
function MapLinkSection({ value, status, onChange, onFind }: MapLinkSectionProps) {
  const { t } = useTranslation();
  return (
    <>
      <FormField
        className={styles.lbField}
        label={t("marketing:listBusiness.step3.mapLinkLabel")}
        helper={t("marketing:listBusiness.step3.mapLinkHelper")}
      >
        <div className={styles.geoRow}>
          <div>
            <input
              type="url"
              inputMode="url"
              maxLength={2048}
              placeholder={t("marketing:listBusiness.step3.mapLinkPlaceholder")}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            onClick={onFind}
            disabled={status === "resolving" || value.trim().length === 0}
          >
            {status === "resolving"
              ? t("marketing:listBusiness.step3.resolving")
              : t("marketing:listBusiness.step3.findOnMap")}
          </Button>
        </div>
      </FormField>

      {status === "error" && (
        <div className={styles.mapStatusError} role="status">
          {t("marketing:listBusiness.step3.resolveError")}
        </div>
      )}
      {status === "demoHint" && (
        <div className={styles.mapStatus} role="status">
          {t("marketing:listBusiness.step3.unsupportedLinkDemo")}
        </div>
      )}
    </>
  );
}

/** Address text + three ways to place the pin so a member is NEVER stuck at the
 *  location gate (item #1): (1) "Locate this address" geocodes the typed address
 *  in live mode; (2) paste a Google Maps link; (3) a neighbourhood-centroid
 *  fallback drops an approximate pin once a neighbourhood is chosen. A draggable
 *  pin appears once coordinates exist, to fine-tune whichever way they arrived.
 *  Extracted from StepPractical to keep that component under the 200-line cap. */
export function ListBusinessLocationField({
  draft,
  set,
}: ListBusinessLocationFieldProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [mapLink, setMapLink] = useState("");
  const [linkStatus, setLinkStatus] = useState<MapLinkStatus>("idle");
  const [addressStatus, setAddressStatus] = useState<AddressStatus>("idle");
  const [resolvedPlaceName, setResolvedPlaceName] = useState<string | null>(
    null,
  );

  /** Drop an approximate pin on the chosen neighbourhood's centroid (city
   *  centroid for "Elsewhere"/unknown). Not truly geocoded — the member drags
   *  the pin to the exact spot — so `geocoded` stays false. */
  function placeNeighbourhoodPin() {
    const centroid = neighbourhoodCentroid(draft.hood);
    set({
      latitude: centroid.latitude,
      longitude: centroid.longitude,
      geocoded: false,
    });
    setResolvedPlaceName(null);
  }

  async function handleLocateAddress() {
    const trimmed = draft.address.trim();
    if (!trimmed) return;

    if (demoMode) {
      // Demo mode has no network: instead of calling geocodeAddress, drop the
      // neighbourhood-centroid pin directly and say so honestly.
      placeNeighbourhoodPin();
      setAddressStatus("demo");
      return;
    }

    setAddressStatus("resolving");
    try {
      const resolved = await geocodeAddress(trimmed);
      set({
        latitude: resolved.latitude,
        longitude: resolved.longitude,
        geocoded: true,
      });
      setResolvedPlaceName(resolved.placeName ?? null);
      setAddressStatus("idle");
    } catch {
      setAddressStatus("error");
    }
  }

  /** The explicit neighbourhood fallback action — also the escape hatch offered
   *  in the geocode-error state so the member is never stuck. */
  function handleDropNeighbourhoodPin() {
    placeNeighbourhoodPin();
    setAddressStatus("idle");
  }

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
      <div className={styles.onlineToggleRow}>
        <CheckLine
          checked={draft.online}
          onChange={(online) => set({ online })}
          title={t("marketing:listBusiness.step3.onlineOnly.title")}
          sub={t("marketing:listBusiness.step3.onlineOnly.sub")}
        />
      </div>

      {draft.online ? (
        <div className={styles.onlineNote} role="note">
          <FiGlobe aria-hidden />
          <span>{t("marketing:listBusiness.step3.onlineOnly.note")}</span>
        </div>
      ) : (
        <>
      <AddressLocateSection
        address={draft.address}
        hood={draft.hood}
        status={addressStatus}
        onAddressChange={(address) => set({ address })}
        onLocate={() => void handleLocateAddress()}
        onDropNeighbourhoodPin={handleDropNeighbourhoodPin}
      />

      <MapLinkSection
        value={mapLink}
        status={linkStatus}
        onChange={setMapLink}
        onFind={() => void handleFindOnMap()}
      />

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
              place:
                resolvedPlaceName ||
                draft.address.split(",")[0] ||
                draft.hood ||
                "",
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
      )}
    </>
  );
}
