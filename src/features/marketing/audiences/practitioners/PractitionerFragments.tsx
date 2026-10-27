import { useMemo } from "react";
import { sectionShape } from "../../../subprofiles/personaSkinRender";
import { ChairCard } from "../../../subprofiles/skins/ChairBlocks";
import { TattooStatusPill } from "../../../subprofiles/skins/tattoo/TattooStatusPill";
import { TherapistFirstSession } from "../../../subprofiles/skins/therapist/TherapistFirstSession";
import { AvailabilityCell } from "../../../subprofiles/skins/therapist/TherapistPracticalAvailability";
import { TherapistSpecialties } from "../../../subprofiles/skins/therapist/TherapistSpecialties";
import { buildTherapistView } from "../../../subprofiles/skins/therapist/therapistView";
import { SectionBody } from "../../../subprofiles/SubprofileSections";
import { skinFor } from "../../../subprofiles/subprofile-skins";
import { TATTOO_BOOKS_STATUSES } from "../../../subprofiles/skins/tattoo/tattooVocab.data";
import { SamplePersonaArticle } from "../shared/persona/SamplePersonaArticle";
import { sampleIsoDate } from "../shared/sampleDates";
import { useSampleFragmentView, useSampleToday } from "./useSamplePractitioner";
import styles from "./PractitionerFragments.module.css";

/*
 * Single blocks of the sample practitioners' pages, each in its own `.pp`
 * article so it wears its skin. Every block here is free of fixed ids, so a
 * fragment can sit beside the full page the Try it section renders.
 */

/** The therapist's topics, who-for chips and contexts. */
export function SampleTherapistTopics() {
  const view = useSampleFragmentView("therapist");
  const therapistView = useMemo(() => buildTherapistView(view), [view]);
  return (
    <SamplePersonaArticle view={view} className={styles.article}>
      <TherapistSpecialties view={therapistView} />
    </SamplePersonaArticle>
  );
}

/** The therapist's first session, step by step. */
export function SampleTherapistFirstSession() {
  const view = useSampleFragmentView("therapist");
  const therapistView = useMemo(() => buildTherapistView(view), [view]);
  return (
    <SamplePersonaArticle view={view} className={styles.article}>
      <TherapistFirstSession view={therapistView} />
    </SamplePersonaArticle>
  );
}

/** The hair stylist's price and booking band. */
export function SampleChairCard() {
  const view = useSampleFragmentView("hair_stylist");
  return (
    <SamplePersonaArticle view={view} className={styles.article}>
      <ChairCard persona={view} />
    </SamplePersonaArticle>
  );
}

/** The photographer's series, as the studio skin lays its tiles out. */
export function SamplePhotoSeries() {
  const view = useSampleFragmentView("photographer");
  const skin = skinFor(view.kind);
  const seriesItems =
    view.sections.find((section) => section.section === "series")?.items ?? [];
  return (
    <SamplePersonaArticle view={view} className={styles.article}>
      <div className={styles.series}>
        <SectionBody
          shape={sectionShape("series", skin, seriesItems)}
          items={seriesItems}
          skin={skin}
          interactive={false}
          displayName={view.displayName}
          accent={view.accent ?? undefined}
          kind={view.kind}
        />
      </div>
    </SamplePersonaArticle>
  );
}

/** Availability on two pages: the three books states a tattoo artist can
 *  set, and the therapist's time to a first session, hours and open slots. */
export function SampleAvailability() {
  const today = useSampleToday();
  const tattooView = useSampleFragmentView("tattoo_artist");
  const therapistPersona = useSampleFragmentView("therapist");
  const therapistView = useMemo(
    () => buildTherapistView(therapistPersona),
    [therapistPersona],
  );
  const nextOpening = sampleIsoDate(today, 28);
  return (
    <div className={styles.availability}>
      <SamplePersonaArticle view={tattooView} className={styles.article}>
        <ul className={styles.statusRow}>
          {TATTOO_BOOKS_STATUSES.map((status) => (
            <li key={status}>
              <TattooStatusPill status={status} nextOpening={nextOpening} />
            </li>
          ))}
        </ul>
      </SamplePersonaArticle>
      <SamplePersonaArticle view={therapistPersona} className={styles.article}>
        <AvailabilityCell view={therapistView} />
      </SamplePersonaArticle>
    </div>
  );
}
