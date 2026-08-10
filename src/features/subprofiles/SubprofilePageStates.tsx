import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileNotFoundArt } from "./SubprofileNotFoundArt";
import { PAGE_STATE_COPY, type PersonaPageState } from "./subprofilePageStates.data";
import styles from "./SubprofilePageStates.module.css";

/**
 * The persona page's four "can't show you this" walls — not-found / private /
 * members-only / removed — sharing the site's standard big `EmptyState` wall
 * (icon + title + description + primary/secondary action), the same shape
 * `SubprofilePage` already used for its lone not-found case. `not-found`
 * keeps the existing `SubprofileNotFoundArt` illustration in place of a small
 * icon; the other three render their `Fi*` icon in a small tinted frame.
 *
 * Only `state="not-found"` is ever passed today — see
 * `subprofilePageStates.data.ts` for why the other three can't yet be told
 * apart by the data layer. They're still fully implemented here so wiring
 * them in later is a one-line change at the call site, not new component work.
 */
export function SubprofilePageStates({ state }: { state: PersonaPageState }) {
  const { t } = useTranslation();
  const copy = PAGE_STATE_COPY[state];
  const Icon = copy.icon;

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      {state === "not-found" ? (
        <SubprofileNotFoundArt />
      ) : (
        Icon && (
          <span className={styles.icon} aria-hidden>
            <Icon size={26} />
          </span>
        )
      )}
      <EmptyState
        className={styles.empty}
        title={t(copy.titleKey)}
        description={t(copy.descriptionKey)}
        action={{ label: t(copy.actionLabelKey), to: copy.actionTo }}
        secondaryAction={
          copy.secondaryActionTo && copy.secondaryActionLabelKey
            ? { label: t(copy.secondaryActionLabelKey), to: copy.secondaryActionTo }
            : undefined
        }
      />
    </div>
  );
}
