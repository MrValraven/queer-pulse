import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminModal, AdminCheckLine } from "./ui";
import { firstName, type Community } from "./adminCommunities.data";
import styles from "./AdminCommunitiesPage.module.css";

export function AdminSupportModal({
  community,
  onClose,
}: {
  community: Community;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [checks, setChecks] = useState<boolean[]>([true, true, false, false]);
  const [note, setNote] = useState("");

  const firstWord = community.name.split(/\s+/)[0];
  const modFirsts = community.moderators.map((m) => firstName(m.name)).join(" & ");

  const options: { titleKey: string; sub: string }[] = [
    {
      titleKey: "admin:communities.support.option.message.title",
      sub:
        community.moderators.length > 0
          ? t("admin:communities.support.option.message.sub", {
              names: modFirsts,
            })
          : t("admin:communities.support.option.message.subNoMods"),
    },
    {
      titleKey: "admin:communities.support.option.buddy.title",
      sub: t("admin:communities.support.option.buddy.sub"),
    },
    {
      titleKey: "admin:communities.support.option.toolkit.title",
      sub: t("admin:communities.support.option.toolkit.sub"),
    },
    {
      titleKey: "admin:communities.support.option.recruit.title",
      sub: t("admin:communities.support.option.recruit.sub"),
    },
  ];

  function toggle(i: number) {
    setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)));
  }

  function send() {
    onClose();
    showToast(
      t("admin:communities.support.sentToast", { name: firstWord }),
      "success",
      undefined,
      {
        label: t("admin:common.undo"),
        onClick: () =>
          showToast(t("admin:communities.support.withdrawnToast"), "info"),
      },
    );
  }

  const footer = (
    <>
      <Button variant="ghost" size="md" onClick={onClose}>
        {t("admin:communities.support.cancelCta")}
      </Button>
      <Button variant="primary" size="md" onClick={send}>
        {t("admin:communities.support.sendCta")}
      </Button>
    </>
  );

  return (
    <AdminModal
      title={
        <Translation
          i18nKey="admin:communities.support.modalTitle"
          values={{ name: firstWord ?? "" }}
          components={{ em: <em /> }}
        />
      }
      onClose={onClose}
      footer={footer}
    >
      <p className={styles.modalIntro}>
        {t("admin:communities.support.intro")}
      </p>
      <div className={styles.checkList}>
        {options.map((o, i) => (
          <AdminCheckLine
            key={o.titleKey}
            checked={checks[i]!}
            onChange={() => toggle(i)}
            title={t(o.titleKey)}
            sub={o.sub}
          />
        ))}
      </div>
      <label className={styles.noteLabel}>
        <span className={styles.noteLabelTx}>
          {t("admin:communities.support.noteLabel")}
        </span>
        <textarea
          className={styles.noteArea}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("admin:communities.support.notePlaceholder")}
        />
      </label>
    </AdminModal>
  );
}
