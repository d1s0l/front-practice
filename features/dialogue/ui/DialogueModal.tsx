import Link from "next/link";
import type { GameNpc } from "@/shared/config/game-npcs";
import styles from "./DialogueModal.module.scss";

type DialogueModalProps = {
  npc: GameNpc;
  stageIndex: number;
  totalStages: number;
  generatedHeader: string | null;
  generatedMessage: string | null;
  selectedChoiceId: string | null;
  responseText: string | null;
  hintText: string | null;
  canRetry: boolean;
  canAdvance: boolean;
  isCompleted: boolean;
  onChoose: (choiceId: string) => void;
  onContinue: () => void;
  onClose: () => void;
};

export function DialogueModal({
  npc,
  stageIndex,
  totalStages,
  generatedHeader,
  generatedMessage,
  selectedChoiceId,
  responseText,
  hintText,
  canRetry,
  canAdvance,
  isCompleted,
  onChoose,
  onContinue,
  onClose,
}: DialogueModalProps) {
  const currentStage = npc.stages[stageIndex];

  return (
    <section className={styles.modal} aria-label="Диалог с NPC">
      <div className={styles.modal__header}>
        <div>
          <span className={styles.modal__eyebrow}>{npc.sectorCode}</span>
          <h2 className={styles.modal__name}>{npc.name}</h2>
          <p className={styles.modal__role}>{npc.role}</p>
          <span className={styles.modal__step}>{`Этап ${stageIndex + 1}/${totalStages}`}</span>
        </div>
        <button className={styles.modal__close} type="button" onClick={onClose}>
          Закрыть
        </button>
      </div>

      <div className={styles.modal__message}>
        <p className={styles.modal__headerText}>
          {generatedHeader ?? `${npc.name} открывает новый сценарий.`}
        </p>
        <p>{generatedMessage ?? currentStage.question}</p>
      </div>

      <div className={styles.modal__choices}>
        {currentStage.choices.map((choice) => {
          const isActive = choice.id === selectedChoiceId;

          return (
            <button
              key={choice.id}
              type="button"
              className={`${styles.modal__choice} ${
                isActive ? styles["modal__choice--active"] : ""
              }`}
              onClick={() => onChoose(choice.id)}
            >
              {choice.text}
            </button>
          );
        })}
      </div>

      {responseText ? (
        <div className={styles.modal__response}>
          <p>{responseText}</p>
          {hintText ? <p className={styles.modal__hint}>{hintText}</p> : null}
          <div className={styles.modal__actions}>
            <Link className={styles.modal__secondary} href={npc.missionHref}>
              Открыть миссию
            </Link>
            <button className={styles.modal__primary} type="button" onClick={onContinue}>
              {isCompleted
                ? "Завершить разговор"
                : canAdvance
                  ? "Следующий этап"
                  : canRetry
                    ? "Попробовать ещё раз"
                    : "Продолжить"}
            </button>
            <button className={styles.modal__secondary} type="button" onClick={onClose}>
              Вернуться на карту
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
