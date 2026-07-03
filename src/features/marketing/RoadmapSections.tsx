import { useState } from "react";
import { FiArrowUp } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { DECISIONS, TOP_IDEAS, type IdeaItem } from "./roadmap.data";
import styles from "./RoadmapPage.module.css";

export function SubmitIdea() {
  const { showToast } = useToast();
  const [value, setValue] = useState("");

  function submit() {
    if (!value.trim()) {
      showToast("Write a few words first", "error");
      return;
    }
    showToast("Idea submitted — thank you", "success");
    setValue("");
  }

  return (
    <div className={styles.shapeCard}>
      <h3 className={styles.shapeHead}>Submit an idea</h3>
      <textarea
        className={styles.ideaTa}
        aria-label="Your idea"
        placeholder="What would make QueerPulse better for you?"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        variant="primary"
        onClick={submit}
        style={{ width: "100%", justifyContent: "center" }}
      >
        Submit idea
      </Button>
    </div>
  );
}

function IdeaRow({ idea }: { idea: IdeaItem }) {
  const { showToast } = useToast();
  const [voted, setVoted] = useState(false);

  function vote() {
    if (voted) return;
    setVoted(true);
    showToast("Vote recorded", "success");
  }

  return (
    <div className={styles.ideaRow}>
      <div className={styles.ideaText}>{idea.text}</div>
      <div className={styles.ideaVotes}>{idea.votes + (voted ? 1 : 0)}</div>
      <button
        type="button"
        className={`${styles.ideaVoteBtn} ${voted ? styles.voted : ""}`}
        onClick={vote}
        aria-pressed={voted}
        disabled={voted}
      >
        <FiArrowUp aria-hidden /> {voted ? "Voted" : "Vote"}
      </button>
    </div>
  );
}

export function TopIdeas() {
  return (
    <div className={styles.shapeCard}>
      <h3 className={styles.shapeHead}>Most requested ideas</h3>
      <div className={styles.topIdeas}>
        {TOP_IDEAS.map((idea) => (
          <IdeaRow key={idea.text} idea={idea} />
        ))}
      </div>
    </div>
  );
}

export function HowWeDecide() {
  return (
    <section className={styles.howSection}>
      <h2 className={styles.sectionHead} style={{ marginBottom: 20 }}>
        How we <em>decide</em>
      </h2>
      <div className={styles.howCards}>
        {DECISIONS.map((d) => (
          <div className={styles.howCard} key={d.title}>
            <span className={`${styles.hcDot} ${styles[d.tone]}`} />
            <div>
              <div className={styles.hcTitle}>{d.title}</div>
              <p className={styles.hcDesc}>{d.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
