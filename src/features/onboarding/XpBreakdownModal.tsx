import { routes } from "../../app/routeMap";
import { Button, Modal } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { XpBreakdownItem } from "../members/api/recognition.adapters";
import { XpSourceRow } from "./XpSourceRow";
import styles from "./GettingStartedPage.module.css";

interface XpBreakdownModalProps {
  breakdown: XpBreakdownItem[];
  onClose: () => void;
}

/**
 * The full "what earned it" list, opened from the teaser's "See full
 * breakdown" button: every XP source, earned or still open, each with its
 * own progress toward its cap (reuses `XpSourceRow`, so it looks exactly
 * like the teaser's preview, just complete). Footer links on to the Badges
 * page for the deeper badge case and dated XP ledger.
 */
export function XpBreakdownModal({ breakdown, onClose }: XpBreakdownModalProps) {
  const { t } = useTranslation();
  const sorted = [...breakdown].sort((a, b) => b.xp - a.xp);

  return (
    <Modal
      title={
        <Translation
          i18nKey="members:badges.xpBreakdown.heading"
          components={{ em: <em /> }}
        />
      }
      sub={t("members:badges.xpBreakdown.sub")}
      onClose={onClose}
      footer={
        <Button to={routes.badges} variant="primary">
          {t("auth:gettingStarted.xpSources.seeBadgesPage")}
        </Button>
      }
    >
      <ul className={styles.xpSourcesList}>
        {sorted.map((source) => (
          <XpSourceRow key={source.key} source={source} detailed />
        ))}
      </ul>
    </Modal>
  );
}
