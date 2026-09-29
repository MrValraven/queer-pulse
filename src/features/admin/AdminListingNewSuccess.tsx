import { useNavigate } from "react-router-dom";
import { Button, SuccessPanel } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { businessPath, routes } from "../../app/routeMap";
import type { PendingListing } from "../marketing/listBusiness/listBusiness.data";

interface AdminListingNewSuccessProps {
  created: PendingListing;
  /** Resets the page to a fresh blank form for the next listing. */
  onAddAnother: () => void;
}

/** What the console tells the admin once the listing exists. */
export function AdminListingNewSuccess({
  created,
  onAddAnother,
}: AdminListingNewSuccessProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isLive = created.status === "live";
  const steps = [
    t(`admin:listingNew.success.step.${isLive ? "live" : "review"}`),
  ];
  return (
    <SuccessPanel
      title={t("admin:listingNew.success.title")}
      em={created.name}
      steps={steps}
      onClose={() => void navigate(routes.adminListings)}
      closeLabel={t("admin:listingNew.success.closeCta")}
      extraActions={
        <>
          {/* A listing sent to review has no public page yet, so the link
              only appears for one published straight to the directory. */}
          {isLive && (
            <Button variant="primary" size="lg" to={businessPath(created.slug)}>
              {t("admin:listingNew.success.viewLiveCta")}
            </Button>
          )}
          <Button variant="ghost-dark" size="lg" onClick={onAddAnother}>
            {t("admin:listingNew.success.addAnotherCta")}
          </Button>
        </>
      }
    >
      {t("admin:listingNew.success.body", { ref: created.ref })}
    </SuccessPanel>
  );
}
