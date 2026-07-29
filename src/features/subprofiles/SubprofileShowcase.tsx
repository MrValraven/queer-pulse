import { useState } from "react";
import { nestedPersonaPath } from "../../app/routeMap";
import type { PublicSubprofileView } from "./api/subprofiles.adapters";
import { SubprofileFeatureCard } from "./SubprofileFeatureCard";
import { SubprofileSwitchList } from "./SubprofileSwitchList";
import styles from "./SubprofileShowcase.module.css";

/**
 * The main profile's "Also working as" body: one featured persona (the hero)
 * beside a switch list of all the personas. Selecting a persona previews it into
 * the hero; the hero is the single link that opens the persona page.
 *
 * One responsive component covers the whole range: with 2–6 personas the list
 * shows everyone; past {@link COLLAPSE_AT} it becomes a filterable, collapsed
 * index (the hero stays put) — so it never falls back to tabs or a carousel,
 * both of which hide options as the count grows.
 */

/** Above this many personas the switch list turns into a filterable index. */
const COLLAPSE_AT = 6;
/** Rows the collapsed index shows before "show all". */
const COLLAPSED_ROWS = 5;

export function SubprofileShowcase({
  personas,
  ownerSlug,
}: {
  personas: PublicSubprofileView[];
  ownerSlug: string;
}) {
  const [activeSlug, setActiveSlug] = useState(personas[0]?.slug ?? "");

  // Fall back to the first persona if the selected slug ever drops out (e.g. the
  // list changed underneath us). Never render an empty hero.
  const active =
    personas.find((persona) => persona.slug === activeSlug) ?? personas[0];
  if (!active) return null;

  const hasList = personas.length > 1;

  return (
    <div className={`${styles.showcase} ${hasList ? styles.split : ""}`}>
      <SubprofileFeatureCard
        persona={active}
        href={nestedPersonaPath(ownerSlug, active.slug)}
      />
      {hasList && (
        <SubprofileSwitchList
          personas={personas}
          activeSlug={active.slug}
          onSelect={setActiveSlug}
          asIndex={personas.length > COLLAPSE_AT}
          collapsedRows={COLLAPSED_ROWS}
        />
      )}
    </div>
  );
}
