import { useState } from "react";
import { Button, Select } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useCreateReadingGroupProposal } from "./api/useCreateReadingGroupProposal";
import type { ReadingGroupProposalFormat } from "./api/community.api";
import type { Group } from "./readingGroups.data";
import { buildDemoGroup } from "./listGroup.demo";
import { ListGroupSuccess } from "./ListGroupSuccess";
import { ListGroupTextRow } from "./ListGroupTextRow";
import styles from "./ReadingGroupsPage.module.css";

const KEY_PREFIX = "community:readingGroups.listGroup.";

// option value stays canonical English: it's compared (`formatField ===
// "Online"`) and sent to the API; only the visible label is translated.
const FORMAT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "In-person", labelKey: `${KEY_PREFIX}formatOption.inPerson` },
  { value: "Online", labelKey: `${KEY_PREFIX}formatOption.online` },
  { value: "Either", labelKey: `${KEY_PREFIX}formatOption.either` },
];

const MAX_PEOPLE_OPTIONS = ["4", "6", "8"];

// The backend caps both the group name and the book at 200 characters.
const MAX_GROUP_NAME_LENGTH = 200;
const MAX_BOOK_LENGTH = 200;

/** The "Start your own group" panel: a real form with a plum-panel success
 *  state.
 *
 *  Submits `POST /reading-groups/proposals` in live mode (see
 *  `useCreateReadingGroupProposal`), where the backend stores a proposal for
 *  review and nothing appears in the directory, so live neither calls
 *  `onListed` nor claims the group is live. Demo mode keeps the prototype's
 *  instant simulated listing and hands the new card back via `onListed`.
 *
 *  The club name is optional. Left blank, the group is named after its first
 *  book, the way every reading group was named before clubs had names. */
export function ListGroupStrip({
  onListed,
}: {
  onListed: (group: Group) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const [clubField, setClubField] = useState("");
  const [bookField, setBookField] = useState("");
  const [whyField, setWhyField] = useState("");
  const [formatField, setFormatField] = useState("In-person");
  const [maxField, setMaxField] = useState("6");
  const [submittedName, setSubmittedName] = useState<string | null>(null);
  const mutation = useCreateReadingGroupProposal();

  function listGroup(event: React.FormEvent) {
    event.preventDefault();
    const book = bookField.trim();
    if (!book) return;
    // The success panel names the group: its typed name, else its first book.
    const displayName = clubField.trim() || book;

    mutation.mutate(
      {
        book,
        clubName: clubField.trim() || undefined,
        why: whyField.trim() || undefined,
        format: formatField as ReadingGroupProposalFormat,
        maxPeople: parseInt(maxField, 10),
      },
      {
        onSuccess: () => {
          if (demoMode) {
            onListed(
              buildDemoGroup(
                {
                  book,
                  clubName: clubField,
                  why: whyField,
                  format: formatField,
                  maxPeople: maxField,
                },
                t,
              ),
            );
          }
          setSubmittedName(displayName);
          setClubField("");
          setBookField("");
          setWhyField("");
          showToast(
            t(`${KEY_PREFIX}${demoMode ? "successToast" : "proposalToast"}`),
            "success",
          );
        },
        onError: () => showToast(t(`${KEY_PREFIX}errorToast`), "error"),
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
            i18nKey={`${KEY_PREFIX}heading`}
            components={{ em: <em /> }}
          />
        </h3>
        <p>{t(`${KEY_PREFIX}${demoMode ? "lead" : "leadLive"}`)}</p>
      </div>
      {submittedName ? (
        <ListGroupSuccess
          name={submittedName}
          isDemo={demoMode}
          onReset={() => setSubmittedName(null)}
        />
      ) : (
        <form className={styles.ssForm} onSubmit={listGroup}>
          <ListGroupTextRow
            id="ss-club"
            label={t(`${KEY_PREFIX}clubLabel`)}
            placeholder={t(`${KEY_PREFIX}clubPlaceholder`)}
            value={clubField}
            onChange={setClubField}
            maxLength={MAX_GROUP_NAME_LENGTH}
            isOptional
          />
          <ListGroupTextRow
            id="ss-book"
            label={t(`${KEY_PREFIX}bookLabel`)}
            placeholder={t(`${KEY_PREFIX}bookPlaceholder`)}
            value={bookField}
            onChange={setBookField}
            maxLength={MAX_BOOK_LENGTH}
            isRequired
          />
          <ListGroupTextRow
            id="ss-why"
            label={t(`${KEY_PREFIX}whyLabel`)}
            placeholder={t(`${KEY_PREFIX}whyPlaceholder`)}
            value={whyField}
            onChange={setWhyField}
            isOptional
          />
          <div className={styles.ssRow2}>
            <div className={styles.ssRow}>
              <label className={styles.ssLabel} htmlFor="ss-format">
                {t(`${KEY_PREFIX}formatLabel`)}
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
                {t(`${KEY_PREFIX}maxLabel`)}
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
            {t(`${KEY_PREFIX}${submitKey}`)}
          </Button>
        </form>
      )}
    </div>
  );
}
