import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { FiUserPlus } from "react-icons/fi";
import { routes, subprofileEditPath } from "../../app/routeMap";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSubprofiles } from "../subprofiles/api/useSubprofiles";
import { MAX_SUBPROFILES } from "../subprofiles/mySubprofiles.data";
import { NewSideModal } from "../subprofiles/NewSideModal";
import {
  STUDIO_ARTIST_PERSONA_KINDS,
  isStudioArtistPersonaKind,
} from "./api/studio.types";

/**
 * What a Studio member with no uploadable persona sees (upload, numbers and
 * press kit pages). Studio lists only published artist personas set to Open
 * to everyone, and a new persona starts as a draft, so creating one is never
 * enough on its own. Three cases, each naming what is missing:
 *
 * - an artist persona they already own that is unpublished or not Open to
 *   everyone: open it in the editor to finish it (creating another stays the
 *   second action while there is room);
 * - every persona slot taken, none of them an artist kind: go to the
 *   personas dashboard, since a create would be refused;
 * - otherwise: "Create a persona" opens the create wizard right here, limited
 *   to the Studio artist crafts. A create lands in the new persona's editor,
 *   where it gets published.
 */
export function StudioNoPersonaState({
  icon = <FiUserPlus />,
}: {
  icon?: ReactNode;
}) {
  const { t } = useTranslation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data: ownedPersonas } = useSubprofiles();
  const ownedPersonaList = ownedPersonas ?? [];
  const isAtPersonaCap = ownedPersonaList.length >= MAX_SUBPROFILES;
  // Studio did not list it, so an artist persona here is missing a publish
  // or Open to everyone (or a moderation hold, which its editor explains).
  const unfinishedArtistPersona =
    ownedPersonaList.find(
      (persona) =>
        isStudioArtistPersonaKind(persona.kind) &&
        (persona.status !== "published" || persona.visibility !== "open"),
    ) ?? null;
  const createAction = {
    label: t("studio:uploadFlow.noPersona.cta"),
    onClick: () => setIsCreateOpen(true),
  };
  const personaName =
    unfinishedArtistPersona?.displayName || t("subprofiles:mine.untitled");

  let description: string;
  let action;
  let secondaryAction;
  if (unfinishedArtistPersona) {
    description = t("studio:uploadFlow.noPersona.unfinishedBody", {
      name: personaName,
    });
    action = {
      label: t("studio:uploadFlow.noPersona.unfinishedCta", {
        name: personaName,
      }),
      to: subprofileEditPath(unfinishedArtistPersona.id),
    };
    secondaryAction = isAtPersonaCap ? undefined : createAction;
  } else if (isAtPersonaCap) {
    description = t("studio:uploadFlow.noPersona.atCapBody", {
      max: MAX_SUBPROFILES,
    });
    action = {
      label: t("studio:uploadFlow.noPersona.dashboardCta"),
      to: routes.subprofilesDashboard,
    };
  } else {
    description = t("studio:uploadFlow.noPersona.body");
    action = createAction;
  }

  return (
    <>
      <EmptyState
        icon={icon}
        title={t("studio:uploadFlow.noPersona.title")}
        description={description}
        action={action}
        secondaryAction={secondaryAction}
        headingLevel={2}
      />
      <AnimatePresence>
        {isCreateOpen && (
          <NewSideModal
            key="studio-create-persona"
            allowedKinds={STUDIO_ARTIST_PERSONA_KINDS}
            craftStepSub={t("studio:uploadFlow.noPersona.modalSub")}
            onClose={() => setIsCreateOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
