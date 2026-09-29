import { useState } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FirstContactComposer } from "../messages/FirstContactComposer";
import { ModalShell } from "./ModalKit";
import { type Poster } from "./housingListings";
import { HousingEnquirySent } from "./HousingEnquirySent";
import { useHousingListingContact } from "./api/useHousingListingContact";
import { useHousingEnquirySend } from "./useHousingEnquirySend";
import styles from "./housingModals.module.css";

/** The backend's own minimum on an enquiry body (`CreateHousingEnquiryDto`). */
const MIN_HOUSING_ENQUIRY_LENGTH = 20;

/** posterFrom() (housingListing.adapters.ts) uses this exact placeholder when
 * a live listing has no lister on file. It names nobody real. */
const GENERIC_LISTER_NAME = "A member";

/** First name to greet, or null when there's no real name to greet (empty or
 * the anonymous-lister placeholder), so callers fall back to a generic line. */
function firstNameOf(toName: string): string | null {
  const trimmed = toName.trim();
  if (!trimmed || trimmed === GENERIC_LISTER_NAME) return null;
  return trimmed.split(/\s+/)[0] ?? null;
}

interface HousingEnquiryModalProps {
  /** Name, initials and tint feed the composer's identity row.
   *  `responseTime` is only set when a MEASURED reply time is on file (demo
   *  fixtures author one; the live listing DTO carries no response metric),
   *  and when absent the confirmation drops the "usually replies" clause. */
  lister: Pick<Poster, "fullName" | "initials" | "tint" | "responseTime">;
  listingTitle: string;
  listingRef: string | null;
  onClose: () => void;
}

/**
 * "Message the lister": a member writing about a home, delivered to the
 * lister's inbox (`POST /housing-listings/:ref/enquiries`).
 *
 * The composer is the shared first-contact one (`FirstContactComposer`,
 * door="enquiry"), so the highest-stakes enquiry on the platform gets the same
 * contact-safety notice (phone numbers, bank details, off-platform payment)
 * every other first message does, plus the same 2000-character cap the
 * backend enforces. What stays here is the door's own: the listing summary,
 * a starter draft, the backend's 20-character minimum and the deposit
 * warning. The send, its two gates (affirming pledge, phone step-up) and its
 * refusal copy live in `useHousingEnquirySend`.
 */
export function HousingEnquiryModal({
  lister,
  listingTitle,
  listingRef,
  onClose,
}: HousingEnquiryModalProps) {
  const { t } = useTranslation();
  const toName = lister.fullName;
  const firstName = firstNameOf(toName);
  const [text, setText] = useState(() =>
    firstName
      ? t("economy:housingModal.message.draftNamed", {
          name: firstName,
          listingTitle,
        })
      : t("economy:housingModal.message.draftGeneric", { listingTitle }),
  );
  const enquiry = useHousingEnquirySend(listingRef, firstName ?? toName);
  // PRD-339, refined PRD-340: read before the member types anything. The
  // lister can reply to this first message in one tap (no connection needed),
  // so the rule is read fresh and said up front by the shared composer.
  const { followUpAwaitsReply } = useHousingListingContact(listingRef);

  const handleSend = () => {
    const body = text.trim();
    if (body.length < MIN_HOUSING_ENQUIRY_LENGTH) return;
    enquiry.send(body);
  };

  if (enquiry.gate) return enquiry.gate;

  return (
    <ModalShell
      onClose={onClose}
      success={enquiry.isSent}
      ariaLabel={t("economy:housingModal.message.ariaLabel")}
    >
      {enquiry.isSent ? (
        <HousingEnquirySent
          toName={toName}
          responseTime={lister.responseTime}
          conversationId={enquiry.sentConversationId}
          onClose={onClose}
        />
      ) : (
        <FirstContactComposer
          door="enquiry"
          target={{
            name: toName,
            shortName: firstName ?? toName,
            initials: lister.initials,
            tint: lister.tint,
          }}
          heading={
            <p className={styles.enquiryContext}>
              <Translation
                i18nKey="economy:housingModal.message.body"
                values={{ listingTitle }}
                components={{ strong: <strong /> }}
              />
            </p>
          }
          followUpAwaitsReply={followUpAwaitsReply}
          minLength={MIN_HOUSING_ENQUIRY_LENGTH}
          footnote={
            <div className={styles.note}>
              {t("economy:housingModal.message.note")}
            </div>
          }
          message={text}
          onMessageChange={setText}
          isSending={enquiry.isPending}
          error={enquiry.errorMessage}
          onSubmit={handleSend}
          onBack={onClose}
          backLabel={t("economy:housingModal.cancel")}
        />
      )}
    </ModalShell>
  );
}
