import styles from "./DialoguePanel.module.scss";

type DialoguePanelProps = {
  npc: {
    name: string;
    role: string;
    line: string;
  };
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function DialoguePanel({
  npc,
  options,
  selectedIndex,
  onSelect,
}: DialoguePanelProps) {
  return (
    <section className={styles.dialoguePanel}>
      <div className={styles.dialoguePanel__header}>
        <div>
          <p className={styles.dialoguePanel__eyebrow}>dialogue feed</p>
          <h2 className={styles.dialoguePanel__title}>Синхронизация с NPC</h2>
        </div>
        <div className={styles.dialoguePanel__identity}>
          <strong>{npc.name}</strong>
          <span>{npc.role}</span>
        </div>
      </div>

      <div className={styles.dialoguePanel__bubble}>
        <p>{npc.line}</p>
      </div>

      <div className={styles.dialoguePanel__choices}>
        {options.map((option, index) => {
          const isActive = index === selectedIndex;

          return (
            <button
              key={option}
              type="button"
              className={`${styles.dialoguePanel__choice} ${
                isActive ? styles["dialoguePanel__choice--active"] : ""
              }`}
              onClick={() => onSelect(index)}
            >
              <span>{`0${index + 1}`}</span>
              <strong>{option}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}
