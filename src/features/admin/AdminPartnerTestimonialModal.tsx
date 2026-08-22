import { useState, type FormEvent } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminModal } from "./ui";
import { ApiError } from "../../shared/api/client";
import { useUpdatePartnerAdmin } from "./api/useUpdatePartnerAdmin";
import type { PartnerApplicationDTO } from "../marketing/api/partners.api";
import styles from "./AdminPartnerApplicationsPage.module.css";

const FORM_ID = "admin-partner-testimonial-form";

/**
 * Quote/author/role editor for one approved partner's homepage testimonial.
 * Seeds its draft from the partner once and owns all field state locally,
 * same shape as AdminOrgTierForm. A quote requires an author (the backend
 * 409s a quote written without one), so Save is disabled until that pairing
 * holds; empty fields are sent as `null` rather than empty strings.
 */
export function AdminPartnerTestimonialModal({
  partner,
  onClose,
}: {
  partner: PartnerApplicationDTO;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updatePartner = useUpdatePartnerAdmin();
  const [quote, setQuote] = useState(partner.testimonialQuote ?? "");
  const [author, setAuthor] = useState(partner.testimonialAuthor ?? "");
  const [role, setRole] = useState(partner.testimonialRole ?? "");

  const quoteWithoutAuthor =
    quote.trim().length > 0 && author.trim().length === 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (quoteWithoutAuthor) return;
    updatePartner.mutate(
      {
        id: partner.id,
        dto: {
          testimonialQuote: quote.trim() || null,
          testimonialAuthor: author.trim() || null,
          testimonialRole: role.trim() || null,
        },
      },
      {
        onSuccess: () => {
          showToast(
            t("admin:partnerTestimonial.updatedToast", { name: partner.name }),
            "success",
          );
          onClose();
        },
        onError: (error) =>
          showToast(
            error instanceof ApiError && error.status === 409
              ? t("admin:partnerTestimonial.quoteNeedsAuthor")
              : describeError(
                  t("admin:errors.saveTestimonial"),
                  error,
                  t("shared:apiError.tryAgainTail"),
                ),
            "error",
          ),
      },
    );
  }

  return (
    <AdminModal
      eyebrow={t("admin:partnerTestimonial.eyebrow")}
      title={partner.name}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={FORM_ID}
            disabled={updatePartner.isPending || quoteWithoutAuthor}
          >
            {t("admin:common.saveChanges")}
          </Button>
        </>
      }
    >
      <form
        id={FORM_ID}
        className={styles.fieldGroup}
        onSubmit={handleSubmit}
      >
        <label className={styles.fieldLabel} htmlFor="testimonial-quote">
          {t("admin:partnerTestimonial.quote")}
        </label>
        <textarea
          id="testimonial-quote"
          className={styles.textarea}
          rows={4}
          value={quote}
          onChange={(event) => setQuote(event.target.value)}
        />

        <label className={styles.fieldLabel} htmlFor="testimonial-author">
          {t("admin:partnerTestimonial.author")}
        </label>
        <input
          id="testimonial-author"
          className={styles.textInput}
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        />

        <label className={styles.fieldLabel} htmlFor="testimonial-role">
          {t("admin:partnerTestimonial.role")}
        </label>
        <input
          id="testimonial-role"
          className={styles.textInput}
          value={role}
          onChange={(event) => setRole(event.target.value)}
        />

        {quoteWithoutAuthor && (
          <p className={styles.fieldHint}>
            {t("admin:partnerTestimonial.authorRequiredHint")}
          </p>
        )}
      </form>
    </AdminModal>
  );
}
