import type { GameNpc } from "@/shared/config/game-npcs";
import styles from "./BottomQuestionPanel.module.scss";

type BottomQuestionPanelProps = {
  npc: GameNpc | null;
  generatedDescription: string | null;
  isCompleted: boolean;
};

export function BottomQuestionPanel({
  npc,
  generatedDescription,
  isCompleted,
}: BottomQuestionPanelProps) {
  if (!npc) {
    return null;
  }

  return (
    <section className={styles.prompt}>
      <div className={styles.prompt__icon} aria-hidden="true">
        E
      </div>
      <div className={styles.prompt__copy}>
        <span className={styles.prompt__eyebrow}>{npc.sectorCode}</span>
        <h2 className={styles.prompt__title}>{npc.name}</h2>
        <p className={styles.prompt__role}>{`${npc.role} · ${npc.valueLabel}`}</p>
        <p className={styles.prompt__text}>
          {generatedDescription ?? npc.description}
        </p>
        <p className={styles.prompt__status}>
          {isCompleted ? "Миссия завершена" : "Нажмите E / У, чтобы начать диалог"}
        </p>
      </div>
    </section>
  );
}
