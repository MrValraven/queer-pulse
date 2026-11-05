import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { personaPublicPathOrNull } from "./personaLinks.data";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";

/**
 * The `.pp-owner` line at the end of the hero's meta row: the owner tie for a
 * linked persona (a link to the owner's profile when interactive), or the
 * persona's standalone address for an unlinked one. An unlinked, pseudonymous
 * persona never reveals who is behind it (spec §4).
 */
export function PersonaOwnerLine({
  view,
  isLinkedToOwner,
  interactive,
}: {
  view: PublicSubprofileView;
  isLinkedToOwner: boolean;
  interactive: boolean;
}) {
  const { t } = useTranslation();
  const standaloneAddress = personaPublicPathOrNull(view);

  if (isLinkedToOwner) {
    const ownerTie = (
      <Translation
        i18nKey="subprofiles:page.ownerTie"
        components={{ em: <em /> }}
        values={{ name: view.ownerName ?? "" }}
      />
    );
    return interactive ? (
      <Link className="pp-owner" to={`${routes.members}/${view.ownerSlug}`}>
        {ownerTie}
      </Link>
    ) : (
      <span className="pp-owner">{ownerTie}</span>
    );
  }

  return (
    <span className="pp-owner">
      {/* An unlinked draft with no handle has no address yet: `/p/:handle`
          only resolves handles, so showing a fabricated `/p/<slug>` gave the
          owner a dead link to copy. */}
      {standaloneAddress
        ? t("subprofiles:hero.standalone", { address: standaloneAddress })
        : t("subprofiles:hero.noAddressYet")}
    </span>
  );
}
