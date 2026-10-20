import { useMemo, useState, type ComponentType } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { SubprofileAffiliations } from "../../SubprofileAffiliations";
import { SubprofileSpotlight } from "../../SubprofileSpotlight";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { PersonaAction, PersonaViewMode } from "../../personaSkinRender";
import {
  TATTOO_MAIN_BLOCKS,
  buildTattooView,
  type TattooBlockKey,
  type TattooBlockProps,
} from "./tattooView";
import { localIsoDate } from "./tattooView.helpers";
import type { TattooBooksStatus } from "./tattooVocab.data";
import { hasTattooSidebar } from "./tattooAside";
import { TattooEditProvider } from "./TattooEditContext";
import { TattooOwnerBar } from "./TattooOwnerBar";
import { TattooHero } from "./TattooHero";
import { TattooSidebar } from "./TattooSidebar";
import { TattooMobileBar } from "./TattooMobileBar";
import { TattooFlash, TattooWannaDos } from "./TattooFlash";
import { TattooHealed } from "./TattooHealed";
import { TattooScarWork } from "./TattooScarWork";
import { TattooCoverUps } from "./TattooCoverUps";
import { TattooProjects } from "./TattooProjects";
import { TattooStyles } from "./TattooStyles";
import { TattooBooking } from "./TattooBooking";
import { TattooPrices } from "./TattooPrices";
import { TattooComfort } from "./TattooComfort";
import { TattooHygiene } from "./TattooHygiene";
import { TattooAftercare } from "./TattooAftercare";
import { TattooGuestSpots } from "./TattooGuestSpots";
import { TattooFlashDays } from "./TattooFlashDays";
import { TattooShop } from "./TattooShop";
import { TattooGallery } from "./TattooGallery";
import { TattooLineage } from "./TattooLineage";
import { TattooFaq } from "./TattooFaq";
import styles from "./TattooBody.module.css";

/** One page block per key; the main column renders them in
 *  `TATTOO_MAIN_BLOCKS` order. */
const TATTOO_BLOCK_COMPONENTS: Record<
  TattooBlockKey,
  ComponentType<TattooBlockProps>
> = {
  flash: TattooFlash,
  healed: TattooHealed,
  scarWork: TattooScarWork,
  coverUps: TattooCoverUps,
  projects: TattooProjects,
  wannaDos: TattooWannaDos,
  styles: TattooStyles,
  booking: TattooBooking,
  prices: TattooPrices,
  comfort: TattooComfort,
  hygiene: TattooHygiene,
  aftercare: TattooAftercare,
  guestSpots: TattooGuestSpots,
  flashDays: TattooFlashDays,
  shop: TattooShop,
  gallery: TattooGallery,
  lineage: TattooLineage,
  faq: TattooFaq,
};

/** A status the owner just saved from the owner bar, and the status the
 *  server held when they saved it. */
interface StatusOverride {
  status: TattooBooksStatus;
  savedOver: TattooBooksStatus | null;
}

interface TattooBodyProps {
  data: PublicSubprofileView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
  /** Opens the page's lightbox on a work photo. The editor preview may
   *  leave it out; its tiles are inert there anyway. */
  onOpenWorkItem?: (item: SubprofileItemView) => void;
  onOpenGalleryPhoto?: (item: SubprofileItemView) => void;
}

/**
 * The tattoo layout inside the persona page's `.wrap`: owner bar (owner
 * only), hero, then the main column (the starred piece, every block in
 * order, the shared persona footer) beside the sticky sidebar, then the
 * phone booking bar (public only). The view model is built once here and
 * handed to every block.
 */
export function TattooBody({
  data,
  mode,
  onAction,
  onOpenWorkItem,
  onOpenGalleryPhoto,
}: TattooBodyProps) {
  const { t } = useTranslation();
  const baseView = useMemo(
    () => buildTattooView(data, localIsoDate(new Date())),
    [data],
  );
  const [statusOverride, setStatusOverride] = useState<StatusOverride | null>(
    null,
  );

  // Demo mode never persists the owner's save, so the refetched status stays
  // the old one: keep the saved status on screen while the server still
  // reports the status it replaced. Once the server reports the saved status
  // the override is spent and cleared, so a later change back to the old
  // status (from the editor, say) can never bring it back. The page keys this
  // component on the persona id, so an override never follows the owner to
  // another persona either.
  if (statusOverride && statusOverride.status === baseView.status) {
    setStatusOverride(null);
  }
  const isOverrideActive =
    statusOverride !== null &&
    statusOverride.status !== baseView.status &&
    statusOverride.savedOver === baseView.status;
  const view = useMemo(
    () =>
      isOverrideActive && statusOverride
        ? { ...baseView, status: statusOverride.status }
        : baseView,
    [baseView, statusOverride, isOverrideActive],
  );

  // The owner's visitor preview pins its own exit pill to the foot of the
  // screen, so the phone bar shows for a real visitor only, and only when
  // there is a way to book to take them to.
  const hasMobileBar = mode === "public" && view.hasContent.booking;
  const hasSidebar = hasTattooSidebar(view, mode);

  return (
    // The owner's "Edit" links and empty chapters read the persona id from
    // here; every other mode gets none.
    <TattooEditProvider subprofileId={data.id} isOwner={mode === "owner"}>
      <div className={styles.page} data-mobile-bar={hasMobileBar || undefined}>
        {mode === "owner" && (
          <TattooOwnerBar
            data={data}
            view={view}
            onAction={onAction}
            onStatusSaved={(status) =>
              setStatusOverride({ status, savedOver: baseView.status })
            }
          />
        )}

        <TattooHero data={data} view={view} mode={mode} onAction={onAction} />

        <div className={styles.columns} data-has-side={hasSidebar || undefined}>
          <div className={styles.main}>
            {view.featured && (
              <section
                className={styles.spotlight}
                aria-label={t("subprofiles:tattoo.body.spotlightLabel")}
              >
                <SubprofileSpotlight
                  item={view.featured}
                  skin="studio"
                  mode={mode}
                  accent={data.accent}
                />
              </section>
            )}

            {TATTOO_MAIN_BLOCKS.map((blockKey) => {
              const Block = TATTOO_BLOCK_COMPONENTS[blockKey];
              return (
                <Block
                  key={blockKey}
                  data={data}
                  view={view}
                  mode={mode}
                  onOpenWorkItem={onOpenWorkItem}
                  onOpenGalleryPhoto={onOpenGalleryPhoto}
                />
              );
            })}

            {/* Endorsements, "Part of" and "Works at" (the persona's studio
                teams), as every other persona page shows them. */}
            <SubprofileAffiliations
              persona={data}
              skin="studio"
              mode={mode}
              onAction={onAction}
            />
          </div>

          {hasSidebar && <TattooSidebar data={data} view={view} mode={mode} />}
        </div>

        {hasMobileBar && <TattooMobileBar data={data} view={view} />}
      </div>
    </TattooEditProvider>
  );
}
