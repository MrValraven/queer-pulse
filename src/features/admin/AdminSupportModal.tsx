import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
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
  const { showToast } = useToast();
  const [checks, setChecks] = useState<boolean[]>([true, true, false, false]);
  const [note, setNote] = useState("");

  const firstWord = community.name.split(/\s+/)[0];
  const modFirsts = community.mods.map((m) => firstName(m.name)).join(" & ");

  const options: { title: string; sub: string }[] = [
    {
      title: "Message the moderators",
      sub: `A warm check-in to ${modFirsts} — how can we help?`,
    },
    {
      title: "Assign a staff buddy for 2 weeks",
      sub: "A Trust & Safety teammate co-moderates to take the load off.",
    },
    {
      title: "Share the de-escalation toolkit",
      sub: "Templates and guides for handling heated public threads.",
    },
    {
      title: "Recruit another moderator",
      sub: "Open a call for a trusted member to join the mod team.",
    },
  ];

  function toggle(i: number) {
    setChecks((prev) => prev.map((c, j) => (j === i ? !c : c)));
  }

  function send() {
    onClose();
    showToast(
      `Support sent to ${firstWord}'s moderators`,
      "success",
      undefined,
      {
        label: "Undo",
        onClick: () => showToast("Support request withdrawn", "info"),
      },
    );
  }

  const footer = (
    <>
      <Button variant="ghost" size="md" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" size="md" onClick={send}>
        Send support
      </Button>
    </>
  );

  return (
    <AdminModal
      title={
        <>
          Lend <em>{firstWord}</em> a hand
        </>
      }
      onClose={onClose}
      footer={footer}
    >
      <p className={styles.modalIntro}>
        Pick how to help. You can do more than one — the moderators will see
        exactly what you offered.
      </p>
      <div className={styles.checkList}>
        {options.map((o, i) => (
          <AdminCheckLine
            key={o.title}
            checked={checks[i]!}
            onChange={() => toggle(i)}
            title={o.title}
            sub={o.sub}
          />
        ))}
      </div>
      <label className={styles.noteLabel}>
        <span className={styles.noteLabelTx}>
          A note for the moderators (optional)
        </span>
        <textarea
          className={styles.noteArea}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="We saw the score dip — what would actually help right now?"
        />
      </label>
    </AdminModal>
  );
}
