import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminToggle } from "./ui";
import { ApiError } from "../../shared/api/client";
import { useAdminPartners } from "./api/useAdminPartners";
import { useUpdatePartnerAdmin } from "./api/useUpdatePartnerAdmin";
import { AdminPartnerTestimonialModal } from "./AdminPartnerTestimonialModal";
import type { PartnerApplicationDTO } from "../marketing/api/partners.api";
import styles from "./AdminPartnerApplicationsPage.module.css";

/**
 * Featured-flag + testimonial editor for every APPROVED partner, rendered
 * below the pending-application queue on the same page (mirrors
 * AdminHousingJoinRequests's section-under-the-list shape). Sourced from
 * useAdminPartners (GET /admin/partners — admin-only, 403s for a non-admin);
 * the demo-mode list is deliberately empty (see useAdminPartners), so this
 * section's honest empty state is what most reviewers will actually see. A
 * 403 here renders nothing — the page above already explains the panel is
 * admin-only.
 */
export function AdminApprovedPartners() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError, error } = useAdminPartners();
  const updatePartner = useUpdatePartnerAdmin();
  const [editingPartner, setEditingPartner] =
    useState<PartnerApplicationDTO | null>(null);

  const forbidden =
    isError && error instanceof ApiError && error.status === 403;
  const partners = data ?? [];

  function toggleFeatured(partner: PartnerApplicationDTO) {
    updatePartner.mutate(
      { id: partner.id, dto: { featured: !partner.featured } },
      {
        onError: (error) =>
          showToast(
            describeError(
              t("admin:errors.updatePartner"),
              error,
              t("shared:apiError.tryAgainTail"),
            ),
            "error",
          ),
      },
    );
  }

  if (forbidden) return null;

  return (
    <div className={styles.featuredSection}>
      <h2 className={styles.sectionTitle}>
        {t("admin:approvedPartners.title")}
      </h2>

      {isLoading ? (
        <div className={styles.rows}>
          {[0, 1].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={64}
              style={{ borderRadius: 14 }}
            />
          ))}
        </div>
      ) : isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {t("admin:approvedPartners.loadError")}
          </p>
        </div>
      ) : partners.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            {t("admin:approvedPartners.empty")}
          </p>
        </div>
      ) : (
        <div className={styles.rows}>
          {partners.map((partner, i) => (
            <FadeIn key={partner.id} delay={Math.min(i, 8) * 50}>
              <div className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTop}>
                    <span className={styles.rowName}>{partner.name}</span>
                    {partner.featured && (
                      <span className={styles.featuredTag}>
                        {t("admin:common.featured")}
                      </span>
                    )}
                  </div>
                  <div className={styles.rowMeta}>
                    {partner.testimonialQuote
                      ? `"${partner.testimonialQuote}" (${
                          partner.testimonialAuthor ??
                          t("admin:approvedPartners.unattributed")
                        })`
                      : t("admin:approvedPartners.noTestimonial")}
                  </div>
                </div>
                <AdminToggle
                  checked={partner.featured}
                  onChange={() => toggleFeatured(partner)}
                  label={t("admin:common.featuredToggleLabel", {
                    name: partner.name,
                  })}
                />
                <div className={styles.rowActions}>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setEditingPartner(partner)}
                  >
                    {t("admin:approvedPartners.editCta")}
                  </Button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {editingPartner && (
        <AdminPartnerTestimonialModal
          partner={editingPartner}
          onClose={() => setEditingPartner(null)}
        />
      )}
    </div>
  );
}
