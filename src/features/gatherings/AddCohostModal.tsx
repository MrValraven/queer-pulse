import { useMemo } from "react";
import {
  Modal,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { MEMBER_POOL, type CohostCandidate } from "./manageCohosts.data";

/** Stable empty selection — the picker is single-tap, so nothing stays selected. */
const EMPTY_SELECTION = new Set<string>();

export function AddCohostModal({
  /** Slugs already cohosting — hidden from the pool. */
  excludeSlugs,
  onPick,
  onClose,
}: {
  excludeSlugs: string[];
  onPick: (candidate: CohostCandidate) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const staffMap = useStaffMap();

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      MEMBER_POOL.map((candidate) => ({
        slug: candidate.slug,
        name: candidate.name,
        avatarUrl: candidate.photo,
        pronouns: candidate.pronouns,
        staffRole: staffMap[candidate.slug],
      })),
    [staffMap],
  );

  const pick = (slug: string) => {
    const candidate = MEMBER_POOL.find((entry) => entry.slug === slug);
    if (candidate) onPick(candidate);
  };

  return (
    <Modal
      eyebrow={t("gatherings:cohost.addModal.eyebrow")}
      title={
        <Translation
          i18nKey="gatherings:cohost.addModal.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("gatherings:cohost.addModal.sub")}
      onClose={onClose}
    >
      <MemberSelectList
        people={people}
        selected={EMPTY_SELECTION}
        onToggle={pick}
        multiSelect={false}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t("gatherings:cohost.addModal.searchLabel")}
      />
    </Modal>
  );
}
