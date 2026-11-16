import { FiStar } from "react-icons/fi";
import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeErrorToast } from "../../shared/api/errorMessage";
import {
  AdminChip,
  AdminEmptyState,
  AdminNotice,
  AdminPanel,
  AdminToggle,
  adminTableClasses,
} from "./ui";
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
            describeErrorToast(t("admin:errors.updatePartner"), error),
            "error",
          ),
      },
    );
  }

  if (forbidden) return null;

  return (
    <div className={styles.featuredSection}>
      <AdminPanel
        title={t("admin:approvedPartners.title")}
        padding={partners.length > 0 ? "flush" : "default"}
      >
        {isLoading ? (
          <div className={styles.skeletons}>
            {[0, 1].map((skeletonIndex) => (
              <SkeletonLine
                key={skeletonIndex}
                height={64}
                style={{ borderRadius: 14 }}
              />
            ))}
          </div>
        ) : isError ? (
          <AdminNotice tone="error">
            {t("admin:approvedPartners.loadError")}
          </AdminNotice>
        ) : partners.length === 0 ? (
          <AdminEmptyState
            size="inline"
            icon={FiStar}
            title={t("admin:approvedPartners.empty")}
          />
        ) : (
          <ul className={styles.rows}>
            {partners.map((partner, i) => (
              <FadeIn
                key={partner.id}
                as="li"
                delay={Math.min(i, 8) * 50}
                className={`${adminTableClasses.row} ${styles.row}`}
              >
                <div className={styles.rowMain}>
                  <div className={styles.rowTop}>
                    <span className={styles.rowName}>{partner.name}</span>
                    {partner.featured && (
                      <AdminChip tone="coral">
                        {t("admin:common.featured")}
                      </AdminChip>
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
              </FadeIn>
            ))}
          </ul>
        )}
      </AdminPanel>

      {editingPartner && (
        <AdminPartnerTestimonialModal
          partner={editingPartner}
          onClose={() => setEditingPartner(null)}
        />
      )}
    </div>
  );
}
