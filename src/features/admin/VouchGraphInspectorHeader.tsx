import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatPronouns } from "./trustGraph/pronouns";
import { TONE, type VouchPerson } from "./trustGraph/trustGraphModel";
import styles from "./vouchGraphInspector.module.css";

interface VouchGraphInspectorHeaderProps {
  person: VouchPerson;
  /** A6: the top bar already shows the focus member's pronouns, so the
   *  header repeats them only for someone else. */
  isFocus: boolean;
}

/** The inspector's identity block: avatar, name, pronouns, role and an
 *  account-kind chip for founders, staff and platform accounts. */
export function VouchGraphInspectorHeader({
  person,
  isFocus,
}: VouchGraphInspectorHeaderProps) {
  const { t } = useTranslation();
  const ink = TONE[person.tone];
  const pronouns = isFocus ? "" : formatPronouns(person.pronoun);
  // Founders, staff and platform accounts get a chip; ordinary members none.
  const hasKindChip = person.accountKind !== "member";
  const hasDetailLine = pronouns !== "" || !!person.role;

  return (
    <div className={styles.insHead}>
      <span
        className={styles.insAv}
        style={{ background: ink.fill, color: ink.stroke }}
        aria-hidden
      >
        {person.initials}
      </span>
      <div className={styles.insHeadText}>
        <h3 className={styles.insN}>{person.name}</h3>
        {hasDetailLine && (
          <div className={styles.insP}>
            {pronouns !== "" && <span className={styles.pron}>{pronouns}</span>}
            {pronouns !== "" && !!person.role && <span aria-hidden> · </span>}
            {person.role}
          </div>
        )}
        {hasKindChip && (
          <span className={styles.kindChip} data-kind={person.accountKind}>
            {t(`admin:vouchGraph.inspector.accountKind.${person.accountKind}`)}
          </span>
        )}
      </div>
    </div>
  );
}
