import { useState } from "react";
import { FiBriefcase } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  EmptyState,
  FormField,
  LoadErrorState,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { PageMeta } from "../../shared/seo";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyPartners } from "./api/useMyPartners";
import { PartnerProfileEditForm } from "./PartnerProfileEditForm";
import styles from "./PartnerProfileEditPage.module.css";

/**
 * The self-service editor an approved partner never had (PRD-263).
 *
 * Before this, nobody outside engineering could change a partner's public
 * page: the staff console reached the featured flag and a testimonial, and
 * the organisation itself reached nothing at all. A partner whose phone
 * number, address, description or tagline changed kept the wrong one on a
 * `@Public()` support page until somebody edited the row by hand.
 *
 * OWNERSHIP comes from `partners.owner_user_id`, stamped at approval from the
 * member who applied and movable by staff afterwards (see the entity). The
 * server scopes `GET /my-partners` by the session's user id alone, so this
 * page never asks for a partner it has not been handed.
 *
 * Modelled on the listing owner's editor (`listBusiness/editor`): the member's
 * own surface, under `/account/*` so it inherits the auth gate rather than
 * inventing one, with an explicit read-only block naming what only staff can
 * change and why — a partner who cannot see the boundary assumes the page is
 * broken rather than that the field is somebody else's.
 */
export function PartnerProfileEditPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useMyPartners();
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );

  const partners = data ?? [];
  // One organisation is the ordinary case; a member who runs two picks. The
  // fallback is the first row rather than "none", so the editor is never
  // blank on arrival.
  const selectedPartner =
    partners.find((partner) => partner.id === selectedPartnerId) ??
    partners[0] ??
    null;

  return (
    <AppShell>
      <PageMeta
        title={t("marketing:partnerProfileEdit.meta.title")}
        description={t("marketing:partnerProfileEdit.meta.description")}
      />
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>
            {t("marketing:partnerProfileEdit.hero.eyebrow")}
          </div>
          <h1 className={styles.title}>
            <Translation
              i18nKey="marketing:partnerProfileEdit.hero.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>
            {t("marketing:partnerProfileEdit.hero.sub")}
          </p>
        </header>

        {isLoading ? (
          <div className={styles.loading}>
            <SkeletonLine width="40%" height={20} />
            <SkeletonLine width="90%" height={44} />
            <SkeletonLine width="90%" height={44} />
            <SkeletonLine width="70%" height={120} />
          </div>
        ) : isError ? (
          // "We could not reach the server" is the opposite answer to "you
          // maintain no partner profile", and an organisation shown the second
          // when the first is true would conclude its listing was taken down.
          <LoadErrorState onRetry={() => void refetch()} />
        ) : !selectedPartner ? (
          <EmptyState
            icon={<FiBriefcase />}
            title={t("marketing:partnerProfileEdit.empty.title")}
            description={t("marketing:partnerProfileEdit.empty.body")}
            action={{
              label: t("marketing:partnerProfileEdit.empty.applyCta"),
              to: routes.partnerApply,
            }}
          />
        ) : (
          <>
            {partners.length > 1 && (
              <FormField
                label={t("marketing:partnerProfileEdit.picker.label")}
                className={styles.picker}
              >
                <Select
                  options={partners.map((partner) => ({
                    value: partner.id,
                    label: partner.name,
                  }))}
                  value={selectedPartner.id}
                  onChange={(value) => setSelectedPartnerId(value)}
                />
              </FormField>
            )}
            <PartnerProfileEditForm
              key={selectedPartner.id}
              partner={selectedPartner}
            />
          </>
        )}
      </div>
    </AppShell>
  );
}
