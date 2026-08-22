import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
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

/** Build the prototype's instant directory card. Demo mode only: `where`,
 *  `frequency`, `spots` and `language` are invented here, so a live proposal
 *  must never be rendered through this (the server stores a proposal for
 *  review and knows none of those facts). */
function buildDemoGroup(
  book: string,
  whyField: string,
  formatField: string,
  maxField: string,
  t: (key: string) => string,
): Group {
  // "Title — Author" → split into book + author where possible.
  const [titlePart, authorPart] = book.split(/\s+[—-]\s+/);
  const groupFormat: Format = formatField === "Online" ? "online" : "irl";
  return {
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
      whyField.trim() || t("community:readingGroups.listGroup.newGroupDesc"),
    where: t(
      groupFormat === "online"
        ? "community:readingGroups.listGroup.defaultWhereOnline"
        : "community:readingGroups.listGroup.defaultWhereIrl",
    ),
    frequency: t("community:readingGroups.listGroup.defaultFrequency"),
    spots: Math.max(1, parseInt(maxField, 10) - 1),
    language: t("community:readingGroups.listGroup.defaultLang"),
  };
}

/** The plum-panel confirmation. Demo says the group is listed, because the
 *  prototype really does put a card at the top of the directory. Live says the
 *  proposal was received, because that is all the API stored. */
function ListGroupSuccess({
  book,
  isDemo,
  onReset,
}: {
  book: string;
  isDemo: boolean;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const prefix = "community:readingGroups.listGroup.";
  return (
    <div className={styles.ssSuccess}>
      <span className={styles.ssSuccessIcon} aria-hidden>
        <FiCheck />
      </span>
      <div className={styles.ssSuccessTitle}>
        <Translation
          i18nKey={`${prefix}${isDemo ? "successHeading" : "proposalHeading"}`}
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.ssSuccessBody}>
        <Translation
          i18nKey={`${prefix}${isDemo ? "successBody" : "proposalBody"}`}
          components={{ strong: <strong /> }}
          values={{ book }}
        />
      </p>
      <Button variant="ghost-dark" onClick={onReset}>
        {t(`${prefix}${isDemo ? "listAnotherCta" : "proposeAnotherCta"}`)}
      </Button>
    </div>
  );
}

/** The "Start your own group" panel: a real form with a plum-panel success
 *  state.
 *
 *  Submits `POST /reading-groups/proposals` in live mode (see
 *  `useCreateReadingGroupProposal`), where the backend stores a proposal for
 *  review and nothing appears in the directory — so live neither calls
 *  `onListed` nor claims the group is live. Demo mode keeps the prototype's
 *  instant simulated listing and hands the new card back via `onListed`. */
export function ListGroupStrip({
  onListed,
}: {
  onListed: (group: Group) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [bookField, setBookField] = useState("");
  const [whyField, setWhyField] = useState("");
  const [formatField, setFormatField] = useState("In-person");
  const [maxField, setMaxField] = useState("6");
  const [submittedBook, setSubmittedBook] = useState<string | null>(null);
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
          if (demoMode) {
            onListed(buildDemoGroup(book, whyField, formatField, maxField, t));
          }
          setSubmittedBook(book);
          setBookField("");
          setWhyField("");
          showToast(
            t(
              demoMode
                ? "community:readingGroups.listGroup.successToast"
                : "community:readingGroups.listGroup.proposalToast",
            ),
            "success",
          );
        },
        onError: () =>
          showToast(t("community:readingGroups.listGroup.errorToast"), "error"),
      },
    );
  }

  // Live "lists" nothing: the API stores a proposal for review, so the label
  // says propose rather than list.
  const submitKey = mutation.isPending
    ? demoMode
      ? "submitPending"
      : "submitProposePending"
    : demoMode
      ? "submitCta"
      : "submitProposeCta";

  return (
    <div className={styles.startStrip}>
      <div className={styles.ssText}>
        <h3>
          <Translation
            i18nKey="community:readingGroups.listGroup.heading"
            components={{ em: <em /> }}
          />
        </h3>
        <p>
          {t(
            demoMode
              ? "community:readingGroups.listGroup.lead"
              : "community:readingGroups.listGroup.leadLive",
          )}
        </p>
      </div>
      {submittedBook ? (
        <ListGroupSuccess
          book={submittedBook}
          isDemo={demoMode}
          onReset={() => setSubmittedBook(null)}
        />
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
          <Button
            type="submit"
            className={styles.ssSubmit}
            disabled={!bookField.trim() || mutation.isPending}
          >
            {t(`community:readingGroups.listGroup.${submitKey}`)}
          </Button>
        </form>
      )}
    </div>
  );
}
