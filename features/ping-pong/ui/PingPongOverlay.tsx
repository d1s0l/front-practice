"use client";

import { useMemo } from "react";
import type { GameNpc } from "@/shared/config/game-npcs";
import { usePingPongGame } from "@/features/ping-pong/model/usePingPongGame";
import styles from "./PingPongOverlay.module.scss";

type PingPongOverlayProps = {
  npc: GameNpc;
  onClose: () => void;
  onFinish: (result: {
    playerScore: number;
    opponentScore: number;
    didWin: boolean;
    isFlawless: boolean;
    durationMs: number;
  }) => void;
};

function DirectionIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      className={`${styles.overlay__padIcon} ${
        direction === "down" ? styles["overlay__padIcon--down"] : ""
      }`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5 20 19H4Z" />
    </svg>
  );
}

export function PingPongOverlay({ npc, onClose, onFinish }: PingPongOverlayProps) {
  const winningScore = npc.pingPong?.winningScore ?? 3;
  const { matchState, playerScore, opponentScore, playerY, opponentY, ball, countdown, statusText, winner, startGame, setMoveDirection } =
    usePingPongGame({
      winningScore,
      onFinish,
    });

  const resultText = useMemo(() => {
    if (winner === "player") {
      return opponentScore === 0 ? "Идеальный матч" : "Победа";
    }

    if (winner === "npc") {
      return "Поражение";
    }

    return null;
  }, [opponentScore, winner]);

  return (
    <section className={styles.overlay} aria-label="Пинг-понг мини-игра">
      <div className={styles.overlay__panel}>
        <div className={styles.overlay__header}>
          <div>
            <span className={styles.overlay__eyebrow}>ping pong challenge</span>
            <h2 className={styles.overlay__title}>{`${npc.name} зовёт на матч`}</h2>
            <p className={styles.overlay__text}>
              {matchState === "ready"
                ? npc.pingPong?.intro
                : statusText}
            </p>
          </div>
          <button className={styles.overlay__close} type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>

        <div className={styles.overlay__hud}>
          <div className={styles.overlay__scoreBlock}>
            <span>Игрок</span>
            <strong>{playerScore}</strong>
          </div>
          <div className={styles.overlay__scoreCenter}>
            <span>{`Матч до ${winningScore}`}</span>
            <strong>{countdown !== null ? `${countdown}` : "PLAY"}</strong>
          </div>
          <div className={styles.overlay__scoreBlock}>
            <span>{npc.name}</span>
            <strong>{opponentScore}</strong>
          </div>
        </div>

        <div className={styles.overlay__arenaWrap}>
          <div className={styles.overlay__arena}>
            <div
              className={`${styles.overlay__paddle} ${styles["overlay__paddle--player"]}`}
              style={{ top: `${playerY}%` }}
            />
            <div
              className={`${styles.overlay__paddle} ${styles["overlay__paddle--npc"]}`}
              style={{ top: `${opponentY}%` }}
            />
            <div
              className={styles.overlay__ball}
              style={{
                left: `${ball.x}%`,
                top: `${ball.y}%`,
              }}
            />
            <div className={styles.overlay__net} />
          </div>
        </div>

        <div className={styles.overlay__controls}>
          <div className={styles.overlay__tips}>
            <span>`W / S` или `Ц / Ы`</span>
            <span>На мобильном: кнопки `UP` и `DOWN`</span>
          </div>

          {matchState === "ready" ? (
            <button className={styles.overlay__primary} type="button" onClick={startGame}>
              Начать матч
            </button>
          ) : matchState === "finished" ? (
            <div className={styles.overlay__result}>
              <span>{resultText}</span>
              <button className={styles.overlay__primary} type="button" onClick={onClose}>
                Вернуться в комнату
              </button>
            </div>
          ) : (
            <div className={styles.overlay__mobilePad}>
              <button
                type="button"
                className={styles.overlay__padButton}
                onPointerDown={() => setMoveDirection(-1)}
                onPointerUp={() => setMoveDirection(0)}
                onPointerCancel={() => setMoveDirection(0)}
                onPointerLeave={() => setMoveDirection(0)}
              >
                <DirectionIcon direction="up" />
              </button>
              <button
                type="button"
                className={styles.overlay__padButton}
                onPointerDown={() => setMoveDirection(1)}
                onPointerUp={() => setMoveDirection(0)}
                onPointerCancel={() => setMoveDirection(0)}
                onPointerLeave={() => setMoveDirection(0)}
              >
                <DirectionIcon direction="down" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
