import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useCreateReadingGroupProposal } from "./api/useCreateReadingGroupProposal";
import type { ReadingGroupProposalFormat } from "./api/community.api";
import { type Format, type Group } from "./readingGroups.data";
import styles from "./ReadingGroupsPage.module.css";

// option value stays canonical English — it's compared (`formatField ===
// "Online"`) and sent to the API; only the visible label is translated.
const FORMAT_OPTIONS: { value: string; labelKey: string }[] = [
  {
    value: "In-person",
    labelKey: "community:readingGroups.listGroup.formatOption.inPerson",
  },
  {
    value: "Online",
    labelKey: "community:readingGroups.listGroup.formatOption.online",
  },
  {
    value: "Either",
    labelKey: "community:readingGroups.listGroup.formatOption.either",
  },
];

const MAX_PEOPLE_OPTIONS = ["4", "6", "8"];

/** The "Start your own group" panel: a real form that lists a group and shows a
 *  plum-panel success state. The new group is handed back via onListed.
 *
 *  Submits `POST /reading-groups/proposals` in live mode (see
 *  `useCreateReadingGroupProposal`); demo mode keeps the prototype's instant
 *  simulated success — either way the directory card shown here is built
 *  client-side, since the group directory itself is curated editorial content
 *  with no server-backed listing. */
export function ListGroupStrip({
  onListed,
}: {
  onListed: (group: Group) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [bookField, setBookField] = useState("");
  const [whyField, setWhyField] = useState("");
  const [formatField, setFormatField] = useState("In-person");
  const [maxField, setMaxField] = useState("6");
  const [listedGroup, setListedGroup] = useState<Group | null>(null);
  const mutation = useCreateReadingGroupProposal();

  function listGroup(e: React.FormEvent) {
    e.preventDefault();
    const book = bookField.trim();
    if (!book) return;

    mutation.mutate(
      {
        book,
        why: whyField.trim() || undefined,
        format: formatField as ReadingGroupProposalFormat,
        maxPeople: parseInt(maxField, 10),
      },
      {
        onSuccess: () => {
          // "Title — Author" → split into book + author where possible.
          const [titlePart, authorPart] = book.split(/\s+[—-]\s+/);
          const groupFormat: Format =
            formatField === "Online" ? "online" : "irl";
          const newGroup: Group = {
            id: `mine-${Date.now()}`,
            genre: "fiction",
            format: groupFormat,
            book: titlePart?.trim() || book,
            author:
              authorPart?.trim() ||
              t("community:readingGroups.listGroup.defaultAuthor"),
            spine: (titlePart?.trim() || book).charAt(0).toUpperCase(),
            spineColor: "var(--violet)",
            name: t("community:readingGroups.listGroup.defaultName"),
            description:
              whyField.trim() ||
              t("community:readingGroups.listGroup.newGroupDesc"),
            where: t(
              groupFormat === "online"
                ? "community:readingGroups.listGroup.defaultWhereOnline"
                : "community:readingGroups.listGroup.defaultWhereIrl",
            ),
            frequency: t("community:readingGroups.listGroup.defaultFrequency"),
            spots: Math.max(1, parseInt(maxField, 10) - 1),
            language: t("community:readingGroups.listGroup.defaultLang"),
          };
          onListed(newGroup);
          setListedGroup(newGroup);
          setBookField("");
          setWhyField("");
          showToast(
            t("community:readingGroups.listGroup.successToast"),
            "success",
          );
        },
        onError: () =>
          showToast(t("community:readingGroups.listGroup.errorToast"), "error"),
      },
    );
  }

  return (
    <div className={styles.startStrip}>
      <div className={styles.ssText}>
        <h3>
          <Translation
            i18nKey="community:readingGroups.listGroup.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <p>{t("community:readingGroups.listGroup.lead")}</p>
      </div>
      {listedGroup ? (
        <div className={styles.ssSuccess}>
          <span className={styles.ssSuccessIcon} aria-hidden>
            <FiCheck />
          </span>
          <div className={styles.ssSuccessTitle}>
            <Translation
              i18nKey="community:readingGroups.listGroup.successHeading"
              components={{ em: <em /> }}
            />
          </div>
          <p className={styles.ssSuccessBody}>
            <Translation
              i18nKey="community:readingGroups.listGroup.successBody"
              components={{ strong: <strong /> }}
              values={{ book: listedGroup.book }}
            />
          </p>
          <button
            type="button"
            className={styles.ssSubmit}
            onClick={() => setListedGroup(null)}
          >
            {t("community:readingGroups.listGroup.listAnotherCta")}
          </button>
        </div>
      ) : (
        <form className={styles.ssForm} onSubmit={listGroup}>
          <div className={styles.ssRow}>
            <label className={styles.ssLabel} htmlFor="ss-book">
              {t("community:readingGroups.listGroup.bookLabel")}
            </label>
            <input
              id="ss-book"
              className={styles.ssInput}
              type="text"
              autoComplete="off"
              enterKeyHint="next"
              placeholder={t(
                "community:readingGroups.listGroup.bookPlaceholder",
              )}
              value={bookField}
              onChange={(e) => setBookField(e.target.value)}
              required
            />
          </div>
          <div className={styles.ssRow}>
            <label className={styles.ssLabel} htmlFor="ss-why">
              {t("community:readingGroups.listGroup.whyLabel")}
            </label>
            <input
              id="ss-why"
              className={styles.ssInput}
              type="text"
              autoComplete="off"
              enterKeyHint="next"
              placeholder={t(
                "community:readingGroups.listGroup.whyPlaceholder",
              )}
              value={whyField}
              onChange={(e) => setWhyField(e.target.value)}
            />
          </div>
          <div className={styles.ssRow2}>
            <div className={styles.ssRow}>
              <label className={styles.ssLabel} htmlFor="ss-format">
                {t("community:readingGroups.listGroup.formatLabel")}
              </label>
              <Select
                id="ss-format"
                value={formatField}
                onChange={(value) => setFormatField(value ?? "In-person")}
                options={FORMAT_OPTIONS.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
              />
            </div>
            <div className={styles.ssRow}>
              <label className={styles.ssLabel} htmlFor="ss-max">
                {t("community:readingGroups.listGroup.maxLabel")}
              </label>
              <Select
                id="ss-max"
                value={maxField}
                onChange={(value) => setMaxField(value ?? "6")}
                options={MAX_PEOPLE_OPTIONS.map((count) => ({
                  value: count,
                  label: count,
                }))}
              />
            </div>
          </div>
          <button
            type="submit"
            className={styles.ssSubmit}
            disabled={!bookField.trim() || mutation.isPending}
          >
            {mutation.isPending
              ? t("community:readingGroups.listGroup.submitPending")
              : t("community:readingGroups.listGroup.submitCta")}
          </button>
        </form>
      )}
    </div>
  );
}
