import { useEffect, useState } from "react";
import { navItems } from "./cinemaRights.data";
import { usePrefersReducedMotion } from "../../shared/hooks/usePrefersReducedMotion";
import styles from "./CinemaRightsPage.module.css";

export function RightsSideNav() {
  const [active, setActive] = useState(navItems[0]?.id ?? "");
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    const els = navItems
      .map((n) => document.getElementById(n.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "start",
    });
    setActive(id);
  };

  return (
    <nav className={styles.sideNav} aria-label="On this page">
      {navItems.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.sideItem} ${
              isActive ? styles.sideItemActive : ""
            }`}
            aria-current={isActive ? "true" : undefined}
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
