import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import type { TherapistStatus } from "../../api/subprofiles.api";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { PersonaAction, PersonaViewMode } from "../../personaSkinRender";
import { buildTherapistView } from "./therapistView";
import { TherapistOwnerBar } from "./TherapistOwnerBar";
import { TherapistHero } from "./TherapistHero";
import { TherapistMobileBar } from "./TherapistMobileBar";
import { TherapistApproach } from "./TherapistApproach";
import { TherapistSpecialties } from "./TherapistSpecialties";
import { TherapistCredentials } from "./TherapistCredentials";
import { TherapistFirstSession } from "./TherapistFirstSession";
import { TherapistPractical } from "./TherapistPractical";
import { TherapistGallery } from "./TherapistGallery";
import { TherapistVouches } from "./TherapistVouches";
import { TherapistFaq } from "./TherapistFaq";
import { TherapistReferrals } from "./TherapistReferrals";
import { TherapistSidebar } from "./TherapistSidebar";
import { TherapistEditProvider } from "./TherapistEditContext";
import styles from "./TherapistBody.module.css";

/** The hero's action row: the skip link's target where the hero shows the
 *  message button. */
const CONTACT_ID = "therapist-hero-contact";
/** The phone action bar: the skip link's target on phones, where the hero
 *  hides its message button and the bar carries it. */
const MOBILE_CONTACT_ID = "therapist-mobile-contact";

/** A capacity the owner just saved from the owner bar, and the status the
 *  server held when they saved it. */
interface CapacityOverride {
  status: TherapistStatus;
  savedOver: TherapistStatus;
}

interface TherapistBodyProps {
  data: PublicSubprofileView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
  /** Opens the page's gallery lightbox on a photo. The editor preview may
   *  leave it out; its tiles are inert there anyway. */
  onOpenGalleryPhoto?: (item: SubprofileItemView) => void;
}

/**
 * The therapist layout inside the persona page's `.wrap`: skip link, back
 * link, owner bar (owner only), hero, then the reading column and the
 * sticky sidebar, then the phone action bar (public only). The view model
 * is built once here and handed to every section.
 */
export function TherapistBody({
  data,
  mode,
  onAction,
  onOpenGalleryPhoto,
}: TherapistBodyProps) {
  const { t } = useTranslation();
  const baseView = useMemo(() => buildTherapistView(data), [data]);
  const [capacityOverride, setCapacityOverride] =
    useState<CapacityOverride | null>(null);

  // Demo mode never persists the owner's save, so the refetched status stays
  // the old one: keep the saved capacity on screen while the server still
  // reports the status it replaced. Once the server reports the saved status
  // the override is spent and cleared, so a later change back to the old
  // status (from the editor, say) can never bring it back. The page keys this
  // component on the persona id, so an override never follows the owner to
  // another persona either.
  if (capacityOverride && capacityOverride.status === baseView.status) {
    setCapacityOverride(null);
  }
  const isOverrideActive =
    capacityOverride !== null &&
    capacityOverride.status !== baseView.status &&
    capacityOverride.savedOver === baseView.status;
  const view = useMemo(
    () =>
      isOverrideActive && capacityOverride
        ? { ...baseView, status: capacityOverride.status }
        : baseView,
    [baseView, capacityOverride, isOverrideActive],
  );

  const hasContactRow = mode === "public" || mode === "visitor";
  // The owner's visitor preview pins its own exit pill to the foot of the
  // screen, so the phone bar shows for a real stranger only.
  const hasMobileBar = mode === "public";
  const backLabel = t("subprofiles:therapist.body.back");

  return (
    // The owner's "Edit" links read the persona id from here; every other
    // mode gets none.
    <TherapistEditProvider subprofileId={data.id} isOwner={mode === "owner"}>
      <div className={styles.page} data-mobile-bar={hasMobileBar || undefined}>
        {hasContactRow && (
          <a
            className={
              hasMobileBar ? `${styles.skip} ${styles.skipWide}` : styles.skip
            }
            href={`#${CONTACT_ID}`}
          >
            {t("subprofiles:therapist.body.skipToContact")}
          </a>
        )}
        {hasMobileBar && (
          <a
            className={`${styles.skip} ${styles.skipPhone}`}
            href={`#${MOBILE_CONTACT_ID}`}
          >
            {t("subprofiles:therapist.body.skipToContact")}
          </a>
        )}

        {mode === "preview" ? (
          <span className={styles.back}>
            <FiArrowLeft aria-hidden className={styles.backIcon} />
            {backLabel}
          </span>
        ) : (
          <Link className={styles.back} to={routes.mentalHealth}>
            <FiArrowLeft aria-hidden className={styles.backIcon} />
            {backLabel}
          </Link>
        )}

        {mode === "owner" && (
          <TherapistOwnerBar
            data={data}
            view={view}
            onAction={onAction}
            onCapacitySaved={(status) =>
              setCapacityOverride({ status, savedOver: baseView.status })
            }
          />
        )}

        <TherapistHero
          data={data}
          view={view}
          mode={mode}
          onAction={onAction}
          contactId={CONTACT_ID}
          hasMobileBar={hasMobileBar}
        />

        <div className={styles.cols}>
          <div className={styles.main}>
            <TherapistApproach view={view} />
            <TherapistSpecialties view={view} />
            <TherapistCredentials data={data} view={view} mode={mode} />
            <TherapistFirstSession view={view} />
            <TherapistPractical view={view} />
            <TherapistGallery
              data={data}
              view={view}
              mode={mode}
              onOpenGalleryPhoto={onOpenGalleryPhoto}
            />
            <TherapistVouches
              data={data}
              view={view}
              mode={mode}
              onAction={onAction}
            />
            <TherapistFaq view={view} />
            <TherapistReferrals view={view} />
          </div>
          <aside
            className={styles.side}
            aria-label={t("subprofiles:therapist.body.sideLabel", {
              name: view.firstName || data.displayName,
            })}
          >
            <TherapistSidebar
              data={data}
              view={view}
              mode={mode}
              onAction={onAction}
            />
          </aside>
        </div>

        {hasMobileBar && (
          <TherapistMobileBar
            data={data}
            view={view}
            onAction={onAction}
            contactId={MOBILE_CONTACT_ID}
          />
        )}
      </div>
    </TherapistEditProvider>
  );
}
