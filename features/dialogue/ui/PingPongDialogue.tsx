import type { GameNpc } from "@/shared/config/game-npcs";
import styles from "./PingPongDialogue.module.scss";

type PingPongDialogueProps = {
  npc: GameNpc;
  intro: string;
  questionIndex: number;
  totalQuestions: number;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  timeRemaining: number | null;
  outcome: {
    selectedOptionId: string | null;
    isCorrect: boolean;
    isFast: boolean;
    awardedXp: number;
    message: string;
    isTimeout: boolean;
  } | null;
  totalBonusXp: number;
  onChoose: (optionId: string) => void;
  onClose: () => void;
};

export function PingPongDialogue({
  npc,
  intro,
  questionIndex,
  totalQuestions,
  prompt,
  options,
  timeRemaining,
  outcome,
  totalBonusXp,
  onChoose,
  onClose,
}: PingPongDialogueProps) {
  return (
    <section className={styles.modal} aria-label="Пинг-понг диалог">
      <div className={styles.modal__header}>
        <div>
          <span className={styles.modal__eyebrow}>rapid sync</span>
          <h2 className={styles.modal__title}>{`${npc.name} запускает пинг-понг`}</h2>
          <p className={styles.modal__text}>{intro}</p>
        </div>
        <button className={styles.modal__close} type="button" onClick={onClose}>
          Закрыть
        </button>
      </div>

      <div className={styles.modal__meta}>
        <span>{`Раунд ${questionIndex + 1}/${totalQuestions}`}</span>
        <span>{`Bonus XP: +${totalBonusXp}`}</span>
        <span>{timeRemaining !== null ? `Таймер: ${timeRemaining}s` : "Таймер завершён"}</span>
      </div>

      <div className={styles.modal__question}>
        <p>{prompt}</p>
      </div>

      <div className={styles.modal__options}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={styles.modal__option}
            onClick={() => onChoose(option.id)}
            disabled={Boolean(outcome)}
          >
            {option.text}
          </button>
        ))}
      </div>

      {outcome ? (
        <div className={styles.modal__result}>
          <p>{outcome.message}</p>
          <p className={styles.modal__resultMeta}>
            {outcome.isTimeout
              ? "Раунд завершён по таймеру"
              : outcome.isCorrect
                ? outcome.isFast
                  ? "Точный и быстрый ответ"
                  : "Точный ответ"
                : "Ответ засчитан как попытка"}
          </p>
          <div className={styles.modal__actions}>
            <span className={styles.modal__xp}>{`+${outcome.awardedXp} XP за раунд`}</span>
            <span className={styles.modal__next}>
              {questionIndex + 1 >= totalQuestions
                ? "Переходим к основному диалогу..."
                : "Следующий вопрос загружается..."}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
