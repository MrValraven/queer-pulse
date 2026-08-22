import { useState } from "react";
import { initialsFromName } from "../../shared/lib/initials";
import { FiCheck } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useEndorsers } from "./api/useEndorsers";
import { EndorseSubprofileModal } from "./EndorseSubprofileModal";
import styles from "./SubprofileEndorse.module.css";

const MAX_CLUSTER_FACES = 5;

/**
 * The persona's endorse control: a one-tap Endorse/Endorsed button and a small
 * avatar cluster of endorsers (lazily fetched on mount). The button opens
 * `EndorseSubprofileModal` — in create mode when the viewer hasn't endorsed
 * yet, in edit mode (prefilled note + Save/Withdraw) once they have. Owners
 * can't endorse their own persona (`isOwnerViewing`), and a logged-out visitor
 * can't either, so both see the read-only cluster instead of the button. The
 * numeric endorsement count is surfaced elsewhere (the hero stat line);
 * `endorsementCount` is still consumed here to seed optimistic cache updates in
 * `useEndorsement`. `personaName`/`personaAvatarUrl` are threaded through only
 * so the modal's success panel can show the persona's face.
 */
export function SubprofileEndorse({
  subprofileId,
  endorsementCount,
  viewerEndorsed,
  isOwnerViewing,
  personaName,
  personaAvatarUrl,
}: {
  subprofileId: string;
  endorsementCount: number;
  viewerEndorsed: boolean;
  isOwnerViewing: boolean;
  personaName: string;
  personaAvatarUrl: string | null;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // One shared hook for this query everywhere (it was declared inline in four
  // places with drifting queryFns — two of them dropping the abort `signal`,
  // so whichever observer mounted first decided whether the fetch was
  // cancellable).
  const { data: endorsersResult } = useEndorsers(subprofileId, true);
  const endorsers = endorsersResult?.endorsers ?? [];

  const canEndorse = !isOwnerViewing && (demoMode || loggedIn);

  return (
    <div className={styles.wrap}>
      <div className={styles.controlRow}>
        {canEndorse && (
          <Button
            variant={viewerEndorsed ? "jade" : "ghost"}
            size="md"
            aria-pressed={viewerEndorsed}
            onClick={() => setModalOpen(true)}
          >
            {viewerEndorsed ? (
              <>
                <FiCheck aria-hidden />
                {t("subprofiles:hero.endorse.endorsed")}
              </>
            ) : (
              t("subprofiles:hero.endorse.cta")
            )}
          </Button>
        )}

        {endorsers.length > 0 && (
          <div className={styles.cluster}>
            {endorsers.slice(0, MAX_CLUSTER_FACES).map((endorser) => (
              <Avatar
                key={endorser.slug}
                initials={initialsFromName(endorser.name, "?")}
                src={endorser.avatarUrl ?? undefined}
                alt={endorser.name}
                title={endorser.name}
                tint="plum"
                size={28}
                className={styles.clusterFace}
              />
            ))}
            <span className="visuallyHidden">
              {t("subprofiles:hero.endorse.endorsedByNames", {
                names: endorsers.map((endorser) => endorser.name).join(", "),
              })}
            </span>
          </div>
        )}
      </div>

      {canEndorse && modalOpen && (
        <EndorseSubprofileModal
          subprofileId={subprofileId}
          endorsementCount={endorsementCount}
          personaName={personaName}
          personaAvatarUrl={personaAvatarUrl}
          viewerEndorsed={viewerEndorsed}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
