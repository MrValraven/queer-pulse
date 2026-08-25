import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { relativeAgo } from "../../../../shared/lib/relativeAgo";
import type {
  ListingOperatingState,
  ManagedListingDTO,
} from "../api/listings.api";
import { useSetOperatingState } from "../api/useListingOwnerState";
import { ListingOperatingStateFields } from "./ListingOperatingStateFields";
import { ListingPermanentClosureDialog } from "./ListingPermanentClosureDialog";
import { OPERATING_STATE_LABEL_KEYS } from "./listingOperatingState.data";
import styles from "./ListingTrading.module.css";

/**
 * "Is this business still trading?": the owner's own report about their venue,
 * kept apart from the moderation status above it. Changing it here never sends
 * an approved listing back for review.
 *
 * The choice is staged locally and only sent when the owner presses the button,
 * so choosing "permanently closed" can open a confirmation that spells out what
 * that does before it does it (see `ListingPermanentClosureDialog`).
 */
export function ListingOperatingStateSection({
  listing,
}: {
  listing: ManagedListingDTO;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const setOperatingState = useSetOperatingState(listing.ref);
  const current = listing.operatingState;

  // Re-seed the staged choice whenever the server's own answer changes (our
  // own save landing, or a refetch): React's documented "adjust state while
  // rendering" pattern, so there is no extra committed frame showing the value
  // that was just replaced.
  const serverSignature = `${current.state}|${current.note ?? ""}|${current.movedToAddress ?? ""}`;
  const [appliedSignature, setAppliedSignature] = useState(serverSignature);
  const [chosenState, setChosenState] = useState<ListingOperatingState>(
    current.state,
  );
  const [note, setNote] = useState(current.note ?? "");
  const [movedToAddress, setMovedToAddress] = useState(
    current.movedToAddress ?? "",
  );
  const [isConfirmingClosure, setIsConfirmingClosure] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  if (appliedSignature !== serverSignature) {
    setAppliedSignature(serverSignature);
    setChosenState(current.state);
    setNote(current.note ?? "");
    setMovedToAddress(current.movedToAddress ?? "");
    setIsConfirmingClosure(false);
  }

  const trimmedNote = note.trim();
  const trimmedAddress = movedToAddress.trim();
  const isChanged =
    chosenState !== current.state ||
    (chosenState !== "open" && trimmedNote !== (current.note ?? "")) ||
    (chosenState === "moved" &&
      trimmedAddress !== (current.movedToAddress ?? ""));
  // A "we moved" banner with no destination tells a reader nothing, and the
  // server refuses it, so the button stays out of reach until there is one.
  const isMissingAddress = chosenState === "moved" && trimmedAddress === "";
  const canApply =
    isChanged && !isMissingAddress && !setOperatingState.isPending;

  const commit = () => {
    setFailure(null);
    setOperatingState.mutate(
      {
        state: chosenState,
        note: chosenState === "open" ? undefined : trimmedNote || undefined,
        movedToAddress: chosenState === "moved" ? trimmedAddress : undefined,
      },
      {
        onSuccess: () => {
          setIsConfirmingClosure(false);
          showToast(
            t(`marketing:listBusiness.trading.saved.${chosenState}`),
            "success",
          );
        },
        onError: (error) => {
          setIsConfirmingClosure(false);
          setFailure(
            error.message || t("marketing:listBusiness.trading.saveError"),
          );
        },
      },
    );
  };

  const apply = () => {
    if (!canApply) return;
    if (chosenState === "permanently_closed") {
      setIsConfirmingClosure(true);
      return;
    }
    commit();
  };

  return (
    <div className={styles.block}>
      <p className={styles.currently}>
        <span className={styles.currentlyLabel}>
          {t("marketing:listBusiness.trading.currently")}
        </span>{" "}
        <strong>{t(OPERATING_STATE_LABEL_KEYS[current.state])}</strong>
        {current.setAt && (
          <span className={styles.currentlySince}>
            {t("marketing:listBusiness.trading.since", {
              when: relativeAgo(current.setAt, t, fmt, {
                justNow: "marketing:listBusiness.trading.justNow",
                unknown: "marketing:listBusiness.trading.unknownWhen",
              }),
            })}
          </span>
        )}
      </p>

      <ListingOperatingStateFields
        chosenState={chosenState}
        note={note}
        movedToAddress={movedToAddress}
        onChangeState={setChosenState}
        onChangeNote={setNote}
        onChangeMovedToAddress={setMovedToAddress}
      />

      {failure && (
        <p role="alert" className={styles.failure}>
          {failure}
        </p>
      )}

      <div className={styles.applyRow}>
        <Button variant="primary" onClick={apply} disabled={!canApply}>
          {setOperatingState.isPending
            ? t("marketing:listBusiness.trading.applying")
            : t("marketing:listBusiness.trading.applyCta")}
        </Button>
        <span className={styles.applyHint}>
          {t("marketing:listBusiness.trading.applyHint")}
        </span>
      </div>

      {isConfirmingClosure && (
        <ListingPermanentClosureDialog
          placeName={listing.name}
          isSaving={setOperatingState.isPending}
          onConfirm={commit}
          onClose={() => setIsConfirmingClosure(false)}
        />
      )}
    </div>
  );
}
