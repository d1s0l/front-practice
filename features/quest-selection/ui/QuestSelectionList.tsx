import Link from "next/link";
import type { GameNpc } from "@/shared/config/game-npcs";
import styles from "./QuestSelectionList.module.scss";

type QuestSelectionListProps = {
  zones: GameNpc[];
  activeZoneSlug?: string;
};

export function QuestSelectionList({
  zones,
  activeZoneSlug,
}: QuestSelectionListProps) {
  return (
    <div className={styles.questList}>
      {zones.map((zone) => {
        const isActive = zone.slug === activeZoneSlug;

        return (
          <article
            key={zone.slug}
            className={`${styles.questCard} ${
              isActive ? styles["questCard--active"] : ""
            } ${styles[`questCard--${zone.accent}`]}`}
          >
            <div className={styles.questCard__meta}>
              <span>{zone.sectorCode}</span>
              <strong>{zone.name}</strong>
            </div>
            <p>{zone.description}</p>
            <Link className={styles.questCard__link} href={zone.missionHref}>
              Открыть миссию
            </Link>
          </article>
        );
      })}
    </div>
  );
}
