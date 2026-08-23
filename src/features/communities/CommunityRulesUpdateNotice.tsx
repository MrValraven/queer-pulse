import { useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunityRulesList } from "./CommunityRulesList";
import { useCommunityRules } from "./api/useCommunityJoin";
import {
  useAcceptCommunityRules,
  useCommunityPreferences,
} from "./api/useCommunityPreferences";
import styles from "./CommunityRulesUpdateNotice.module.css";

/**
 * "The house rules changed": the in-page prompt an existing member gets when
 * the version they agreed to trails the community's current one (or when they
 * joined before acceptance was recorded at all).
 *
 * Deliberately gentle: it is a card in the page, never a modal, it can be put
 * off, and it blocks nothing. A member can keep reading the community with this
 * sitting above the tabs. Rules are read in place rather than by sending anyone
 * off to another tab and back.
 *
 * Whether the prompt is owed is decided server-side (`shouldReacceptRules` on
 * the preferences read), and accepting writes
 * `community_members.rules_version_accepted` through
 * `POST /communities/:slug/rules-acceptance`. So the answer is a real platform
 * record of what this member agreed to, and it stays answered on their other
 * devices.
 */
export function CommunityRulesUpdateNotice({
  slug,
  name,
  isMember,
}: {
  slug: string;
  name: string;
  /** Only members are asked to re-agree. A visitor reading the community is
   *  shown the rules on the About tab and on the way in, not nagged here. */
  isMember: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const rulesState = useCommunityRules(isMember ? slug : undefined);
  const preferences = useCommunityPreferences(slug, { enabled: isMember });
  const acceptRules = useAcceptCommunityRules(slug);
  const [isOpen, setIsOpen] = useState(false);
  const [isPutOff, setIsPutOff] = useState(false);

  const shouldPrompt =
    isMember &&
    preferences.shouldReacceptRules &&
    rulesState.hasRules &&
    !isPutOff;

  if (!shouldPrompt) return null;

  const confirm = () => {
    // The version comes from the preferences read rather than the rules read,
    // so the number sent is the one the server just said this member owes. A
    // stale number is refused server-side instead of recording consent to text
    // they never saw.
    acceptRules.mutate(preferences.rulesVersion, {
      onSuccess: () =>
        showToast(
          t("communities:detail.rulesUpdate.confirmedToast"),
          "success",
        ),
      onError: () =>
        showToast(t("communities:detail.rulesUpdate.errorToast"), "error"),
    });
  };

  return (
    <section className={styles.card} aria-labelledby={`rules-update-${slug}`}>
      <div className={styles.head}>
        <span className={styles.icon}>
          <FiBookOpen aria-hidden />
        </span>
        <div>
          <h2 className={styles.title} id={`rules-update-${slug}`}>
            {t("communities:detail.rulesUpdate.title")}
          </h2>
          <p className={styles.body}>
            {t("communities:detail.rulesUpdate.body", { name })}
          </p>
        </div>
      </div>

      {/* Always in the DOM so the disclosure button's `aria-controls` always
          points at a real element; the list itself only renders when open. */}
      <div className={styles.rules} id={`rules-update-list-${slug}`}>
        {isOpen && <CommunityRulesList rules={rulesState.rules} compact />}
      </div>

      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={`rules-update-list-${slug}`}
        >
          {isOpen ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}{" "}
          {isOpen
            ? t("communities:detail.rulesUpdate.hideCta")
            : t("communities:detail.rulesUpdate.readCta")}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={confirm}
          disabled={acceptRules.isPending}
        >
          <FiCheck aria-hidden />{" "}
          {t("communities:detail.rulesUpdate.acceptCta")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsPutOff(true)}>
          {t("communities:detail.rulesUpdate.laterCta")}
        </Button>
      </div>
    </section>
  );
}
