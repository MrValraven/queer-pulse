import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { MemberPicker } from "./MemberPicker";
import { MEMBER_POOL } from "./manageCohosts.data";
import { useInviteMembers } from "./api/useEventMutations";
import modal from "./GatheringModals.module.css";
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
  useScrollLock();
  const { showToast } = useToast();
  const inviteMembers = useInviteMembers(slug);
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const atCap = selected.length >= MAX_INVITES;

  const toggle = (memberSlug: string) => {
    setSelected((prev) =>
      prev.includes(memberSlug)
        ? prev.filter((s) => s !== memberSlug)
        : prev.length >= MAX_INVITES
          ? prev
          : [...prev, memberSlug],
    );
  };

  const send = () => {
    if (selected.length === 0) return;
    // Demo → no-op mutation, optimistic UI here. Live → fires the POST + invalidate.
    inviteMembers.mutate(selected);
    setSent(true);
    showToast(
      t("gatherings:manage.invite.sentToast", { count: selected.length }),
      "success",
    );
  };

  return (
    <div
      className={modal.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {sent ? (
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
              values={{ count: selected.length }}
              components={{ b: <b /> }}
            />
          }
          meta={t("gatherings:manage.invite.successMeta", {
            count: selected.length,
          })}
          onClose={onClose}
        />
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("gatherings:manage.invite.eyebrow")}
          className={modal.modal}
        >
          <button
            type="button"
            className={modal.close}
            onClick={onClose}
            aria-label={t("gatherings:manage.closeAria")}
          >
            <FiX />
          </button>
          <div className={modal.eye}>
            {t("gatherings:manage.invite.eyebrow")}
          </div>
          <div className={modal.title}>
            <Translation
              i18nKey="gatherings:manage.invite.title"
              components={{ em: <em /> }}
            />
          </div>
          <p className={modal.sub}>{t("gatherings:manage.invite.sub")}</p>

          <MemberPicker
            candidates={MEMBER_POOL}
            excludeSlugs={excludeSlugs}
            selected={selected}
            onToggle={toggle}
            atCap={atCap}
            multiSelect
            searchLabel={t("gatherings:manage.invite.searchLabel")}
          />

          <div className={styles.pickerFooter}>
            <div className={styles.selCount}>
              {selected.length === 0 ? (
                t("gatherings:manage.invite.noneSelected")
              ) : (
                <>
                  <Translation
                    i18nKey="gatherings:manage.invite.selectedCount"
                    values={{ count: selected.length }}
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

          <div className={modal.actions}>
            <Button
              variant="primary"
              onClick={send}
              disabled={selected.length === 0}
            >
              {selected.length === 0
                ? t("gatherings:manage.invite.sendDefaultCta")
                : t("gatherings:manage.invite.sendCta", {
                    count: selected.length,
                  })}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t("gatherings:manage.cancelCta")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
