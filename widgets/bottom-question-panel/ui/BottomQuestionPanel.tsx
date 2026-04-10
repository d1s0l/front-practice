import type { GameNpc } from "@/shared/config/game-npcs";
import styles from "./BottomQuestionPanel.module.scss";

type PromptOverride = {
  eyebrow: string;
  title: string;
  role: string;
  text: string;
  status: string;
  iconLabel?: string;
};

type BottomQuestionPanelProps = {
  npc: GameNpc | null;
  generatedDescription: string | null;
  isCompleted: boolean;
  compact?: boolean;
  promptOverride?: PromptOverride | null;
};

export function BottomQuestionPanel({
  npc,
  generatedDescription,
  isCompleted,
  compact = false,
  promptOverride = null,
}: BottomQuestionPanelProps) {
  if (!npc && !promptOverride) {
    return null;
  }

  const eyebrow = promptOverride?.eyebrow ?? npc?.sectorCode ?? "";
  const title = promptOverride?.title ?? npc?.name ?? "";
  const role =
    promptOverride?.role ?? (npc ? `${npc.role} · ${npc.valueLabel}` : "");
  const text = promptOverride?.text ?? generatedDescription ?? npc?.description ?? "";
  const status =
    promptOverride?.status ??
    (isCompleted
      ? "Миссия завершена"
      : compact
        ? "Нажмите кнопку действия"
        : "Нажмите E / У, чтобы начать диалог");
  const iconLabel = promptOverride?.iconLabel ?? "E";

  return (
    <section
      className={`${styles.prompt} ${compact ? styles["prompt--compact"] : ""}`}
    >
      <div className={styles.prompt__icon} aria-hidden="true">
        {iconLabel}
      </div>
      <div className={styles.prompt__copy}>
        <span className={styles.prompt__eyebrow}>{eyebrow}</span>
        <h2 className={styles.prompt__title}>{title}</h2>
        <p className={styles.prompt__role}>{role}</p>
        <p className={styles.prompt__text}>{text}</p>
        <p className={styles.prompt__status}>{status}</p>
      </div>
    </section>
  );
}
