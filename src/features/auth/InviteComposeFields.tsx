import styles from "./InvitePage.module.css";

interface InviteComposeFieldsProps {
  vouch: string;
  setVouch: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
}

const optionalStyle = {
  fontWeight: 400,
  textTransform: "none" as const,
  letterSpacing: 0,
  fontSize: 11,
};

export function InviteComposeFields({
  vouch,
  setVouch,
  note,
  setNote,
}: InviteComposeFieldsProps) {
  return (
    <div className={styles.card}>
      <div className={styles.field}>
        <label>
          Why you’re inviting them <span style={optionalStyle}>(optional)</span>
        </label>
        <textarea
          maxLength={280}
          placeholder="A few words on why they belong here. They’ll read this as they join."
          value={vouch}
          onChange={(e) => setVouch(e.target.value)}
        />
        <div className={styles.charCount}>{vouch.length}/280</div>
      </div>

      <div className={styles.field}>
        <label>
          Personal note <span style={optionalStyle}>(optional)</span>
        </label>
        <textarea
          maxLength={200}
          placeholder="A line they'll see in the link preview."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className={styles.charCount}>{note.length}/200</div>
      </div>
    </div>
  );
}
