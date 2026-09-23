import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import styles from "./ReadingGroupsPage.module.css";

/** The plum-panel confirmation. Demo says the group is listed, because the
 *  prototype really does put a card at the top of the directory. Live says the
 *  proposal was received, because that is all the API stored. */
export function ListGroupSuccess({
  name,
  isDemo,
  onReset,
}: {
  /** The group's name, or its first book when the member left it blank. */
  name: string;
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
          values={{ name }}
        />
      </p>
      <Button variant="ghost-dark" onClick={onReset}>
        {t(`${prefix}${isDemo ? "listAnotherCta" : "proposeAnotherCta"}`)}
      </Button>
    </div>
  );
}
