import { useEffect, useRef, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import {
  Button,
  Collapse,
  MemberIdentity,
  Modal,
  type MemberSelectPerson,
} from "../../../shared/components/ui";
import { codedReasonFor } from "../../../shared/api/errorHandling";
import { describeError } from "../../../shared/api/errorMessage";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { CohostInvitePickStep } from "../../gatherings/CohostInvitePickStep";
import type { CohostAddDialogProps } from "../../gatherings/eventHostScope";
import { useAddMusicEventCohost } from "./api/useAddMusicEventCohost";
import styles from "./MusicEventPickers.module.css";

/** A press that never settles frees the add button again after this long. */
const ADD_GUARD_RELEASE_MS = 4000;

/**
 * Adding a cohost to a house music event is immediate, with no invite. Step
 * one picks one of the staff member's connections; step two confirms. A
 * refusal from the server is named in full under the body and the dialog stays
 * open. After a coded refusal Add cohost is disabled, so "Pick someone else"
 * leads; an uncoded failure keeps the retry.
 */
export function MusicEventCohostAddDialog({
  slug,
  excludeSlugs,
  onAdded,
  onClose,
}: CohostAddDialogProps) {
  const { t } = useTranslation();
  const addCohost = useAddMusicEventCohost(slug);
  // Held here, above the pick step, so "Pick someone else" keeps the query.
  const [searchQuery, setSearchQuery] = useState("");
  const [picked, setPicked] = useState<MemberSelectPerson | null>(null);
  const [refusalLine, setRefusalLine] = useState<string | null>(null);
  // A coded refusal is final for this person, so Add cohost stays off until
  // someone else is picked. A failure with no coded reason may be transient,
  // so it keeps the retry.
  const [isRefusalFinal, setIsRefusalFinal] = useState(false);
  const isAddingRef = useRef(false);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    },
    [],
  );

  const releaseGuard = () => {
    isAddingRef.current = false;
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = null;
  };

  const add = async () => {
    if (!picked || isAddingRef.current) return;
    isAddingRef.current = true;
    releaseTimerRef.current = setTimeout(releaseGuard, ADD_GUARD_RELEASE_MS);
    try {
      await addCohost.mutateAsync({ memberSlug: picked.slug });
      releaseGuard();
      setRefusalLine(null);
      setIsRefusalFinal(false);
      onAdded(picked);
    } catch (error) {
      releaseGuard();
      // The server's own coded reason first; otherwise the frame plus
      // whatever cause the error carries, so a failure is never silent.
      const codedReason = codedReasonFor(error);
      setIsRefusalFinal(codedReason !== null);
      setRefusalLine(
        codedReason ??
          describeError(
            t("admin:musicEvents.cohostAdd.errorFrame", { name: picked.name }),
            error,
          ),
      );
    }
  };

  const pickOther = () => {
    setRefusalLine(null);
    setIsRefusalFinal(false);
    setPicked(null);
  };

  if (!picked) {
    return (
      <CohostInvitePickStep
        excludeSlugs={excludeSlugs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPick={setPicked}
        onClose={onClose}
        title={t("admin:musicEvents.cohostAdd.pickTitle")}
        sub={t("admin:musicEvents.cohostAdd.pickSub")}
      />
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:cohost.addModal.eyebrow")}
      title={t("admin:musicEvents.cohostAdd.confirmTitle", {
        name: picked.name,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={pickOther}>
            {t("admin:musicEvents.cohostAdd.pickOther")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void add()}
            disabled={addCohost.isPending || isRefusalFinal}
          >
            {t("admin:musicEvents.cohostAdd.confirmCta")}
          </Button>
        </>
      }
    >
      <div className={styles.pickedRow}>
        <MemberIdentity person={picked} secondary={picked.pronouns} size={38} />
      </div>
      <p className={styles.confirmBody}>
        {t("admin:musicEvents.cohostAdd.confirmBody")}
      </p>
      <Collapse isOpen={refusalLine !== null}>
        <p className={styles.refusal} role="alert">
          <FiAlertCircle aria-hidden />
          {refusalLine}
        </p>
      </Collapse>
    </Modal>
  );
}
