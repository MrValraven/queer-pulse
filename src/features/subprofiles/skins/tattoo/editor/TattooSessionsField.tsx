import { useEffect, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import {
  Button,
  Collapse,
  CollapseListItem,
  DatePicker,
  FormField,
} from "../../../../../shared/components/ui";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import type { SubprofileItemView } from "../../../api/subprofiles.adapters";
import type { TattooSession } from "../../../api/subprofiles.api";
import { ImageUploadField } from "../../../ImageUploadField";
import { usePositionalRowKeys } from "../../../usePositionalRowKeys";
import { TATTOO_LIMITS } from "../tattooVocab.data";
import { withImagesChanged } from "./tattooItemDraft";
import styles from "./TattooSessionsField.module.css";

/** The in-progress sessions of one piece: a photo, a day and a note each. */
export function TattooSessionsField({
  draft,
  onPatch,
}: {
  draft: SubprofileItemView;
  onPatch: (patch: Partial<SubprofileItemView>) => void;
}) {
  const { t } = useTranslation();
  const sessions = draft.structured?.sessions ?? [];
  const rowKeys = usePositionalRowKeys(sessions.length);
  const isFull = sessions.length >= TATTOO_LIMITS.sessionsMax;

  const fieldRef = useRef<HTMLDivElement>(null);
  const fullLineRef = useRef<HTMLParagraphElement>(null);
  const wasFullRef = useRef(isFull);
  const shouldFocusAddRef = useRef(false);
  useEffect(() => {
    if (isFull && !wasFullRef.current) fullLineRef.current?.focus();
    if (!isFull && shouldFocusAddRef.current) {
      shouldFocusAddRef.current = false;
      fieldRef.current
        ?.querySelector<HTMLElement>("[data-session-add]")
        ?.focus();
    }
    wasFullRef.current = isFull;
  }, [isFull]);

  function writeSessions(nextSessions: TattooSession[]) {
    onPatch(
      withImagesChanged(draft, {
        structured: { ...(draft.structured ?? {}), sessions: nextSessions },
      }),
    );
  }

  function patchSession(index: number, patch: Partial<TattooSession>) {
    writeSessions(
      sessions.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, ...patch } : session,
      ),
    );
  }

  function addSession() {
    rowKeys.insertAt(sessions.length);
    writeSessions([...sessions, { imageUrl: "", date: "", note: "" }]);
  }

  function removeSession(index: number) {
    const nextTarget =
      fieldRef.current?.querySelector<HTMLElement>(
        `[data-session-remove="${index + 1}"]`,
      ) ?? fieldRef.current?.querySelector<HTMLElement>("[data-session-add]");
    if (nextTarget) nextTarget.focus();
    else shouldFocusAddRef.current = true;
    rowKeys.removeAt(index);
    writeSessions(
      sessions.filter((_session, sessionIndex) => sessionIndex !== index),
    );
  }

  return (
    <div className={styles.field} ref={fieldRef}>
      <p className={styles.label}>
        {t("subprofiles:tattooItem.sessions.label")}
      </p>
      <ul className={styles.list}>
        <AnimatePresence initial={false}>
          {sessions.map((session, index) => (
            <CollapseListItem key={rowKeys.keys[index]}>
              <div
                className={styles.row}
                role="group"
                aria-labelledby={`${rowKeys.keys[index]}-title`}
              >
                <div className={styles.rowHead}>
                  <p
                    id={`${rowKeys.keys[index]}-title`}
                    className={styles.rowTitle}
                  >
                    {t("subprofiles:tattooItem.sessions.number", {
                      number: index + 1,
                    })}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-session-remove={index}
                    aria-label={t(
                      "subprofiles:tattooItem.sessions.removeNumbered",
                      { number: index + 1 },
                    )}
                    onClick={() => removeSession(index)}
                  >
                    <FiTrash2 aria-hidden="true" />
                    {t("subprofiles:tattooItem.sessions.remove")}
                  </Button>
                </div>
                <ImageUploadField
                  value={session.imageUrl}
                  kind="work-image"
                  onChange={(imageUrl) => patchSession(index, { imageUrl })}
                />
                <FormField label={t("subprofiles:tattooItem.sessions.date")}>
                  <DatePicker
                    mode="date"
                    className={styles.sessionDate}
                    label={t("subprofiles:tattooItem.sessions.date")}
                    value={session.date || null}
                    onChange={(picked) =>
                      patchSession(index, { date: picked ?? "" })
                    }
                  />
                </FormField>
                <FormField label={t("subprofiles:tattooItem.sessions.note")}>
                  <input
                    className={styles.note}
                    value={session.note ?? ""}
                    maxLength={TATTOO_LIMITS.sessionNoteMax}
                    placeholder={t(
                      "subprofiles:tattooItem.sessions.notePlaceholder",
                    )}
                    onChange={(event) =>
                      patchSession(index, { note: event.target.value })
                    }
                  />
                </FormField>
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={!isFull}>
        <Button variant="soft" data-session-add onClick={addSession}>
          <FiPlus aria-hidden="true" />
          {t("subprofiles:tattooItem.sessions.add")}
        </Button>
      </Collapse>
      <Collapse isOpen={isFull}>
        <p className={styles.full} tabIndex={-1} ref={fullLineRef}>
          {t("subprofiles:tattooItem.sessions.full")}
        </p>
      </Collapse>
    </div>
  );
}
