import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiError } from "../../shared/api/client";
import { Button, Sending } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import type { BarterCategoryKey } from "./api/barter.api";
import type { BarterView } from "./api/barter.adapters";
import {
  useBarterListing,
  useMyBarterListings,
  useUpdateBarterListing,
} from "./api/useBarter";
import { BarterListingFields } from "./BarterListingFields";
import {
  parseBarterTags,
  type BarterListingFormValues,
} from "./barterListingForm";
import {
  EditBarterFrame,
  EditBarterGone,
  EditBarterLoadError,
  EditBarterNotYours,
  EditBarterPendingNotice,
  EditBarterSkeleton,
} from "./EditBarterSections";
import styles from "./EditBarterPage.module.css";

/** The stored listing as the form holds it. Tags come back as an array and are
 *  edited as one comma-separated line, which is the only shape that changes. */
function toFormValues(listing: BarterView): BarterListingFormValues {
  return {
    category: listing.category as BarterCategoryKey,
    mode: listing.mode,
    offer: listing.offer,
    want: listing.want,
    offerDetail: listing.offerDetail,
    wantDetail: listing.wantDetail,
    tags: listing.tags.join(", "),
  };
}

/** Turns the API's refusal into the sentence that explains it. Every branch is
 *  a real server answer. */
function refusalMessage(error: unknown, t: TFunction): string {
  if (!(error instanceof ApiError)) {
    return t("economy:barterEdit.save.errorFailed");
  }
  if (error.status === 400) return t("economy:barterEdit.save.errorInvalid");
  if (error.status === 403) return t("economy:barterEdit.save.errorNotYours");
  if (error.status === 404) return t("economy:barterEdit.save.errorGone");
  return t("economy:barterEdit.save.errorFailed");
}

/**
 * PRD-42: correct a swap you posted. Barter was the one vertical with no edit
 * path anywhere. Jobs, volunteering and housing listings all have one, so a
 * typo in a headline was permanent and the only way out was closing the post
 * and writing it again, which threw away every proposal already made.
 *
 * Editing is allowed while proposals are still pending, because refusing would
 * strand a poster behind their own typo for as long as somebody left an offer
 * unanswered. What the server does instead is stamp the listing when a
 * MATERIAL field moves under a pending proposal, and the people who proposed
 * see "this listing changed after you proposed" on their own half of the
 * board. `EditBarterPendingNotice` is where the poster learns that up front.
 */
export function EditBarterPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const listingQuery = useBarterListing(id);
  const updateListing = useUpdateBarterListing(id);
  // Supplementary only: it feeds the "people are waiting on this" notice. The
  // page is never gated on it, so a failure here costs the notice and nothing
  // else.
  const myListingsQuery = useMyBarterListings();
  const pendingProposalCount =
    myListingsQuery.data?.find((row) => row.id === id)?.pendingProposalCount ??
    0;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const listing = listingQuery.data ?? null;
  const loadedId = listing?.id ?? null;

  // The form's state is the DRAFT together with the listing it belongs to.
  // Deriving `values` from that pair rather than seeding it inside an effect
  // means navigating between two edit pages re-seeds the form on the render it
  // happens, with no cascading setState and no stale swap's text left behind.
  const [draft, setDraft] = useState<{
    listingId: string;
    values: BarterListingFormValues;
  } | null>(null);
  const values =
    draft && draft.listingId === loadedId
      ? draft.values
      : listing
        ? toFormValues(listing)
        : null;
  const setValues = (next: BarterListingFormValues) => {
    if (!loadedId) return;
    setDraft({ listingId: loadedId, values: next });
  };

  if (listingQuery.isLoading) {
    return (
      <EditBarterFrame>
        <EditBarterSkeleton />
      </EditBarterFrame>
    );
  }

  if (listingQuery.isError) {
    return (
      <EditBarterFrame>
        <EditBarterLoadError onRetry={() => void listingQuery.refetch()} />
      </EditBarterFrame>
    );
  }

  if (!listing) {
    return (
      <EditBarterFrame>
        <EditBarterGone />
      </EditBarterFrame>
    );
  }

  // `isOwner` is the server's own answer, so a reader who is not the poster is
  // told so here rather than filling in a form the PATCH would refuse.
  if (listing.isOwner === false) {
    return (
      <EditBarterFrame>
        <EditBarterNotYours />
      </EditBarterFrame>
    );
  }

  if (!values) {
    return (
      <EditBarterFrame>
        <EditBarterSkeleton />
      </EditBarterFrame>
    );
  }

  const currentValues = values;
  const trimmedOffer = currentValues.offer.trim();
  const trimmedWant = currentValues.want.trim();
  // The same rule the server enforces: a post has to carry the side its mode
  // advertises. Asking for it here means the form only offers what will save.
  const isOfferMissing = currentValues.mode !== "seeking" && !trimmedOffer;
  const isWantMissing = currentValues.mode !== "offering" && !trimmedWant;
  const canSave =
    Boolean(currentValues.category) &&
    !isOfferMissing &&
    !isWantMissing &&
    !updateListing.isPending;

  const save = () => {
    if (!canSave || !currentValues.category) return;
    setErrorMessage(null);
    updateListing.mutate(
      {
        category: currentValues.category,
        mode: currentValues.mode,
        offer: trimmedOffer,
        want: trimmedWant,
        offerDetail: currentValues.offerDetail.trim(),
        wantDetail: currentValues.wantDetail.trim(),
        tags: parseBarterTags(currentValues.tags),
      },
      {
        // Confirmation comes from the resolved mutation, never from the click.
        onSuccess: () => {
          showToast(t("economy:barterEdit.save.done"), "success");
          void navigate(routes.myBarter);
        },
        onError: (error) => setErrorMessage(refusalMessage(error, t)),
      },
    );
  };

  return (
    <EditBarterFrame>
      <header className={styles.head}>
        <div className={styles.eyebrow}>{t("economy:barterEdit.eyebrow")}</div>
        <h1 className={styles.title}>
          <Translation
            i18nKey="economy:barterEdit.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.sub}>{t("economy:barterEdit.sub")}</p>
      </header>

      <EditBarterPendingNotice count={pendingProposalCount} />

      <form
        className={styles.card}
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}

        <BarterListingFields
          values={currentValues}
          onChange={setValues}
          disabled={updateListing.isPending}
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => void navigate(routes.myBarter)}
            disabled={updateListing.isPending}
          >
            {t("economy:barterEdit.cancel")}
          </Button>
          <Button type="submit" disabled={!canSave}>
            {updateListing.isPending ? (
              <Sending label={t("economy:barterEdit.saving")} />
            ) : (
              t("economy:barterEdit.saveCta")
            )}
          </Button>
        </div>
      </form>
    </EditBarterFrame>
  );
}
