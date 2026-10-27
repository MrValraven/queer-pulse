import type { ReactNode } from "react";
import type { PublicSubprofileView } from "../../../../subprofiles/api/subprofiles.adapters";
import { SubprofileCoverBand } from "../../../../subprofiles/SubprofileCoverBand";
import {
  skinFor,
  type SkinFamily,
} from "../../../../subprofiles/subprofile-skins";
import {
  DEFAULT_ACCENT,
  skinVars,
} from "../../../../subprofiles/subprofilePresence.data";
import { usePersonaMotion } from "../../../../subprofiles/usePersonaMotion";
// The persona skins, in the order the persona page loads them: the skin
// styles first, then the motion layer that sits on the same selectors.
import "../../../../subprofiles/persona-skins.css";
import "../../../../subprofiles/persona-motion.css";

/** Skins whose `.pp-cover` is a thin rule, drawn with or without an image
 *  (mirrors `SubprofilePageBody`). */
const RULE_COVER_SKINS: ReadonlySet<SkinFamily> = new Set([
  "practice",
  "chair",
  "collective",
]);

function shouldMountCoverBand(
  view: PublicSubprofileView,
  skin: SkinFamily,
): boolean {
  if (view.coverUrl) return true;
  return RULE_COVER_SKINS.has(skin) && view.kind !== "therapist";
}

/**
 * The `.pp` article a persona page renders into, built the way
 * `SubprofilePageBody` builds it: skin and kind attributes, the accent's
 * custom properties and the scroll motion. The cover band sits above
 * `.wrap`, as on the real page; everything else goes inside `.wrap`.
 */
export function SamplePersonaArticle({
  view,
  children,
  className,
}: {
  view: PublicSubprofileView;
  children: ReactNode;
  className?: string;
}) {
  const rootRef = usePersonaMotion();
  const skin = skinFor(view.kind);
  return (
    <article
      className={["pp", className].filter(Boolean).join(" ")}
      data-skin={skin}
      data-kind={view.kind}
      data-has-cover={view.coverUrl ? "true" : undefined}
      style={skinVars(view.accent ?? DEFAULT_ACCENT)}
      ref={rootRef}
    >
      {shouldMountCoverBand(view, skin) && (
        <SubprofileCoverBand data={view} mode="preview" />
      )}
      <div className="wrap">{children}</div>
    </article>
  );
}
