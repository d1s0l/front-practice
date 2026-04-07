import styles from "./DecisionPanel.module.scss";
import type { MissionOutcome } from "@/entities/mission/model/mission-data";

type DecisionPanelProps = {
  prompt: string;
  options: MissionOutcome[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function DecisionPanel({
  prompt,
  options,
  selectedId,
  onSelect,
}: DecisionPanelProps) {
  return (
    <section className={styles.decisionPanel}>
      <div className={styles.decisionPanel__header}>
        <p className={styles.decisionPanel__eyebrow}>critical choice</p>
        <h2 className={styles.decisionPanel__title}>Точка напряжения</h2>
      </div>

      <p className={styles.decisionPanel__prompt}>{prompt}</p>

      <div className={styles.decisionPanel__options}>
        {options.map((option) => {
          const isActive = option.id === selectedId;

          return (
            <button
              key={option.id}
              type="button"
              className={`${styles.decisionPanel__option} ${
                isActive ? styles["decisionPanel__option--active"] : ""
              }`}
              onClick={() => onSelect(option.id)}
            >
              <strong>{option.label}</strong>
              <span>{option.summary}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
