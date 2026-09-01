import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";
import { Button, LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { useAuth } from "../../app/providers/authContext";
import { routes } from "../../app/routeMap";
import { type DirectoryPlace } from "./directoryPlaces";
import { useListingContact } from "./api/useListingContact";
import type {
  ListingContactUnavailableReason,
  ListingEnquiryLimitReason,
} from "./api/listingEnquiries.api";
import { DirectoryEnquiryModal } from "./DirectoryEnquiryModal";
import styles from "./DirectoryMessageBusiness.module.css";

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: the page body is a read-only rehearsal, so no
   *  member-gated read runs and nothing here is actionable. */
  preview?: boolean;
  /** Present only when the viewer owns this listing. They have "Edit this
   *  listing" rather than an inbox to write to, and the backend would answer
   *  `own_listing` anyway, so the read is skipped outright. */
  ownerRef?: string;
}

/** One localized sentence per reason the backend can give. Never collapsed into
 *  a shrug: a control that vanishes with no explanation reads as a bug, and
 *  `unclaimed` in particular is a thing the reader can act on. */
const UNAVAILABLE_KEYS: Record<ListingContactUnavailableReason, string> = {
  unclaimed: "marketing:directory.detail.enquiry.unavailable.unclaimed",
  no_owner_account: "marketing:directory.detail.enquiry.unavailable.noAccount",
  own_listing: "marketing:directory.detail.enquiry.unavailable.ownListing",
  unavailable: "marketing:directory.detail.enquiry.unavailable.blocked",
};

/** One sentence per counted cap. Named separately from `UNAVAILABLE_KEYS`
 *  because a cap is not the same answer: the business IS reachable, this member
 *  has simply already written to them, and the copy has to say so without
 *  reading like the place has gone. */
const LIMIT_KEYS: Record<ListingEnquiryLimitReason, string> = {
  wrote_to_this_business_today:
    "marketing:directory.detail.enquiry.limit.thisBusiness",
  wrote_across_directory_today:
    "marketing:directory.detail.enquiry.limit.directory",
};

const MINUTE_MS = 60 * 1000;
const MINUTES_PER_HOUR = 60;

/**
 * How long until the cap lifts, in the reader's own language.
 *
 * The backend's window ROLLS, so `enquiryLimitClearsAt` is a real computed
 * moment and can be said out loud without promising anything. Rounded UP at
 * every step on purpose: telling somebody "in 3 hours" when it is three hours
 * and forty minutes sends them back to a button that refuses them again, and
 * over-stating by a few minutes costs nothing.
 *
 * `null` when the instant has already passed, in which case the page says the
 * cap is on without guessing at a time. The read is a cached snapshot and can
 * easily outlive the window it describes.
 */
function formatClearsIn(clearsAt: string, fmt: Formatters): string | null {
  const millisecondsLeft = new Date(clearsAt).getTime() - Date.now();
  if (!Number.isFinite(millisecondsLeft) || millisecondsLeft <= 0) return null;
  const minutesLeft = Math.ceil(millisecondsLeft / MINUTE_MS);
  if (minutesLeft < MINUTES_PER_HOUR) {
    return fmt.relativeTime(minutesLeft, "minute");
  }
  return fmt.relativeTime(Math.ceil(minutesLeft / MINUTES_PER_HOUR), "hour");
}

/**
 * "Message this business" — the one way to reach a listing that does not cost
 * the member their phone number or their email address.
 *
 * It sits with the phone, website and email rows because it belongs beside
 * them, and it is the route that still exists when every one of those is empty.
 * Somebody who is not out should not have to hand over a contact detail in
 * order to ask whether a place will be weird with them, and until now that was
 * the only option this page offered.
 *
 * What is deliberately said BEFORE the composer opens, all of it read from
 * `GET /directory/:slug/contact`:
 *
 *  - Whether anybody is on the other end at all, and WHY NOT when nobody is.
 *  - That the message arrives as a direct message from the member's account.
 *  - That a reply may need an accepted connection (`replyRequiresConnection`),
 *    since the first enquiry lands but the thread then closes to both sides.
 *  - The conversation they already have with this owner, when they have one,
 *    so a follow-up goes to the thread rather than starting a second one.
 *
 *  - Whether a counted cap would refuse them right now, and when it lifts.
 *
 * That last one is why the composer never opens onto a message that cannot be
 * sent. The alternative, which this component used to be, was to let a member
 * compose, type, press send and only then learn they were never allowed to.
 *
 * BOTH CAP PATHS STAY. The contact read is a cached snapshot and the caps are
 * enforced at send time, so a member can pass this check and still be refused:
 * the window can roll shut while the modal is open, or the send can trip the
 * route's own throttle, which this read cannot see at all. So the 429 is still
 * handled, and the reason it carries is still remembered for the rest of the
 * visit. The read closes the door early; it is not trusted to be the only lock.
 */
export function DirectoryMessageBusiness({
  place,
  preview = false,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { user } = useAuth();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  // The backend's own sentence from a 429 in this visit. Outranks the read's
  // hint below, because it is the newer and more specific answer.
  const [capReason, setCapReason] = useState<string | null>(null);

  const isEnabled = !preview && !ownerRef && Boolean(user);
  const { contact, isLoading, isError, refetch } = useListingContact({
    slug: place.slug,
    isEnabled,
    isDemoOwnerOnPlatform: place.owner.inQueerPulse,
  });

  if (preview || ownerRef) return null;

  // Member-gated route, same as asking a public question or leaving a review: a
  // logged-out visitor gets the sign-in path rather than a button that 401s.
  if (!user) {
    return (
      <div className={styles.block}>
        <p className={styles.signIn}>
          {t("marketing:directory.detail.enquiry.signInPrompt")}{" "}
          <Link to={routes.signIn}>
            {t("marketing:directory.detail.enquiry.signInCta")}
          </Link>
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.block}>
        <LoadErrorState
          compact
          onRetry={refetch}
          title={t("marketing:directory.detail.enquiry.loadErrorTitle")}
          description={t("marketing:directory.detail.enquiry.loadErrorBody")}
        />
      </div>
    );
  }

  // Nothing to show yet. An additive contact route that appears a moment later
  // is better than a placeholder that shifts the card under a reader's thumb.
  if (isLoading || !contact) return null;

  if (!contact.canMessageOwner) {
    return (
      <div className={styles.block}>
        <p className={styles.unavailable}>
          {t(
            UNAVAILABLE_KEYS[contact.unavailableReason ?? "unavailable"],
            // The only reason that names the business is the claim nudge.
            { name: place.name },
          )}
        </p>
      </div>
    );
  }

  const existingThreadHref = contact.existingConversationId
    ? `${routes.messages}?c=${encodeURIComponent(contact.existingConversationId)}`
    : null;

  // What the contact read already knows, before anybody types. The reason names
  // the cap; the timing clause is appended only when there is an honest time to
  // give, so the sentence degrades to "you have already written to them today"
  // rather than to a made-up deadline.
  const limitReason = contact.hasReachedEnquiryLimit
    ? contact.enquiryLimitReason
    : null;
  const clearsIn = contact.enquiryLimitClearsAt
    ? formatClearsIn(contact.enquiryLimitClearsAt, fmt)
    : null;
  const limitNotice = limitReason
    ? [
        t(LIMIT_KEYS[limitReason], { name: place.name }),
        clearsIn
          ? t("marketing:directory.detail.enquiry.limit.clearsIn", {
              when: clearsIn,
            })
          : null,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  const capNotice = capReason ?? limitNotice;

  return (
    <div className={styles.block}>
      <Button
        variant="ghost"
        className={styles.messageBtn}
        onClick={() => setIsComposerOpen(true)}
        disabled={capNotice !== null}
      >
        <FiMessageCircle aria-hidden />
        {t("marketing:directory.detail.enquiry.cta")}
      </Button>
      {capNotice ? (
        <p className={styles.capped}>{capNotice}</p>
      ) : (
        <p className={styles.note}>
          {t("marketing:directory.detail.enquiry.deliveryNote")}
          {contact.replyRequiresConnection
            ? ` ${t("marketing:directory.detail.enquiry.replyNote")}`
            : ""}
        </p>
      )}
      {existingThreadHref && (
        <Link className={styles.threadLink} to={existingThreadHref}>
          {t("marketing:directory.detail.enquiry.existingThreadCta")}
        </Link>
      )}
      {isComposerOpen && (
        <DirectoryEnquiryModal
          slug={place.slug}
          placeName={place.name}
          replyRequiresConnection={contact.replyRequiresConnection}
          onClose={() => setIsComposerOpen(false)}
          onCapReached={setCapReason}
        />
      )}
    </div>
  );
}
