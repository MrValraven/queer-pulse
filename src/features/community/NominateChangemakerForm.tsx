import { useRef, useState, type FormEvent } from "react";
import { Button, FormField } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateChangemakerNomination } from "./api/useCreateChangemakerNomination";
import { NominateChangemakerMemberPicker } from "./NominateChangemakerMemberPicker";
import type { StrangerMemberResult } from "../messages/api/useStrangerMemberSearch";
import styles from "./ChangemakersPage.module.css";

/** Mirrors the `@MaxLength` set on the server's
 *  `CreateChangemakerNominationDto`, so a nomination can never be typed past a
 *  limit that would come back as a 400 the member can't see the cause of. */
const NAME_MAX = 200;
const REASON_MAX = 500;
const CONTACT_MAX = 200;

interface FieldErrors {
  nominee?: string;
  reason?: string;
}

/**
 * The nomination card itself — labelled fields on a paper surface, submitted
 * against `POST /changemakers/nominations`.
 *
 * Validation runs on submit rather than by disabling the button: a dead button
 * with no message doesn't tell you which field it is waiting on. An empty
 * field fails inline, `role="alert"` announces it, and focus lands on the
 * first one that failed.
 *
 * COM-18 added the two middle fields, both optional and both outside that
 * validation gate. They exist for whoever triages the nomination: a name and a
 * sentence say who to look for without saying how to find them, so a reviewer
 * had nothing to check the pitch against. A picked member links a real
 * profile; the contact line carries everyone who isn't here yet.
 */
export function NominateChangemakerForm() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [nominee, setNominee] = useState("");
  const [reason, setReason] = useState("");
  const [pickedMember, setPickedMember] = useState<StrangerMemberResult | null>(
    null,
  );
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const nomineeRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const nominationMutation = useCreateChangemakerNomination();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nomineeName = nominee.trim();
    const nominationReason = reason.trim();
    const nextErrors: FieldErrors = {};
    if (!nomineeName) {
      nextErrors.nominee = t("community:changemakers.nominate.nameError");
    }
    if (!nominationReason) {
      nextErrors.reason = t("community:changemakers.nominate.reasonError");
    }
    setErrors(nextErrors);
    if (nextErrors.nominee) {
      nomineeRef.current?.focus();
      return;
    }
    if (nextErrors.reason) {
      reasonRef.current?.focus();
      return;
    }
    const nomineeContact = contact.trim();
    nominationMutation.mutate(
      {
        nomineeName,
        reason: nominationReason,
        // Omitted rather than sent empty: the server treats an absent field as
        // "the nominator didn't say", and an empty string would have to be
        // normalized back to that anyway.
        ...(pickedMember ? { nomineeSlug: pickedMember.slug } : {}),
        ...(nomineeContact ? { nomineeContact } : {}),
      },
      {
        onSuccess: () => {
          showToast(
            t("community:changemakers.nominate.successToast", {
              name: nomineeName,
            }),
            "success",
          );
          setNominee("");
          setReason("");
          setPickedMember(null);
          setContact("");
          nomineeRef.current?.focus();
        },
        onError: () =>
          showToast(t("community:changemakers.nominate.errorToast"), "error"),
      },
    );
  }

  return (
    <form className={styles.nomCard} onSubmit={handleSubmit} noValidate>
      <h3 className={styles.nomCardTitle}>
        {t("community:changemakers.nominate.formTitle")}
      </h3>
      <FormField
        label={t("community:changemakers.nominate.nameLabel")}
        required
        error={errors.nominee}
      >
        <input
          ref={nomineeRef}
          type="text"
          autoComplete="off"
          maxLength={NAME_MAX}
          placeholder={t("community:changemakers.nominate.namePlaceholder")}
          value={nominee}
          onChange={(e) => {
            setNominee(e.target.value);
            if (errors.nominee) setErrors({ ...errors, nominee: undefined });
          }}
        />
      </FormField>
      <NominateChangemakerMemberPicker
        picked={pickedMember}
        onPick={setPickedMember}
      />
      <FormField
        label={t("community:changemakers.nominate.contactLabel")}
        helper={t("community:changemakers.nominate.contactHelper")}
      >
        <input
          type="text"
          autoComplete="off"
          maxLength={CONTACT_MAX}
          placeholder={t("community:changemakers.nominate.contactPlaceholder")}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
      </FormField>
      <FormField
        label={t("community:changemakers.nominate.reasonLabel")}
        required
        helper={t("community:changemakers.nominate.reasonHelper")}
        error={errors.reason}
        labelAside={t("community:changemakers.nominate.reasonCount", {
          used: reason.length,
          max: REASON_MAX,
        })}
      >
        <textarea
          ref={reasonRef}
          rows={4}
          maxLength={REASON_MAX}
          placeholder={t("community:changemakers.nominate.reasonPlaceholder")}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (errors.reason) setErrors({ ...errors, reason: undefined });
          }}
        />
      </FormField>
      <Button
        type="submit"
        size="lg"
        className={styles.nomSubmit}
        disabled={nominationMutation.isPending}
      >
        {nominationMutation.isPending
          ? t("community:changemakers.nominate.submitPending")
          : t("community:changemakers.nominate.submitCta")}
      </Button>
      <p className={styles.nomNote}>
        {t("community:changemakers.nominate.privacyNote")}
      </p>
    </form>
  );
}
