import type { GameNpc } from "@/shared/config/game-npcs";
import styles from "./BottomQuestionPanel.module.scss";

type BottomQuestionPanelProps = {
  npc: GameNpc | null;
  generatedDescription: string | null;
  isCompleted: boolean;
  compact?: boolean;
};

export function BottomQuestionPanel({
  npc,
  generatedDescription,
  isCompleted,
  compact = false,
}: BottomQuestionPanelProps) {
  if (!npc) {
    return null;
  }

  return (
    <section
      className={`${styles.prompt} ${compact ? styles["prompt--compact"] : ""}`}
    >
      <div className={styles.prompt__icon} aria-hidden="true">
        E
      </div>
      <div className={styles.prompt__copy}>
        <span className={styles.prompt__eyebrow}>{npc.sectorCode}</span>
        <h2 className={styles.prompt__title}>{npc.name}</h2>
        <p className={styles.prompt__role}>{`${npc.role} · ${npc.valueLabel}`}</p>
        <p className={styles.prompt__text}>{generatedDescription ?? npc.description}</p>
        <p className={styles.prompt__status}>
          {isCompleted
            ? "Миссия завершена"
            : compact
              ? "Нажмите кнопку действия"
              : "Нажмите E / У, чтобы начать диалог"}
        </p>
      </div>
    </section>
  );
}
