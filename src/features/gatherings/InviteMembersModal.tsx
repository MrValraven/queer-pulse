import { useMemo, useState } from "react";
import {
  Button,
  Modal,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStaffMap } from "../../shared/staff/useStaffRole";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { MEMBER_POOL } from "./manageCohosts.data";
import { useInviteMembers } from "./api/useEventMutations";
import styles from "./ManageCohosts.module.css";

/** Backend cap: at most 100 slugs per invite call. */
const MAX_INVITES = 100;

export function InviteMembersModal({
  slug,
  /** Slugs already going / already invited — hidden from the pool. */
  excludeSlugs = [],
  onClose,
}: {
  slug: string;
  excludeSlugs?: string[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const staffMap = useStaffMap();
  const inviteMembers = useInviteMembers(slug);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState(false);

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

  const atCap = selected.size >= MAX_INVITES;

  const toggle = (memberSlug: string) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(memberSlug)) next.delete(memberSlug);
      else if (next.size < MAX_INVITES) next.add(memberSlug);
      return next;
    });
  };

  const send = () => {
    if (selected.size === 0) return;
    // Demo → no-op mutation, optimistic UI here. Live → fires the POST + invalidate.
    inviteMembers.mutate([...selected]);
    setSent(true);
    showToast(
      t("gatherings:manage.invite.sentToast", { count: selected.size }),
      "success",
    );
  };

  if (sent) {
    return (
      <GatheringSuccessPanel
        title={
          <Translation
            i18nKey="gatherings:manage.invite.successTitle"
            components={{ em: <em /> }}
          />
        }
        sub={
          <Translation
            i18nKey="gatherings:manage.invite.successSub"
            values={{ count: selected.size }}
            components={{ b: <b /> }}
          />
        }
        meta={t("gatherings:manage.invite.successMeta", {
          count: selected.size,
        })}
        onClose={onClose}
      />
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:manage.invite.eyebrow")}
      title={
        <Translation
          i18nKey="gatherings:manage.invite.title"
          components={{ em: <em /> }}
        />
      }
      sub={t("gatherings:manage.invite.sub")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="primary"
            onClick={send}
            disabled={selected.size === 0}
          >
            {selected.size === 0
              ? t("gatherings:manage.invite.sendDefaultCta")
              : t("gatherings:manage.invite.sendCta", {
                  count: selected.size,
                })}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <MemberSelectList
        people={people}
        selected={selected}
        onToggle={toggle}
        cap={MAX_INVITES}
        excludeSlugs={excludeSlugs}
        searchPlaceholder={t("gatherings:manage.invite.searchLabel")}
      />

      <div className={styles.pickerFooter}>
        <div className={styles.selCount}>
          {selected.size === 0 ? (
            t("gatherings:manage.invite.noneSelected")
          ) : (
            <>
              <Translation
                i18nKey="gatherings:manage.invite.selectedCount"
                values={{ count: selected.size }}
                components={{ b: <b /> }}
              />
              {atCap && (
                <span className={styles.capWarn}>
                  {t("gatherings:manage.invite.capWarning", {
                    max: MAX_INVITES,
                  })}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
