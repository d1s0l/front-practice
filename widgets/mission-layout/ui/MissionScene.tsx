import type { MissionConfig } from "@/entities/mission/model/mission-data";
import styles from "./MissionLayout.module.scss";

type MissionSceneProps = {
  location: string;
  actors: MissionConfig["sceneActors"];
};

export function MissionScene({ location, actors }: MissionSceneProps) {
  return (
    <section className={styles.scenePanel}>
      <div className={styles.scenePanel__header}>
        <div>
          <p className={styles.scenePanel__eyebrow}>scene render</p>
          <h2 className={styles.scenePanel__title}>{location}</h2>
        </div>
        <div className={styles.scenePanel__tag}>live simulation</div>
      </div>

      <div className={styles.scenePanel__viewport}>
        <div className={styles.scenePanel__floor} />
        <div className={styles.scenePanel__gridGlow} />

        <div className={styles.scenePanel__terminal} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className={styles.scenePanel__drone} aria-hidden="true">
          <span />
        </div>

        <div className={styles.scenePanel__npc}>
          <span className={styles.scenePanel__npcMarker}>npc</span>
          <div className={styles.scenePanel__npcSprite}>
            <span className={styles.scenePanel__npcShadow} />
            <span className={styles.scenePanel__npcBody} />
            <span className={styles.scenePanel__npcFace} />
          </div>
        </div>

        <div className={styles.scenePanel__player}>
          <span className={styles.scenePanel__playerMarker}>player</span>
          <div className={styles.scenePanel__playerSprite}>
            <span className={styles.scenePanel__playerShadow} />
            <span className={styles.scenePanel__playerBody} />
            <span className={styles.scenePanel__playerVisor} />
            <span className={styles.scenePanel__playerCore} />
          </div>
        </div>
      </div>

      <div className={styles.scenePanel__actors}>
        {actors.map((actor) => (
          <div key={actor.name} className={styles.scenePanel__actorCard}>
            <span>{actor.type}</span>
            <strong>{actor.name}</strong>
            <p>{actor.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
