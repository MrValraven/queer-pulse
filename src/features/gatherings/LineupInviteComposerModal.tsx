import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import {
  Button,
  FilterChips,
  MemberIdentity,
  Modal,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileKind } from "../subprofiles/api/subprofiles.api";
import { KIND_LABEL_KEYS } from "../subprofiles/subprofile-kinds";
import { LINEUP_ROLES } from "./eventLineup.data";
import { LineupInvitePickStep } from "./LineupInvitePickStep";
import styles from "./GatheringLineupEditor.module.css";

/**
 * "Invite to lineup": pick a connection or someone going, then their craft,
 * then send. The invite goes out on Send; the row appears in the editor as
 * Invited straight away (optimistic) and the member answers from their
 * notification. Send closes the composer at once, so it needs no pending
 * state of its own. The crafts are a chip row: a dropdown panel in this
 * short dialog body only had room for a few options at a time.
 */
export function LineupInviteComposerModal({
  slug,
  excludeSlugs,
  onSend,
  onClose,
}: {
  slug: string;
  excludeSlugs: string[];
  onSend: (person: MemberSelectPerson, role: SubprofileKind) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [person, setPerson] = useState<MemberSelectPerson | null>(null);
  const [role, setRole] = useState<SubprofileKind>(LINEUP_ROLES[0]!);

  if (!person) {
    return (
      <LineupInvitePickStep
        slug={slug}
        excludeSlugs={excludeSlugs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPick={setPerson}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:lineup.title")}
      title={t("gatherings:lineup.roleStepTitle")}
      onClose={onClose}
      footer={
        <div className={styles.composerFooter}>
          <Button variant="ghost" onClick={() => setPerson(null)}>
            <FiArrowLeft size={16} aria-hidden />{" "}
            {t("gatherings:lineup.roleStepBack")}
          </Button>
          <Button variant="primary" onClick={() => onSend(person, role)}>
            {t("gatherings:lineup.sendCta")}
          </Button>
        </div>
      }
    >
      <div className={styles.composerBody}>
        <MemberIdentity person={person} size={38} />
        <FilterChips
          label={t("gatherings:lineup.roleLabel")}
          size="touch"
          options={LINEUP_ROLES.map((roleOption) => ({
            value: roleOption,
            label: t(KIND_LABEL_KEYS[roleOption]),
          }))}
          value={role}
          onChange={(value) => setRole(value as SubprofileKind)}
        />
      </div>
    </Modal>
  );
}
