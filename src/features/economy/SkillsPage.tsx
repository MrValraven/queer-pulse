import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { FiHeart } from "react-icons/fi";
import { Button, EmptyState, Outro } from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useWorkshops } from "../../app/providers/WorkshopsProvider";
import { SKILLS, SKILL_FILTERS } from "./skills.data";
import { SkillSkeleton } from "./SkillCard";
import { SkillsSection } from "./SkillsSection";
import { WorkshopsSection } from "./WorkshopsSection";
import { AddWorkshopModal } from "./AddWorkshopModal";
import styles from "./SkillsPage.module.css";

export function SkillsPage() {
  const { demoMode } = useDemoMode();
  const { workshops } = useWorkshops();
  const loading = useSimulatedLoad();
  const [active, setActive] = useState("all");
  const [listingWorkshop, setListingWorkshop] = useState(false);

  // The skills board has no live backend yet, so members' offers and asks only
  // exist in demo mode ("Populate platform"). Live mode shows an empty board
  // rather than mock members' skills. Workshops are gated in WorkshopsProvider.
  const source = useMemo(() => (demoMode ? SKILLS : []), [demoMode]);
  const filtered = useMemo(
    () =>
      active === "all"
        ? source
        : source.filter((skill) => skill.cat === active),
    [source, active],
  );
  const offering = filtered.filter((skill) => skill.type === "offering");
  const looking = filtered.filter((skill) => skill.type === "looking");

  // Nothing has been shared yet at all — the filters have nothing to act on, so
  // hide them and let one empty state carry the calls to action.
  const boardEmpty = source.length === 0 && workshops.length === 0;

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className="wrap">
          <div className={styles.cat}>Skills &amp; learning</div>
          <h1>
            Learn from your <em>community.</em>
          </h1>
          <p>
            No course fees, no algorithms, no performative expertise. Just
            members who are good at things and willing to share what they know —
            and members who want to get better.
          </p>
        </div>
      </header>

      {!boardEmpty && (
        <div className={styles.filterBar}>
          <div className="wrap">
            <div className={styles.filterInner}>
              <span className={styles.filterLabel}>Browse by:</span>
              {SKILL_FILTERS.map((filter) => (
                <button
                  type="button"
                  key={filter.value}
                  className={[
                    styles.pill,
                    active === filter.value && styles.pillOn,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setActive(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className="wrap">
          {!boardEmpty && (
            <p className={styles.intro}>
              Everything here is offered and requested by members. If you want
              to learn something, post an Ask on the board. If you want to teach
              something, post an Offer.
            </p>
          )}

          {loading ? (
            <div className={styles.section}>
              <div className={styles.cards}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkillSkeleton key={index} />
                ))}
              </div>
            </div>
          ) : boardEmpty ? (
            <EmptyState
              className={styles.empty}
              icon={<FiHeart />}
              title="No one's shared a skill here yet"
              description="When members offer to teach what they're good at — or ask to learn something new — it'll show up here. Be the first: list a workshop, or post what you can teach on the board."
              action={{
                label: "List a workshop",
                onClick: () => setListingWorkshop(true),
              }}
              secondaryAction={{ label: "Post on the board", href: "/#board" }}
            />
          ) : (
            <>
              {workshops.length > 0 && (
                <div className={styles.section}>
                  <WorkshopsSection active={active} />
                </div>
              )}

              {(offering.length > 0 ||
                (source.length > 0 && active !== "all")) && (
                <SkillsSection
                  title={
                    <>
                      Members <em>offering</em> to teach
                    </>
                  }
                  dotColor="var(--jade)"
                  skills={offering}
                  emptyDescription="No one's offered to teach in this category yet. Clear the filter to see everything members are sharing."
                  onClearFilters={() => setActive("all")}
                />
              )}

              {(looking.length > 0 ||
                (source.length > 0 && active !== "all")) && (
                <SkillsSection
                  title={
                    <>
                      Members <em>wanting</em> to learn
                    </>
                  }
                  dotColor="var(--accent)"
                  skills={looking}
                  emptyDescription="No one's asked to learn in this category yet. Clear the filter to see what the rest of the community is hoping to pick up."
                  onClearFilters={() => setActive("all")}
                />
              )}
            </>
          )}

          <div className={styles.offerStrip}>
            <div>
              <h3>
                Have something <em>to teach?</em>
              </h3>
              <p>
                Post a skill offer on the board — what you can teach, how, and
                who it's for. The community will find you.
              </p>
            </div>
            <Button href="/#board" size="lg">
              Post on the board
            </Button>
          </div>
        </div>
      </div>

      <Outro
        title={
          <>
            The best way to get better is to{" "}
            <em>know someone further along.</em>
          </>
        }
        sub="Join the network and find the people who can help you grow — and the people you can help in return."
      >
        <Button to={routes.requestInvite} variant="primary" size="lg">
          Request an invite
        </Button>
      </Outro>

      {listingWorkshop && (
        <AddWorkshopModal onClose={() => setListingWorkshop(false)} />
      )}
    </PageShell>
  );
}
