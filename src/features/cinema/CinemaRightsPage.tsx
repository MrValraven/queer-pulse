import { Reveal } from "../../shared/components/ui";
import { CinemaShell } from "./CinemaShell";
import { RightsHero } from "./RightsHero";
import { RightsSideNav } from "./RightsSideNav";
import { RightsContractCard } from "./RightsContractCard";
import { RightsFaq } from "./RightsFaq";
import styles from "./CinemaRightsPage.module.css";

export function CinemaRightsPage() {
  return (
    <CinemaShell>
      <RightsHero />
      <section className={styles.body}>
        <div className={`wrap ${styles.bodyGrid}`}>
          <RightsSideNav />
          <div>
            <Reveal>
              <RightsContractCard />
            </Reveal>
            <RightsFaq />
          </div>
        </div>
      </section>
    </CinemaShell>
  );
}
