import { Link } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { initialsFromName } from "../../shared/lib/initials";
import { safeHref } from "../../shared/lib/safeHref";
import { Avatar, Button, Eyebrow, ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { collaboratorHref } from "./collaborators.data";
import { WorkshopSnippet } from "./skins/WorkshopBlocks";
import type { PersonaViewMode } from "./personaSkinRender";
import type { SubprofileItemView } from "./api/subprofiles.adapters";
import type { SkinFamily } from "./subprofile-skins";

/**
 * The `.pp-spot` featured-item block, shown between the hero and the regular
 * sections (or skipped entirely by the page host for the table skin, whose
 * featured item renders as `TableBlocks.MenuCard` instead — Task 4). The
 * workshop skin's code snippet renders inline here via Task 4's
 * `WorkshopSnippet` (not a separate `SkinExtras` slot) when the featured
 * item carries `structured.snippet` — a single source for that block instead
 * of a second copy of its markup.
 *
 * In `mode="preview"` (the Phase-3 editor's docked preview) the "Open" CTA
 * and collaborator credits render as non-navigating look-alikes — same
 * classes, no `href`/`to` — mirroring `SubprofileSections`' `LinksSection`
 * pattern, so a click inside the preview can never leave the editor.
 */
export function SubprofileSpotlight({
  item,
  skin,
  mode,
}: {
  item: SubprofileItemView;
  skin: SkinFamily;
  mode: PersonaViewMode;
}) {
  const { t } = useTranslation();
  const interactive = mode !== "preview";
  const spotlightHref = safeHref(item.url);

  return (
    <div className="pp-spot">
      <div className="art">
        <ImageSlot
          src={item.imageUrl || undefined}
          alt={item.title}
          tint="plum"
          radius={0}
          height="100%"
          className="ph"
        />
      </div>
      <div className="txt">
        <Eyebrow>{t("subprofiles:spotlight.eyebrow")}</Eyebrow>
        <h3>{item.title}</h3>
        {(item.subtitle || item.description) && (
          <p>{item.subtitle || item.description}</p>
        )}

        {skin === "workshop" && <WorkshopSnippet item={item} />}

        {item.collaborators.length > 0 && (
          <div className="credits">
            <span>{t("subprofiles:collab.with")}</span>
            {item.collaborators.map((collaborator) => {
              const collaboratorContent = (
                <>
                  <Avatar
                    className="avatar"
                    initials={initialsFromName(collaborator.name, "?")}
                    src={collaborator.avatarUrl ?? undefined}
                    alt={collaborator.name}
                    size={22}
                  />
                  {collaborator.name}
                </>
              );
              if (!interactive) {
                return (
                  <div key={collaborator.handle}>{collaboratorContent}</div>
                );
              }
              return (
                <Link key={collaborator.handle} to={collaboratorHref(collaborator)}>
                  {collaboratorContent}
                </Link>
              );
            })}
          </div>
        )}

        {spotlightHref && (
          interactive ? (
            <Button
              variant="primary"
              size="md"
              href={spotlightHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("subprofiles:spotlight.open")} <FiExternalLink aria-hidden />
            </Button>
          ) : (
            <Button type="button" variant="primary" size="md" disabled>
              {t("subprofiles:spotlight.open")} <FiExternalLink aria-hidden />
            </Button>
          )
        )}
      </div>
    </div>
  );
}
