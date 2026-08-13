import { Link } from "react-router-dom";
import { Reveal } from "../../../shared/components/ui";
import type { LandingChangemakerFeatureDTO } from "../../admin/api/landingFeatures.api";
import styles from "./LiveSections.module.css";

/**
 * The auto-fit grid of changemaker cards on the plum panel — each a cause
 * eyebrow, name, blurb and tag chips linking to the changemaker's page. Shared
 * by `LiveChangeMakers` (the public homepage) and `AdminLandingPreview` (the
 * `/admin/landing` preview) so both render the identical card family from the
 * same DTO. Must sit on a plum background: the cards use cream-on-plum styling.
 */
export function ChangemakerGrid({
  items,
}: {
  items: LandingChangemakerFeatureDTO[];
}) {
  return (
    <div className={styles.grid}>
      {items.map((person, index) => (
        <Reveal
          key={person.id}
          delay={index * 70}
          as={Link}
          to={`/changemaker/${person.slug}`}
          className={styles.changemakerCard}
        >
          <div className={styles.changemakerCause}>{person.cause}</div>
          <div className={styles.changemakerName}>{person.name}</div>
          <p className={styles.changemakerBlurb}>{person.blurb}</p>
          {person.tags.length > 0 && (
            <div className={styles.changemakerTags}>
              {person.tags.map((tag) => (
                <span key={tag} className={styles.changemakerTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Reveal>
      ))}
    </div>
  );
}
