import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useCreateReadingGroupProposal } from "./api/useCreateReadingGroupProposal";
import type { ReadingGroupProposalFormat } from "./api/community.api";
import { type Format, type Group } from "./readingGroups.data";
import styles from "./ReadingGroupsPage.module.css";

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
            author: authorPart?.trim() || "You",
            spine: (titlePart?.trim() || book).charAt(0).toUpperCase(),
            spineColor: "var(--violet)",
            name: "Your new group",
            desc:
              whyField.trim() ||
              "A new reading group, just listed. Members will be matched soon.",
            where: groupFormat === "online" ? "Online" : "Lisbon (TBC)",
            frequency: "Monthly",
            spots: Math.max(1, parseInt(maxField, 10) - 1),
            lang: "EN / PT",
          };
          onListed(newGroup);
          setListedGroup(newGroup);
          setBookField("");
          setWhyField("");
          showToast("Group listed — we'll find your readers", "success");
        },
        onError: () =>
          showToast("Couldn't list your group — please try again.", "error"),
      },
    );
  }

  return (
    <div className={styles.startStrip}>
      <div className={styles.ssText}>
        <h3>
          Start your <em>own group.</em>
        </h3>
        <p>
          Pick a book. Say how many people you want. Say where and when. We will
          list it here and match you with members who want to read the same
          thing.
        </p>
      </div>
      {listedGroup ? (
        <div className={styles.ssSuccess}>
          <span className={styles.ssSuccessIcon} aria-hidden>
            <FiCheck />
          </span>
          <div className={styles.ssSuccessTitle}>
            Your group is <em>listed.</em>
          </div>
          <p className={styles.ssSuccessBody}>
            <strong>{listedGroup.book}</strong> is live at the top of the
            directory. We'll start matching you with members who want to read
            the same thing.
          </p>
          <button
            type="button"
            className={styles.ssSubmit}
            onClick={() => setListedGroup(null)}
          >
            List another group
          </button>
        </div>
      ) : (
        <form className={styles.ssForm} onSubmit={listGroup}>
          <div className={styles.ssRow}>
            <label className={styles.ssLabel} htmlFor="ss-book">
              Book title &amp; author
            </label>
            <input
              id="ss-book"
              className={styles.ssInput}
              type="text"
              placeholder="e.g. Giovanni's Room — James Baldwin"
              value={bookField}
              onChange={(e) => setBookField(e.target.value)}
              required
            />
          </div>
          <div className={styles.ssRow}>
            <label className={styles.ssLabel} htmlFor="ss-why">
              Why this book?
            </label>
            <input
              id="ss-why"
              className={styles.ssInput}
              type="text"
              placeholder="One sentence — what made you choose it?"
              value={whyField}
              onChange={(e) => setWhyField(e.target.value)}
            />
          </div>
          <div className={styles.ssRow2}>
            <div className={styles.ssRow}>
              <label className={styles.ssLabel} htmlFor="ss-format">
                Format
              </label>
              <select
                id="ss-format"
                className={styles.ssInput}
                value={formatField}
                onChange={(e) => setFormatField(e.target.value)}
              >
                <option>In-person</option>
                <option>Online</option>
                <option>Either</option>
              </select>
            </div>
            <div className={styles.ssRow}>
              <label className={styles.ssLabel} htmlFor="ss-max">
                Max people
              </label>
              <select
                id="ss-max"
                className={styles.ssInput}
                value={maxField}
                onChange={(e) => setMaxField(e.target.value)}
              >
                <option>4</option>
                <option>6</option>
                <option>8</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className={styles.ssSubmit}
            disabled={!bookField.trim() || mutation.isPending}
          >
            {mutation.isPending ? "Listing…" : "List my group"}
          </button>
        </form>
      )}
    </div>
  );
}
