import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Reveal, Tabs } from "../../shared/components/ui";
import { HousingBoard } from "./HousingBoard";
import { FlatmatesBoard } from "./FlatmatesBoard";
import styles from "./HousingPage.module.css";

const TABS = [
  { id: "housing", label: "Housing" },
  { id: "flatmates", label: "Flatmates" },
];

export function HousingPage() {
  const [params, setParams] = useSearchParams();
  // Tab lives in the URL (?tab=flatmates) so the Flatmates view is deep-linkable
  // and back-button friendly; the default (no param) is the Housing board.
  const active = params.get("tab") === "flatmates" ? "flatmates" : "housing";

  const setActive = (id: string) => {
    const next = new URLSearchParams(params);
    if (id === "flatmates") next.set("tab", "flatmates");
    else next.delete("tab");
    setParams(next);
  };

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className="wrap">
          <Reveal as="div" className={styles.cat}>
            Housing Board · Lisbon
          </Reveal>
          <Reveal as="h1" delay={60}>
            Find a home — and the people to <em>share it with.</em>
          </Reveal>
          <Reveal as="p" delay={120}>
            A queer-specific housing board for Lisbon. Browse spaces to rent, or
            find a flatmate you can actually be yourself around — all within the
            community network.
          </Reveal>
          <Reveal className={styles.note} delay={160}>
            <span className={styles.noteDot} />
            Every listing and profile is posted by a verified QueerPulse member
          </Reveal>
        </div>
      </div>

      <div className={styles.tabBar}>
        <div className="wrap">
          <Tabs tabs={TABS} active={active} onChange={setActive} />
        </div>
      </div>

      {active === "flatmates" ? <FlatmatesBoard /> : <HousingBoard />}
    </PageShell>
  );
}
