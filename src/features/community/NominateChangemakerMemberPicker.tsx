import { useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  Avatar,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import {
  useStrangerMemberSearch,
  type StrangerMemberResult,
} from "../messages/api/useStrangerMemberSearch";
import styles from "./ChangemakersPage.module.css";

/** How many matches the panel shows at once. The nomination card is a narrow
 *  column beside the pitch, so a long list would push the reason field and the
 *  button off the fold while someone is still typing a name. */
const MAX_RESULTS = 5;

/** Stable empty set — a fresh `new Set()` each render would re-run the list's
 *  selection work for nothing. Picking collapses this whole block into the
 *  chip above, so the list never renders with a selection of its own. */
const EMPTY_SELECTION = new Set<string>();

interface NominateChangemakerMemberPickerProps {
  picked: StrangerMemberResult | null;
  onPick: (member: StrangerMemberResult | null) => void;
}

/**
 * The optional "are they already on QueerPulse?" step of the nomination form.
 *
 * Picking someone here links the nomination to a real profile, so the
 * moderator triaging it can open the person's page instead of guessing which
 * Ana the nominator meant. Most nominees are not members, which is the whole
 * point of the form, so this stays optional and silent when it finds nothing.
 *
 * Search runs through `useStrangerMemberSearch`, the same hook behind
 * "message a stranger": it hits `GET /search?type=member` live and filters the
 * mock corpus in demo mode, so this component never reads the mock registry
 * itself. The rows are the shared `MemberSelectList` in single-select mode,
 * the same pairing the co-manager invite panel uses. The signed-in member is
 * excluded from the results, since nominating yourself is rejected by the
 * server and should not be offered in the first place.
 */
export function NominateChangemakerMemberPicker({
  picked,
  onPick,
}: NominateChangemakerMemberPickerProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const [query, setQuery] = useState("");

  const viewerSlug = demoMode ? undefined : user?.profile.slug;
  const excludeSlugs = useMemo(
    () => new Set(viewerSlug ? [viewerSlug] : []),
    [viewerSlug],
  );
  const { results, loading } = useStrangerMemberSearch(query, excludeSlugs);

  const people = useMemo<MemberSelectPerson[]>(
    () =>
      results.slice(0, MAX_RESULTS).map((result) => ({
        slug: result.slug,
        name: result.name,
        avatarUrl: result.avatarUrl,
        pronouns: result.sub,
      })),
    [results],
  );

  if (picked) {
    return (
      <div className={styles.nomPicker}>
        <span className={styles.nomPickerLabel}>
          {t("community:changemakers.nominate.memberLabel")}
        </span>
        <div className={styles.nomPicked}>
          <Avatar
            initials={picked.initials}
            tint={picked.tint}
            src={picked.avatarUrl}
            size={34}
          />
          <span className={styles.nomPickedInfo}>
            <span className={styles.nomPickedName}>{picked.name}</span>
            <span className={styles.nomPickedSlug}>@{picked.slug}</span>
          </span>
          <button
            type="button"
            className={styles.nomPickedClear}
            aria-label={t("community:changemakers.nominate.memberClearAria", {
              name: picked.name,
            })}
            onClick={() => {
              onPick(null);
              setQuery("");
            }}
          >
            <FiX aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.nomPicker}>
      <span className={styles.nomPickerLabel}>
        {t("community:changemakers.nominate.memberLabel")}
      </span>
      <MemberSelectList
        people={people}
        selected={EMPTY_SELECTION}
        onToggle={(slug) => {
          const member = results.find((result) => result.slug === slug);
          if (member) onPick(member);
        }}
        multiSelect={false}
        searchQuery={query}
        onSearchChange={setQuery}
        isSearching={loading}
        searchPlaceholder={t(
          "community:changemakers.nominate.memberPlaceholder",
        )}
        searchAriaLabel={t("community:changemakers.nominate.memberSearchAria")}
      />
      <p className={styles.nomPickerHelper}>
        {t("community:changemakers.nominate.memberHelper")}
      </p>
    </div>
  );
}
