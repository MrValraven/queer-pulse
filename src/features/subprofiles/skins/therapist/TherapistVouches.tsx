import { useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiPlus } from "react-icons/fi";
import { useAuth } from "../../../../app/providers/authContext";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { routes } from "../../../../app/routeMap";
import { Avatar, Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { initialsFromName } from "../../../../shared/lib/initials";
import type { PublicSubprofileView } from "../../api/subprofiles.adapters";
import type { EndorserDTO } from "../../api/subprofiles.api";
import { useEndorsers } from "../../api/useEndorsers";
import { EndorseSubprofileModal } from "../../EndorseSubprofileModal";
import type { PersonaAction, PersonaViewMode } from "../../personaSkinRender";
import { personaAddressName } from "../../subprofile-kinds";
import { TherapistSection } from "./TherapistSection";
import type { TherapistView } from "./therapistView";
import styles from "./TherapistSections.module.css";

const MAX_FACES = 3;

interface TherapistVouchesProps {
  data: PublicSubprofileView;
  view: TherapistView;
  mode: PersonaViewMode;
  onAction: (action: PersonaAction) => void;
}

/** "Community vouches": the persona's endorsements in the design's vouch
 *  framing. A count with faces, the endorsers who left a note as quote cards,
 *  then the vouch control. With no endorsements yet it shows an empty state
 *  and the control, so the section always renders. Reporting lives in the
 *  sidebar's "Report a concern" row, so `onAction` is accepted for the shared
 *  section contract and left unused here. */
export function TherapistVouches({ data, view, mode }: TherapistVouchesProps) {
  const { t } = useTranslation();
  const name = view.firstName;
  const count = data.endorsementCount;
  const { data: endorsersResult } = useEndorsers(data.id, count > 0);
  const endorsers = endorsersResult?.endorsers ?? [];
  const withNotes = endorsers.filter(
    (endorser) => (endorser.note ?? "").trim() !== "",
  );
  const isInteractive = mode !== "preview";

  return (
    <TherapistSection
      label={t("subprofiles:therapist.vouches.label")}
      heading={t("subprofiles:therapist.vouches.heading", { name })}
    >
      {count > 0 ? (
        <div className={styles.vouchHead}>
          {endorsers.length > 0 && (
            <div className={styles.faces} aria-hidden="true">
              {endorsers.slice(0, MAX_FACES).map((endorser, faceIndex) => (
                <Avatar
                  key={`${endorser.slug}-${faceIndex}`}
                  initials={initialsFromName(endorser.name, "?")}
                  src={endorser.avatarUrl ?? undefined}
                  tint="plum"
                  size={34}
                  className={styles.face}
                />
              ))}
            </div>
          )}
          <p className={styles.vouchCount}>
            <strong className={styles.vouchCountLead}>
              {t("subprofiles:therapist.vouches.count", { count })}
            </strong>
            {endorsersResult && (
              <VouchBreakdown
                total={endorsersResult.count}
                withNoteCount={withNotes.length}
              />
            )}
          </p>
        </div>
      ) : (
        <p className={styles.vouchEmpty}>
          {t("subprofiles:therapist.vouches.empty", { name })}
        </p>
      )}

      {withNotes.length > 0 && (
        <ul className={styles.vouchList}>
          {withNotes.map((endorser, noteIndex) => (
            <VouchCard
              key={`${endorser.slug}-${noteIndex}`}
              endorser={endorser}
              isInteractive={isInteractive}
            />
          ))}
        </ul>
      )}

      <VouchFooter data={data} view={view} mode={mode} />
    </TherapistSection>
  );
}

/** "3 vouched without a note, 2 left a note." Both numbers come from the
 *  endorsers endpoint (its total and the notes in its list), and a clause
 *  whose number is 0 is dropped. */
function VouchBreakdown({
  total,
  withNoteCount,
}: {
  total: number;
  withNoteCount: number;
}) {
  const { t } = useTranslation();
  const quietCount = Math.max(0, total - withNoteCount);
  const clauses = [
    quietCount > 0 &&
      t("subprofiles:therapist.vouches.quiet", { count: quietCount }),
    withNoteCount > 0 &&
      t("subprofiles:therapist.vouches.notes", { count: withNoteCount }),
  ].filter((clause): clause is string => typeof clause === "string");
  if (clauses.length === 2) {
    return t("subprofiles:therapist.vouches.breakdown", {
      quiet: clauses[0],
      notes: clauses[1],
    });
  }
  if (clauses.length === 1) {
    return t("subprofiles:therapist.vouches.breakdownOne", {
      clause: clauses[0],
    });
  }
  return null;
}

/** One endorser's note as a serif quote, signed with their face and name
 *  (a link to their profile outside the editor preview). */
function VouchCard({
  endorser,
  isInteractive,
}: {
  endorser: EndorserDTO;
  isInteractive: boolean;
}) {
  const signature = (
    <>
      <Avatar
        initials={initialsFromName(endorser.name, "?")}
        src={endorser.avatarUrl ?? undefined}
        alt=""
        tint="plum"
        size={30}
      />
      <span className={styles.vouchName}>{endorser.name}</span>
    </>
  );
  return (
    <li className={styles.vouchCard}>
      <blockquote className={styles.vouchQuote}>“{endorser.note}”</blockquote>
      {isInteractive ? (
        <Link
          className={styles.vouchWho}
          to={`${routes.members}/${endorser.slug}`}
        >
          {signature}
        </Link>
      ) : (
        <span className={styles.vouchWho}>{signature}</span>
      )}
    </li>
  );
}

/** Footer line plus the vouch button for this `mode`: live for a public
 *  viewer, a disabled look-alike in the editor preview and in visitor mode
 *  (the owner reading their own page, where a real endorse would target
 *  their own persona), and just the line for the owner. */
function VouchFooter({
  data,
  view,
  mode,
}: Omit<TherapistVouchesProps, "onAction">) {
  const { t } = useTranslation();
  const isPublic = mode === "public";
  const isInert = mode === "preview" || mode === "visitor";

  return (
    <div className={styles.vouchFoot}>
      <p className={styles.vouchFootText}>
        {t("subprofiles:therapist.vouches.footer", { name: view.firstName })}
      </p>
      {(isPublic || isInert) && (
        <div className={styles.vouchFootActions}>
          {isPublic ? (
            <VouchControl data={data} name={view.firstName} />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={styles.vouchButton}
              disabled
            >
              <FiPlus aria-hidden="true" />
              {t("subprofiles:therapist.vouches.cta", { name: view.firstName })}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** The live vouch button. Opens the shared endorse modal (create, or edit
 *  once the viewer has vouched). Hidden for a logged-out live visitor, who
 *  cannot endorse, as in `SubprofileEndorse`. */
function VouchControl({
  data,
  name,
}: {
  data: PublicSubprofileView;
  name: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  if (!demoMode && !loggedIn) return null;

  return (
    <>
      <Button
        type="button"
        variant={data.viewerEndorsed ? "jade" : "ghost"}
        size="sm"
        className={styles.vouchButton}
        aria-pressed={data.viewerEndorsed}
        onClick={() => setIsModalOpen(true)}
      >
        {data.viewerEndorsed ? (
          <FiCheck aria-hidden="true" />
        ) : (
          <FiPlus aria-hidden="true" />
        )}
        {data.viewerEndorsed
          ? t("subprofiles:therapist.vouches.vouched")
          : t("subprofiles:therapist.vouches.cta", { name })}
      </Button>
      {isModalOpen && (
        <EndorseSubprofileModal
          subprofileId={data.id}
          endorsementCount={data.endorsementCount}
          personaName={personaAddressName({
            displayName: data.displayName,
            kind: data.kind,
            ownerName: data.ownerName,
          })}
          personaAvatarUrl={data.avatarUrl}
          viewerEndorsed={data.viewerEndorsed}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
