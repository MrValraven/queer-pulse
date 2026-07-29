import { useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
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
            describeError("Couldn't update that partner", error),
            "error",
          ),
      },
    );
  }

  if (forbidden) return null;

  return (
    <div className={styles.featuredSection}>
      <h2 className={styles.sectionTitle}>
        Featured partners &amp; testimonials
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
            The partner list couldn't load right now — please try again.
          </p>
        </div>
      ) : partners.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No approved partners yet.</p>
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
                      <span className={styles.featuredTag}>Featured</span>
                    )}
                  </div>
                  <div className={styles.rowMeta}>
                    {partner.testimonialQuote
                      ? `"${partner.testimonialQuote}" — ${
                          partner.testimonialAuthor ?? "Unattributed"
                        }`
                      : "No testimonial yet"}
                  </div>
                </div>
                <AdminToggle
                  checked={partner.featured}
                  onChange={() => toggleFeatured(partner)}
                  label={`Featured — ${partner.name}`}
                />
                <div className={styles.rowActions}>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setEditingPartner(partner)}
                  >
                    Edit testimonial
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
