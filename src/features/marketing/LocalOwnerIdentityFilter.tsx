import { AnimatePresence, m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useRefineGlide } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  OWNER_IDENTITIES,
  type OwnerIdentitySlug,
} from "./listBusiness/listingOwnerIdentities.data";
import s from "./LocalFilterBar.module.css";

/**
 * The "who runs it" filter: the same owner-identity tags a listing can pick
 * in the wizard, turned into something a member can search on.
 *
 * The vocabulary is read straight from `OWNER_IDENTITIES`, so a tag reads
 * identically here, on the card, and on the listing itself, and the slugs
 * sent to the URL can never drift from the four the backend accepts.
 *
 * A place matches when it carries ANY of the ticked tags: several tags are an
 * OR, since someone looking for a women-owned OR trans-owned place wants
 * either. A place that carries none of the tags (a demo venue, or a listing
 * that picked none) stays out while a tag is chosen.
 *
 * A real `<fieldset>`/`<legend>` names the group, and each tag is a toggle
 * carrying its own pressed state, so the whole thing is keyboard-operable and
 * announces what is on.
 */
export function LocalOwnerIdentityFilter({
  ownerIdentities,
  onToggleOwnerIdentity,
  ownerIdentityCounts,
  isLoadedSetComplete,
}: {
  /** The tags currently filtered on, in canonical order. */
  ownerIdentities: OwnerIdentitySlug[];
  onToggleOwnerIdentity: (slug: OwnerIdentitySlug) => void;
  /** How many loaded places would remain with each tag added. */
  ownerIdentityCounts: Record<OwnerIdentitySlug, number>;
  /** True once every page of places has loaded, so a zero count is final. */
  isLoadedSetComplete: boolean;
}) {
  const { t } = useTranslation();
  // Inside the Refine drawer a ticked chip pops its tick in and its
  // neighbours glide aside; in the mobile sheet the chips stay still.
  const glide = useRefineGlide();

  return (
    <fieldset className={s.accessGroup}>
      <legend className={s.groupLabel}>
        {t("marketing:local.filter.ownerIdentityLabel")}
      </legend>
      <p className={s.accessNote}>
        {t("marketing:local.filter.ownerIdentityNote")}
      </p>
      <m.div {...glide.row} className={s.accessChips}>
        {OWNER_IDENTITIES.map((identity) => {
          const isOn = ownerIdentities.includes(identity.slug);
          // A tag no remaining place carries goes unpickable once the whole
          // set has loaded. A ticked tag stays clickable so it can be undone.
          const isDisabled =
            isLoadedSetComplete &&
            !isOn &&
            ownerIdentityCounts[identity.slug] === 0;
          return (
            <m.button
              {...glide.chip}
              key={identity.slug}
              type="button"
              aria-pressed={isOn}
              disabled={isDisabled}
              className={[s.chip, isOn && s.chipOn].filter(Boolean).join(" ")}
              onClick={() => onToggleOwnerIdentity(identity.slug)}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {isOn && (
                  <m.span key="tick" className={s.tick} {...glide.tick}>
                    <FiCheck aria-hidden />
                  </m.span>
                )}
              </AnimatePresence>
              {t(identity.labelKey)}
            </m.button>
          );
        })}
      </m.div>
    </fieldset>
  );
}
