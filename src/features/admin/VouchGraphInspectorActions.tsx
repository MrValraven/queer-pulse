import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { VouchPerson } from "./trustGraph/trustGraphModel";
import styles from "./vouchGraphInspector.module.css";

interface InspectorActionsProps {
  person: VouchPerson;
  onVerify: (id: string) => void;
  isVerifying: boolean;
  onCite: (id: string) => void;
  isExpanded: boolean;
  /** False for a member with no connections at all: there is nothing to
   *  expand, so the button stays hidden. */
  isExpandable: boolean;
  onExpand: (id: string) => void;
  onOpenModeration: (id: string) => void;
}

/** The inspector's action row, extracted so `VouchGraphInspector` itself
 *  stays under the repo's 200-line component limit. */
export function InspectorActions({
  person,
  onVerify,
  isVerifying,
  onCite,
  isExpanded,
  isExpandable,
  onExpand,
  onOpenModeration,
}: InspectorActionsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.insActions}>
      {!person.private && (
        <Button
          variant="jade"
          size="md"
          disabled={person.verified || isVerifying}
          onClick={() => onVerify(person.id)}
        >
          {person.verified
            ? t("admin:vouchGraph.inspector.verifiedCta")
            : t("admin:vouchGraph.inspector.useAsVerificationCta")}
        </Button>
      )}
      <Button variant="ghost" size="md" onClick={() => onCite(person.id)}>
        {t("admin:vouchGraph.inspector.citeCta")}
      </Button>
      {isExpandable && (
        <Button variant="ghost" size="md" onClick={() => onExpand(person.id)}>
          {isExpanded
            ? t("admin:vouchGraph.inspector.collapseCta")
            : t("admin:vouchGraph.inspector.expandCta")}
        </Button>
      )}
      <Button
        variant="ghost"
        size="md"
        onClick={() => onOpenModeration(person.id)}
      >
        {t("common:cta.openModerationQueue")}
      </Button>
    </div>
  );
}
