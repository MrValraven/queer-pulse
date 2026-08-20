import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { ConfirmDialog, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyHousingListings } from "./api/useMyHousingListings";
import {
  useDeleteHousingListing,
  useMyHousingListingAction,
} from "./api/useHousingListingOwnerActions";
import type { MyHousingListingRow } from "./myHousingListings.data";
import {
  MyHousingListingCard,
  MyHousingListingsEmpty,
  MyHousingListingsError,
} from "./MyHousingListingsSections";
import { EditHousingListingModal } from "./EditHousingListingModal";
import { ListSpaceModal } from "./ListSpaceModal";
import styles from "./MyHousingListingsPage.module.css";

/**
 * HSG-1/HSG-9: the member's own housing listings, with per-row edit / mark
 * filled-available / extend / delete — the owner management view that was
 * entirely missing (a listing was previously permanently stuck as-posted).
 */
export function MyHousingListingsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data: listings = [], isLoading, isError, refetch } =
    useMyHousingListings();
  const action = useMyHousingListingAction();
  const deleteListing = useDeleteHousingListing();

  const [editing, setEditing] = useState<MyHousingListingRow | null>(null);
  const [deletingRef, setDeletingRef] = useState<string | null>(null);
  const [listing, setListing] = useState(false);
  const [busyRef, setBusyRef] = useState<string | null>(null);

  const runAction = (
    ref: string,
    input: Parameters<typeof action.mutate>[0],
    toastKey: string,
  ) => {
    setBusyRef(ref);
    action.mutate(input, {
      onSuccess: () => showToast(t(toastKey), "success"),
      onError: () => showToast(t("economy:myHousingListings.toast.error"), "error"),
      onSettled: () => setBusyRef(null),
    });
  };

  const handleDelete = () => {
    if (!deletingRef) return;
    const ref = deletingRef;
    deleteListing.mutate(ref, {
      onSuccess: () => {
        showToast(t("economy:myHousingListings.toast.deleted"), "success");
        setDeletingRef(null);
      },
      onError: () => {
        showToast(t("economy:myHousingListings.toast.error"), "error");
        setDeletingRef(null);
      },
    });
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.head}>
          <div className={styles.cat}>{t("economy:myHousingListings.eyebrow")}</div>
          <h1 className={styles.title}>{t("economy:myHousingListings.title")}</h1>
          <p className={styles.sub}>{t("economy:myHousingListings.sub")}</p>
        </div>

        {isLoading ? (
          <div className={styles.list}>
            {Array.from({ length: 3 }).map((_, skeletonIndex) => (
              <div key={skeletonIndex} className={styles.card} aria-hidden>
                <SkeletonLine width={90} height={20} />
                <SkeletonLine width="60%" height={22} style={{ marginTop: 10 }} />
                <SkeletonLine width="40%" height={14} style={{ marginTop: 8 }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <MyHousingListingsError onRetry={() => void refetch()} />
        ) : listings.length === 0 ? (
          <MyHousingListingsEmpty onListSpace={() => setListing(true)} />
        ) : (
          <div className={styles.list}>
            {listings.map((row) => (
              <MyHousingListingCard
                key={row.ref}
                listing={row}
                busy={busyRef === row.ref}
                onEdit={() => setEditing(row)}
                onMarkFilled={() =>
                  runAction(
                    row.ref,
                    { ref: row.ref, action: "markFilled" },
                    "economy:myHousingListings.toast.filled",
                  )
                }
                onMarkAvailable={() =>
                  runAction(
                    row.ref,
                    { ref: row.ref, action: "markAvailable" },
                    "economy:myHousingListings.toast.available",
                  )
                }
                onExtend={() =>
                  runAction(
                    row.ref,
                    { ref: row.ref, action: "extend" },
                    "economy:myHousingListings.toast.extended",
                  )
                }
                onDelete={() => setDeletingRef(row.ref)}
              />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditHousingListingModal
          listing={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {listing && <ListSpaceModal onClose={() => setListing(false)} />}

      <ConfirmDialog
        open={deletingRef !== null}
        onClose={() => setDeletingRef(null)}
        onConfirm={handleDelete}
        title={t("economy:myHousingListings.delete.confirmTitle")}
        description={t("economy:myHousingListings.delete.confirmBody")}
        tone="destructive"
        loading={deleteListing.isPending}
        confirmLabel={t("economy:myHousingListings.delete.confirmCta")}
      />
    </PageShell>
  );
}
