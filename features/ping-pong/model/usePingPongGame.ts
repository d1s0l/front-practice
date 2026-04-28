"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UsePingPongGameOptions = {
  winningScore: number;
  onFinish?: (result: {
    playerScore: number;
    opponentScore: number;
    didWin: boolean;
    isFlawless: boolean;
    durationMs: number;
  }) => void;
};

type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type MatchState = "ready" | "playing" | "finished";
type MoveDirection = -1 | 0 | 1;

const FIELD_WIDTH = 100;
const FIELD_HEIGHT = 100;
const PADDLE_HEIGHT = 20;
const PLAYER_X = 6;
const OPPONENT_X = 94;
const BALL_SIZE = 3;
const PLAYER_SPEED = 96;
const OPPONENT_SPEED = 62;
const BALL_BASE_SPEED = 58;
const MAX_BALL_SPEED_X = 96;
const MAX_BALL_SPEED_Y = 72;
const OPPONENT_REACTION_LINE = 56;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getPongDirection(event: KeyboardEvent): MoveDirection | null {
  if (event.code === "KeyW" || event.key.toLowerCase() === "w" || event.key.toLowerCase() === "ц") {
    return -1;
  }

  if (event.code === "KeyS" || event.key.toLowerCase() === "s" || event.key.toLowerCase() === "ы") {
    return 1;
  }

  return null;
}

function createBall(direction: 1 | -1): BallState {
  return {
    x: FIELD_WIDTH / 2,
    y: FIELD_HEIGHT / 2,
    vx: BALL_BASE_SPEED * direction,
    vy: (Math.random() > 0.5 ? 1 : -1) * 18,
  };
}

function isBallOverlappingPaddle(
  ballY: number,
  paddleTop: number,
  paddleBottom: number
) {
  const ballRadius = BALL_SIZE / 2;

  return ballY + ballRadius >= paddleTop && ballY - ballRadius <= paddleBottom;
}

export function usePingPongGame({ winningScore, onFinish }: UsePingPongGameOptions) {
  const [matchState, setMatchState] = useState<MatchState>("ready");
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [playerY, setPlayerY] = useState(FIELD_HEIGHT / 2);
  const [opponentY, setOpponentY] = useState(FIELD_HEIGHT / 2);
  const [ball, setBall] = useState<BallState>(createBall(1));
  const [statusText, setStatusText] = useState("Нажми старт и удерживай темп.");
  const [countdown, setCountdown] = useState<number | null>(null);
  const directionRef = useRef<MoveDirection>(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const matchStartedAtRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  const resetRound = useCallback((direction: 1 | -1) => {
    setBall(createBall(direction));
    setPlayerY(FIELD_HEIGHT / 2);
    setOpponentY(FIELD_HEIGHT / 2);
    setCountdown(1);
    setStatusText("Новый розыгрыш!");
    lastTimeRef.current = null;

    window.setTimeout(() => {
      setCountdown(null);
    }, 450);
  }, []);

  const finishMatch = useCallback(
    (finalPlayerScore: number, finalOpponentScore: number) => {
      if (finishedRef.current) {
        return;
      }

      finishedRef.current = true;
      setMatchState("finished");
      setCountdown(null);
      const didWin = finalPlayerScore > finalOpponentScore;
      const isFlawless = didWin && finalOpponentScore === 0;
      const durationMs = matchStartedAtRef.current
        ? Date.now() - matchStartedAtRef.current
        : 0;

      setStatusText(
        didWin
          ? isFlawless
            ? "Идеальный матч. Соня признаёт твой темп."
            : "Победа. Ты удержал темп матча."
          : "Матч завершён. Соня просит реванш."
      );

      onFinish?.({
        playerScore: finalPlayerScore,
        opponentScore: finalOpponentScore,
        didWin,
        isFlawless,
        durationMs,
      });
    },
    [onFinish]
  );

  const startGame = useCallback(() => {
    finishedRef.current = false;
    setMatchState("playing");
    setPlayerScore(0);
    setOpponentScore(0);
    directionRef.current = 0;
    setStatusText("W / S или Ц / Ы.");
    matchStartedAtRef.current = Date.now();
    resetRound(Math.random() > 0.5 ? 1 : -1);
  }, [resetRound]);

  const setMoveDirection = useCallback((direction: MoveDirection) => {
    directionRef.current = direction;
  }, []);

  useEffect(() => {
    if (matchState !== "playing") {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      return;
    }

    const tick = (time: number) => {
      const previous = lastTimeRef.current ?? time;
      const delta = Math.min((time - previous) / 1000, 0.024);
      lastTimeRef.current = time;

      if (countdown !== null) {
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      let nextPlayerY = playerY + directionRef.current * PLAYER_SPEED * delta;
      nextPlayerY = clamp(nextPlayerY, PADDLE_HEIGHT / 2, FIELD_HEIGHT - PADDLE_HEIGHT / 2);

      const opponentTargetY =
        ball.x >= OPPONENT_REACTION_LINE ? ball.y : FIELD_HEIGHT / 2;
      const opponentDelta = opponentTargetY - opponentY;
      let nextOpponentY =
        opponentY + clamp(opponentDelta, -1, 1) * OPPONENT_SPEED * delta;
      nextOpponentY = clamp(
        nextOpponentY,
        PADDLE_HEIGHT / 2,
        FIELD_HEIGHT - PADDLE_HEIGHT / 2
      );

      let nextBall = {
        ...ball,
        x: ball.x + ball.vx * delta,
        y: ball.y + ball.vy * delta,
      };
      const previousBallLeft = ball.x - BALL_SIZE / 2;
      const previousBallRight = ball.x + BALL_SIZE / 2;
      const nextBallLeft = nextBall.x - BALL_SIZE / 2;
      const nextBallRight = nextBall.x + BALL_SIZE / 2;

      if (nextBall.y <= BALL_SIZE / 2 || nextBall.y >= FIELD_HEIGHT - BALL_SIZE / 2) {
        nextBall = {
          ...nextBall,
          y: clamp(nextBall.y, BALL_SIZE / 2, FIELD_HEIGHT - BALL_SIZE / 2),
          vy: -nextBall.vy,
        };
      }

      const playerReachTop = nextPlayerY - PADDLE_HEIGHT / 2;
      const playerReachBottom = nextPlayerY + PADDLE_HEIGHT / 2;
      const opponentReachTop = nextOpponentY - PADDLE_HEIGHT / 2;
      const opponentReachBottom = nextOpponentY + PADDLE_HEIGHT / 2;

      const hitPlayer =
        nextBall.vx < 0 &&
        previousBallLeft >= PLAYER_X + 1.5 &&
        nextBallLeft <= PLAYER_X + 1.5 &&
        isBallOverlappingPaddle(nextBall.y, playerReachTop, playerReachBottom);

      if (hitPlayer) {
        const impact = (nextBall.y - nextPlayerY) / (PADDLE_HEIGHT / 2);
        nextBall = {
          ...nextBall,
          x: PLAYER_X + 2.2,
          vx: clamp(Math.abs(nextBall.vx) + 4, BALL_BASE_SPEED, MAX_BALL_SPEED_X),
          vy: clamp(nextBall.vy + impact * 30, -MAX_BALL_SPEED_Y, MAX_BALL_SPEED_Y),
        };
      }

      const hitOpponent =
        nextBall.vx > 0 &&
        previousBallRight <= OPPONENT_X - 1.5 &&
        nextBallRight >= OPPONENT_X - 1.5 &&
        isBallOverlappingPaddle(nextBall.y, opponentReachTop, opponentReachBottom);

      if (hitOpponent) {
        const impact = (nextBall.y - nextOpponentY) / (PADDLE_HEIGHT / 2);
        nextBall = {
          ...nextBall,
          x: OPPONENT_X - 2.2,
          vx: -clamp(Math.abs(nextBall.vx) + 4, BALL_BASE_SPEED, MAX_BALL_SPEED_X),
          vy: clamp(nextBall.vy + impact * 26, -MAX_BALL_SPEED_Y, MAX_BALL_SPEED_Y),
        };
      }

      if (nextBall.x < -6) {
        const nextOpponentScore = opponentScore + 1;
        setOpponentScore(nextOpponentScore);
        setStatusText("Очко у NPC. Готовь следующий розыгрыш.");
        setPlayerY(nextPlayerY);
        setOpponentY(nextOpponentY);
        if (nextOpponentScore >= winningScore) {
          finishMatch(playerScore, nextOpponentScore);
          return;
        }

        resetRound(1);
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      if (nextBall.x > FIELD_WIDTH + 6) {
        const nextPlayerScore = playerScore + 1;
        setPlayerScore(nextPlayerScore);
        setStatusText("Очко твоё. Держи ритм.");
        setPlayerY(nextPlayerY);
        setOpponentY(nextOpponentY);
        if (nextPlayerScore >= winningScore) {
          finishMatch(nextPlayerScore, opponentScore);
          return;
        }

        resetRound(-1);
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }

      setPlayerY(nextPlayerY);
      setOpponentY(nextOpponentY);
      setBall(nextBall);
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [
    ball,
    countdown,
    finishMatch,
    matchState,
    opponentScore,
    opponentY,
    playerScore,
    playerY,
    resetRound,
    winningScore,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (matchState !== "playing") {
        return;
      }

      const direction = getPongDirection(event);

      if (direction !== null) {
        directionRef.current = direction;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const direction = getPongDirection(event);

      if (direction !== null) {
        directionRef.current = 0;
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [matchState]);

  useEffect(() => {
    if (matchState === "playing") {
      return;
    }

    directionRef.current = 0;
  }, [matchState]);

  useEffect(() => {
    return () => {
      directionRef.current = 0;
    };
  }, []);

  const winner = useMemo(() => {
    if (matchState !== "finished") {
      return null;
    }

    return playerScore > opponentScore ? "player" : "npc";
  }, [matchState, opponentScore, playerScore]);

  return {
    matchState,
    playerScore,
    opponentScore,
    playerY,
    opponentY,
    ball,
    countdown,
    statusText,
    winner,
    startGame,
    setMoveDirection,
  };
}
