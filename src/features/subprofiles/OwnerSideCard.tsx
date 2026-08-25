import { useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { subprofileEditPath } from "../../app/routeMap";
import type { SubprofileView } from "./api/subprofiles.adapters";
import { personaPublicPathForOwner } from "./personaLinks.data";
import { SideCard } from "./SideCard";
import { usePersonaCreatorSlug } from "./usePersonaCreatorSlug";

/** What the dashboard needs to open the share card for one persona: the row
 *  plus the creator slug its public address is built from. */
export interface PersonaShareTarget {
  view: SubprofileView;
  creatorSlug: string;
}

/**
 * One dashboard card, with its public address resolved from the persona's
 * CREATOR rather than the signed-in member.
 *
 * A co-owner sees co-owned personas in this grid too, and a linked persona
 * lives under its creator's profile. Building View / Share from the viewer's
 * own slug sent every co-owner to a not-found wall and had them share a dead
 * link, so both actions go through `usePersonaCreatorSlug` and wait for a real
 * answer rather than guessing.
 */
export function OwnerSideCard({
  view,
  onShare,
  onDelete,
}: {
  view: SubprofileView;
  onShare: (target: PersonaShareTarget) => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const creatorSlug = usePersonaCreatorSlug(view.id, view.memberCount);

  function withCreatorSlug(run: (slug: string) => void) {
    if (!creatorSlug) {
      showToast(t("subprofiles:share.resolvingAddress"), "info");
      return;
    }
    run(creatorSlug);
  }

  return (
    <SideCard
      view={view}
      onOpen={() =>
        withCreatorSlug(
          (slug) => void navigate(personaPublicPathForOwner(view, slug)),
        )
      }
      onEdit={() => void navigate(subprofileEditPath(view.id))}
      onShare={() =>
        withCreatorSlug((slug) => onShare({ view, creatorSlug: slug }))
      }
      onDelete={onDelete}
    />
  );
}
