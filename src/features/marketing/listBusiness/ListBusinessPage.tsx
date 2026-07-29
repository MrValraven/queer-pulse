import { Link, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { EmptyState, SkeletonCard } from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { routes } from "../../../app/routeMap";
import { ListingWizard } from "./ListingWizard";
import { useOwnedListing } from "./api/useListings";
import { dtoToDraft } from "./dtoToDraft";
import styles from "./ListBusinessPage.module.css";

export function ListBusinessPage() {
  const { ref } = useParams();
  const { t } = useTranslation();
  const editing = Boolean(ref);

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={`${styles.heroInner} wrap`}>
          <Link to={routes.directory} className={styles.back}>
            <FiArrowLeft size={14} /> {t("marketing:listBusiness.hero.backCta")}
          </Link>
          <div className={styles.eyebrow}>
            {t("marketing:listBusiness.hero.eyebrow")}
          </div>
          <h1 className={styles.h1}>
            {editing ? (
              t("marketing:listBusiness.edit.title")
            ) : (
              <Translation
                i18nKey="marketing:listBusiness.hero.title"
                components={{ em: <em /> }}
              />
            )}
          </h1>
          {!editing && (
            <p className={styles.lead}>
              <Translation
                i18nKey="marketing:listBusiness.hero.lead"
                components={{ b: <b /> }}
              />
            </p>
          )}
        </div>
      </header>

      {ref ? <EditListingGate editRef={ref} /> : <ListingWizard mode="create" />}
    </PageShell>
  );
}

/** Loads the owner's listing before mounting the wizard in edit mode — a
 *  clean loading/blocked state instead of a blank or default-create wizard. */
function EditListingGate({ editRef }: { editRef: string }) {
  const { t } = useTranslation();
  const { listing, isLoading, error } = useOwnedListing(editRef);

  if (isLoading) {
    return (
      <div className="wrap">
        <div className={styles.page}>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="wrap">
        <div className={styles.page}>
          <EmptyState
            title={t("marketing:listBusiness.edit.notAllowed")}
            action={{
              label: t("marketing:listBusiness.hero.backCta"),
              to: routes.directory,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <ListingWizard
      mode="edit"
      editRef={editRef}
      initialDraft={dtoToDraft(listing)}
      editSlug={listing.slug}
      editStatus={listing.status}
    />
  );
}
