import { Link } from "react-router-dom";
import { FiBookOpen } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { MagazineMasthead } from "./MagazineMasthead";
import styles from "./StoryPage.module.css";
import { memberName } from "../members/data/members";
import { StoryArticle } from "./StoryArticle";

const PROFILE = routes.members;
const STORY = routes.story;
const INVITE = routes.requestInvite;

export function StoryPage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  // The article below is fabricated editorial content by mock personas. Live
  // mode has no published story yet, so it shows the same honest "coming soon"
  // the magazine front uses — the demo mock stays the demo-mode branch.
  if (!demoMode) {
    return (
      <PageShell>
        <MagazineMasthead active="stories" />
        <div className="wrap">
          <EmptyState
            icon={<FiBookOpen />}
            title={t("magazine:sections.emptyLive.title")}
            description={t("magazine:sections.emptyLive.description")}
            action={{
              label: t("magazine:sections.submit.cta"),
              to: routes.submitStory,
            }}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <MagazineMasthead active="stories" />
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroLabel}>
          <div className="wrap">
            {/* Content: category tag, headline, read time and date are this
                piece's own editorial fields — kept in English. */}
            <div className={styles.cat}>Field Notes</div>
            <h1>
              How a Príncipe Real studio became a quiet home for{" "}
              <em>queer designers</em>
            </h1>
            <div className={styles.heroByline}>
              <span className={styles.bylineAv}>IT</span>
              <span>
                {t("magazine:story.wordsBy")}{" "}
                <Link to={PROFILE}>{memberName("ines")}</Link>
              </span>
              <span className={styles.bDot} />
              <span>6 min read</span>
              <span className={styles.bDot} />
              <span>June 2026</span>
            </div>
          </div>
        </div>
      </div>

      <StoryArticle
        profilePath={PROFILE}
        storyPath={STORY}
        invitePath={INVITE}
      />
    </PageShell>
  );
}
