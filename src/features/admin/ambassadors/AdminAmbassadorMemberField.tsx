import { useId, useMemo, useState } from "react";
import { FiX } from "react-icons/fi";
import {
  MemberIdentity,
  MemberSelectList,
  type MemberSelectPerson,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useStrangerMemberSearch,
  type StrangerMemberResult,
} from "../../messages/api/useStrangerMemberSearch";
import styles from "./AdminAmbassadorsPage.module.css";

const MAX_RESULTS = 5;
/** Stable empty selection: picking collapses the list into the chip. */
const EMPTY_SELECTION = new Set<string>();

/**
 * The grant form's required "who" field: a labelled member search that
 * collapses into a clearable chip once someone is picked, reusing the
 * nomination picker's `useStrangerMemberSearch` + single-select
 * `MemberSelectList`.
 *
 * The visible label sits outside `MemberSelectList`/`SearchInput`, neither of
 * which exposes an id to wire a native `<label htmlFor>` onto, so the pair
 * uses `role="group"` + `aria-labelledby` instead, the standard technique for
 * labelling a control that a shared component doesn't hand out an id for.
 */
export function AdminAmbassadorMemberField({
  picked,
  onPick,
}: {
  picked: StrangerMemberResult | null;
  onPick: (member: StrangerMemberResult | null) => void;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const [query, setQuery] = useState("");
  const { results, loading } = useStrangerMemberSearch(query, EMPTY_SELECTION);
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

  return (
    <div className={styles.pickerField}>
      <span id={labelId} className={styles.fieldCaption}>
        {t("admin:ambassadors.grant.memberLabel")}{" "}
        <span className={styles.req} aria-hidden>
          *
        </span>
      </span>
      <div role="group" aria-labelledby={labelId}>
        {picked ? (
          <div className={styles.picked}>
            <MemberIdentity
              person={picked}
              secondary={`@${picked.slug}`}
              size={34}
            />
            <button
              type="button"
              className={styles.pickedClear}
              aria-label={t("admin:ambassadors.grant.clearMemberAria", {
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
        ) : (
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
            searchPlaceholder={t("admin:ambassadors.grant.memberPlaceholder")}
            searchAriaLabel={t("admin:ambassadors.grant.memberSearchAria")}
          />
        )}
      </div>
    </div>
  );
}
