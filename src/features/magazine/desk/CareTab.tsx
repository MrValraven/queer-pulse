import { FiCheck, FiX } from "react-icons/fi";
import { Avatar, Badge, Button } from "../../../shared/components/ui";
import { initialsFromName } from "../../../shared/lib/initials";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PieceRecordView } from "../data/pieceRecord.data";
import { CareSubjectRow } from "./CareSubjectRow";
import styles from "./pieceTabs.module.css";

export interface CareTabProps {
  record: PieceRecordView;
  onToast: (message: string) => void;
}

/** The Care tab: the sensitivity read, per-person consent, content notes and
 *  safety flags that together drive the piece record's publish gate. */
export function CareTab({ record, onToast }: CareTabProps) {
  const { t } = useTranslation();
  const care = record.care;

  if (!care) {
    return (
      <div className={styles.stack}>
        <div className={styles.card}>
          <h3>{t("magazine:piece.care.heading")}</h3>
          <p className={styles.tiny}>
            {t("magazine:piece.care.noCareRecordYet")}
          </p>
        </div>
      </div>
    );
  }

  const read = care.read;
  const doneCount = read ? read.checks.filter((check) => check.done).length : 0;
  const totalCount = read ? read.checks.length : 0;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const readerFirstName = read ? read.reader.split(" ")[0] : "";

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <h3>{t("magazine:piece.care.sensitivityReadHeading")}</h3>
        {read ? (
          <>
            <div className={styles.readHead}>
              <Avatar
                initials={initialsFromName(read.reader)}
                tint="jade"
                size={36}
                name={read.reader}
              />
              <div>
                <b>{read.reader}</b>
                <div className={styles.tiny}>
                  {t("magazine:piece.care.readerMeta", {
                    role: read.role,
                    askedOn: read.askedOn,
                    dueOn: read.dueOn,
                  })}
                </div>
              </div>
              <Badge tone="amber" className={styles.spacer}>
                {read.status}
              </Badge>
            </div>
            <ul className={styles.ticks}>
              {read.checks.map((check) => (
                <li
                  key={check.label}
                  className={check.done ? undefined : styles.open}
                >
                  {check.done ? <FiCheck /> : <FiX />}
                  {check.label}
                </li>
              ))}
            </ul>
            <div className={styles.prog}>
              <i style={{ width: `${progressPercent}%` }} />
            </div>
            <span className={styles.tiny}>
              {t("magazine:piece.care.readProgress", {
                done: doneCount,
                total: totalCount,
                reader: readerFirstName,
              })}
            </span>
            <div className={styles.row}>
              <Button
                size="sm"
                onClick={() =>
                  onToast(
                    t("magazine:piece.care.nudgedToast", {
                      reader: read.reader,
                    }),
                  )
                }
              >
                {t("magazine:piece.care.nudgeReader")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  onToast(t("magazine:piece.care.secondReaderToast"))
                }
              >
                {t("magazine:piece.care.askSecondReader")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.tiny}>
              {t("magazine:piece.care.noReadRequestedYet")}
            </p>
            <div className={styles.row}>
              <Button
                size="sm"
                onClick={() =>
                  onToast(t("magazine:piece.care.askForReadToast"))
                }
              >
                {t("magazine:piece.care.askForRead")}
              </Button>
            </div>
          </>
        )}
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:piece.care.peopleHeading")}</h3>
        <span className={styles.tiny}>
          {t("magazine:piece.care.peopleSubline")}
        </span>
        {care.subjects.map((subject) => (
          <CareSubjectRow
            key={subject.name}
            subject={subject}
            onToast={onToast}
          />
        ))}
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:piece.care.contentNotesHeading")}</h3>
        <span className={styles.tiny}>
          {t("magazine:piece.care.contentNotesSubline")}
        </span>
        <div className={styles.chips}>
          {care.contentNotes.map((note) => (
            <Badge key={note} tone="plum">
              {note}
            </Badge>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onToast(t("magazine:piece.care.contentNoteAddedToast"))
            }
          >
            {t("magazine:piece.care.addContentNote")}
          </Button>
        </div>
      </div>

      <div className={styles.card}>
        <h3>{t("magazine:piece.care.safetyFlagsHeading")}</h3>
        {care.flags.map((flag) => (
          <div key={flag.key} className={styles.flagrow}>
            <span
              className={[
                styles.dot,
                flag.on ? styles.dotAmber : styles.dotMuted,
              ].join(" ")}
            />
            <div>
              <b>{flag.key}</b>
              <div className={styles.tiny}>{flag.note}</div>
            </div>
            <Badge tone={flag.on ? "amber" : "ghost"} className={styles.spacer}>
              {flag.on
                ? t("magazine:piece.care.flagged")
                : t("magazine:piece.care.clear")}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
