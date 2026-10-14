import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { StudioPersonaRefView } from "./api/studio.adapters";

/** A credited persona: a link when it has somewhere to go (a listenable
 *  persona's Studio page, else its persona page), plain text for a persona
 *  with no handle. The chips and the album summary both name personas
 *  through it, so the rule lives once. */
export function StudioPersonaRefLink({
  persona,
  className,
  children,
}: {
  persona: StudioPersonaRefView;
  className: string;
  children: ReactNode;
}) {
  return persona.href ? (
    <Link to={persona.href} className={className}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  );
}
