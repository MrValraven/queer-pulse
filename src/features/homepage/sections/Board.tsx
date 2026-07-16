import { useState } from "react";
import { Link } from "react-router-dom";
import { FiClipboard } from "react-icons/fi";
import {
  Button,
  EmptyState,
  Reveal,
  SectionHead,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { linkToPath, routes } from "../../../app/routeMap";
import { boardFilters, boardPosts } from "../data/boardPosts";
import { filterBoardPosts } from "../lib/filters";
import styles from "./Board.module.css";

type BoardFilter = (typeof boardFilters)[number]["value"];

export function Board() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<BoardFilter>("all");
  const visible = filterBoardPosts(boardPosts, filter);

  return (
    <section className={styles.board} id="board">
      <div className="wrap">
        <Reveal>
          <SectionHead
            className={styles.head}
            title={
              <Translation
                i18nKey="homepage:board.title"
                components={{ em: <em /> }}
              />
            }
            subtitle={t("homepage:board.subtitle")}
          />
        </Reveal>

        <Reveal className={styles.bar}>
          <div className={styles.chips}>
            {boardFilters.map((option) => (
              <button
                key={option.value}
                type="button"
                className={[
                  styles.chip,
                  filter === option.value && styles.chipActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFilter(option.value)}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            to={routes.offer}
            style={{ fontSize: 13, padding: "9px 17px" }}
          >
            {t("homepage:board.postSomethingCta")}
          </Button>
        </Reveal>

        {visible.length === 0 ? (
          <EmptyState
            compact
            icon={<FiClipboard />}
            title={t("homepage:board.empty.title")}
            description={t("homepage:board.empty.description")}
            action={{
              label: t("homepage:board.empty.clearFilters"),
              onClick: () => setFilter("all"),
            }}
          />
        ) : (
          <div className={styles.grid}>
            {visible.map((post) => (
              <Link
                key={post.href}
                to={linkToPath(post.href)}
                className={styles.ask}
              >
                <span className={[styles.kind, styles[post.kind]].join(" ")}>
                  {post.kind === "looking"
                    ? t("homepage:board.kind.lookingFor")
                    : t("homepage:board.kind.offering")}
                </span>
                <h3 className={styles.title}>{post.title}</h3>
                <div className={styles.poster}>
                  <span className={styles.avMini}>{post.posterInitials}</span>
                  <div className={styles.who}>
                    <b>{post.posterName}</b> · <span>{post.posterMeta}</span>
                  </div>
                  <span className={styles.age}>{post.age}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
