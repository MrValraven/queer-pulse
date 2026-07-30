import { useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { IdeaItem } from "./roadmap.data";
import {
  useMyRoadmapVotes,
  useRoadmapVote,
  useSubmitRoadmapIdea,
} from "./api/useRoadmapMutations";
import styles from "./RoadmapPage.module.css";

const DECISION_KEYS = [
  {
    tone: "jade" as const,
    titleKey: "marketing:roadmap.howWeDecide.memberVotes.title",
    descKey: "marketing:roadmap.howWeDecide.memberVotes.desc",
  },
  {
    tone: "accent" as const,
    titleKey: "marketing:roadmap.howWeDecide.safetyFirst.title",
    descKey: "marketing:roadmap.howWeDecide.safetyFirst.desc",
  },
  {
    tone: "plum" as const,
    titleKey: "marketing:roadmap.howWeDecide.smallTeam.title",
    descKey: "marketing:roadmap.howWeDecide.smallTeam.desc",
  },
];

export function SubmitIdea() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { submit: submitIdea } = useSubmitRoadmapIdea();
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim()) {
      showToast(t("marketing:roadmap.submitIdea.toast.empty"), "error");
      return;
    }
    submitIdea(value.trim(), {
      onSuccess: () => {
        showToast(t("marketing:roadmap.submitIdea.toast.submitted"), "success");
        setValue("");
      },
      onError: () => {
        showToast(t("marketing:roadmap.submitIdea.toast.error"), "error");
      },
    });
  }

  return (
    <div className={styles.shapeCard}>
      <h3 className={styles.shapeHead}>
        {t("marketing:roadmap.submitIdea.title")}
      </h3>
      <textarea
        className={styles.ideaTa}
        aria-label={t("marketing:roadmap.submitIdea.ariaLabel")}
        placeholder={t("marketing:roadmap.submitIdea.placeholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        variant="primary"
        onClick={submit}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {t("marketing:roadmap.submitIdea.cta")}
      </Button>
    </div>
  );
}

export interface TopIdeasProps {
  /** Live/demo-resolved ideas from `useRoadmap()`. `RoadmapPage` is the only
   *  caller and always supplies this from the hook. */
  ideas: IdeaItem[];
}

function IdeaRow({ idea }: { idea: IdeaItem }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const myVotes = useMyRoadmapVotes();
  const { demoMode, vote: castVote } = useRoadmapVote();
  const [justVoted, setJustVoted] = useState(false);

  const voted = justVoted || myVotes.has(idea.id);

  function vote() {
    if (voted) return;
    setJustVoted(true);
    if (demoMode) {
      showToast(t("marketing:roadmap.topIdeas.toast.voted"), "success");
      return;
    }
    castVote(
      { targetType: "idea", targetId: idea.id },
      // Roll back the optimistic "voted" state on failure so the button
      // re-enables and the member can retry (the global error toast already
      // fires since this mutation doesn't set meta.silentError).
      { onError: () => setJustVoted(false) },
    );
    showToast(t("marketing:roadmap.topIdeas.toast.voted"), "success");
  }

  return (
    <div className={styles.ideaRow}>
      <div className={styles.ideaText}>{idea.text}</div>
      <div className={styles.ideaVotes}>
        {idea.votes + (demoMode && justVoted ? 1 : 0)}
      </div>
      <button
        type="button"
        className={`${styles.ideaVoteBtn} ${voted ? styles.voted : ""}`}
        onClick={vote}
        aria-pressed={voted}
        disabled={voted}
      >
        <FiArrowUp aria-hidden />{" "}
        {voted
          ? t("marketing:roadmap.topIdeas.voted")
          : t("marketing:roadmap.topIdeas.vote")}
      </button>
    </div>
  );
}

export function TopIdeas({ ideas }: TopIdeasProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.shapeCard}>
      <h3 className={styles.shapeHead}>
        {t("marketing:roadmap.topIdeas.title")}
      </h3>
      <div className={styles.topIdeas}>
        {ideas.map((idea) => (
          <IdeaRow key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}

export function HowWeDecide() {
  const { t } = useTranslation();
  return (
    <section className={styles.howSection}>
      <h2 className={styles.sectionHead} style={{ marginBottom: 20 }}>
        <Translation
          i18nKey="marketing:roadmap.howWeDecide.title"
          components={{ em: <em /> }}
        />
      </h2>
      <div className={styles.howCards}>
        {DECISION_KEYS.map((d) => (
          <div className={styles.howCard} key={d.titleKey}>
            <span className={`${styles.hcDot} ${styles[d.tone]}`} />
            <div>
              <div className={styles.hcTitle}>{t(d.titleKey)}</div>
              <p className={styles.hcDesc}>{t(d.descKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
