import { SearchInput } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminAvatar } from "./ui";
import { useTrustNetworkMemberSearch } from "./api/useTrustNetwork";
import styles from "./AdminVouchGraph.module.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Jump the graph's focus to this member's slug (ADM-10). */
  onPick: (slug: string) => void;
}

/**
 * "Find a member" search box for the trust network graph (ADM-10) — lets an
 * admin reach a specific member even when the graph's node cap has pushed
 * them out of view (older accounts are exactly the ones worth auditing for
 * slow-burn abuse). Distinct from the header's in-canvas search: that one
 * only highlights matches already on screen, this one queries every member
 * and can bring someone new into the graph. Mirrors `AdminMediaUploaderPicker`'s
 * debounce + search-and-pick shape.
 */
export function TrustNetworkMemberFinder({ value, onChange, onPick }: Props) {
  const { t } = useTranslation();
  const debouncedValue = useDebouncedValue(value, 300);
  const { results, isFetching } = useTrustNetworkMemberSearch(debouncedValue);
  const showResults = debouncedValue.trim().length >= 2;

  return (
    <div className={styles.memberFinder}>
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder={t("admin:vouchGraph.memberFinder.placeholder")}
        ariaLabel={t("admin:vouchGraph.memberFinder.ariaLabel")}
        className={styles.memberFinderInput}
      />
      {showResults && (
        <ul className={styles.memberFinderResults}>
          {results.length === 0 && !isFetching ? (
            <li className={styles.memberFinderEmpty}>
              {t("admin:vouchGraph.memberFinder.empty")}
            </li>
          ) : (
            results.map((person) => (
              <li key={person.slug}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(person.slug);
                    onChange("");
                  }}
                >
                  <AdminAvatar
                    initials={person.initials}
                    src={person.avatarUrl ?? undefined}
                    tone="plum"
                    size="sm"
                  />
                  <span className={styles.memberFinderResultText}>
                    <span>{person.name}</span>
                    <span className={styles.memberFinderResultHandle}>
                      @{person.slug}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
