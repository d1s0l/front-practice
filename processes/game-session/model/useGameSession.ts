"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  GameNpc,
  NpcChoice,
  NpcStage,
  QuickDuelQuestion,
  ScoreDelta,
} from "@/shared/config/game-npcs";
import {
  generateDialogue,
  generateHint,
  generateOutcomeText,
  generateQuestText,
} from "@/shared/lib/ai/cursor-ai";

type ScoreState = {
  reputation: number;
  responsibility: number;
  transparency: number;
  speed: number;
  quality: number;
  xp: number;
};

type StageOutcome = {
  response: string;
  hint: string;
  choiceId: string | null;
  canRetry: boolean;
  willAdvance: boolean;
  willCompleteNpc: boolean;
};

type QuickDuelOutcome = {
  selectedOptionId: string | null;
  isCorrect: boolean;
  isFast: boolean;
  awardedXp: number;
  message: string;
  isTimeout: boolean;
};

type QuickDuelState = {
  npc: GameNpc;
  question: QuickDuelQuestion;
  questionIndex: number;
  totalQuestions: number;
  timeRemaining: number | null;
  outcome: QuickDuelOutcome | null;
  totalBonusXp: number;
};

type BonusXpNotice = {
  amount: number;
  label: string;
};

type FinalStep = "summary" | "feedback" | "done" | null;

const initialScores: ScoreState = {
  reputation: 64,
  responsibility: 50,
  transparency: 50,
  speed: 50,
  quality: 50,
  xp: 0,
};

function applyScoreDelta(current: ScoreState, delta: ScoreDelta): ScoreState {
  return {
    reputation: current.reputation + delta.reputation,
    responsibility: current.responsibility + delta.responsibility,
    transparency: current.transparency + delta.transparency,
    speed: current.speed + delta.speed,
    quality: current.quality + delta.quality,
    xp: current.xp + delta.xp,
  };
}

function getStageIndex(stageIndexes: Record<string, number>, npc: GameNpc) {
  return stageIndexes[npc.slug] ?? 0;
}

function getStageForNpc(stageIndexes: Record<string, number>, npc: GameNpc) {
  return npc.stages[getStageIndex(stageIndexes, npc)] ?? npc.stages[npc.stages.length - 1];
}

function buildQuickDuelMessage(
  npc: GameNpc,
  question: QuickDuelQuestion,
  outcome: Pick<QuickDuelOutcome, "isCorrect" | "isFast" | "awardedXp" | "isTimeout">
) {
  if (outcome.isTimeout) {
    return `${npc.name}: время вышло. Ты получил базовый XP за попытку, но потерял шанс на бонус за скорость и точность.`;
  }

  if (outcome.isCorrect && outcome.isFast) {
    return `${npc.name}: отлично, это быстрый и точный ответ. +${outcome.awardedXp} XP за темп и ясность.`;
  }

  if (outcome.isCorrect) {
    return `${npc.name}: ответ верный. Ты удержал смысл вопроса "${question.id}" и получил +${outcome.awardedXp} XP.`;
  }

  return `${npc.name}: ответ не лучший, но ты всё равно получаешь +${outcome.awardedXp} XP за участие в раунде.`;
}

export function useGameSession(npcs: GameNpc[], previewNpc: GameNpc | null) {
  const [openedNpcSlug, setOpenedNpcSlug] = useState<string | null>(null);
  const [scores, setScores] = useState<ScoreState>(initialScores);
  const [stageIndexes, setStageIndexes] = useState<Record<string, number>>({});
  const [completedNpcSlugs, setCompletedNpcSlugs] = useState<string[]>([]);
  const [stageOutcome, setStageOutcome] = useState<StageOutcome | null>(null);
  const [timerDeadline, setTimerDeadline] = useState<number | null>(null);
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const [finalStep, setFinalStep] = useState<FinalStep>(null);
  const [feedback, setFeedback] = useState("");
  const [quickDuelNpcSlug, setQuickDuelNpcSlug] = useState<string | null>(null);
  const [quickDuelQuestionIndex, setQuickDuelQuestionIndex] = useState(0);
  const [quickDuelOutcome, setQuickDuelOutcome] = useState<QuickDuelOutcome | null>(null);
  const [quickDuelStartedAt, setQuickDuelStartedAt] = useState<number | null>(null);
  const [quickDuelDeadline, setQuickDuelDeadline] = useState<number | null>(null);
  const [quickDuelCompletedSlugs, setQuickDuelCompletedSlugs] = useState<string[]>([]);
  const [quickDuelBonusXp, setQuickDuelBonusXp] = useState(0);
  const [bonusXpNotice, setBonusXpNotice] = useState<BonusXpNotice | null>(null);
  const timeoutTriggeredRef = useRef(false);
  const quickDuelTimeoutTriggeredRef = useRef(false);

  const openedNpc = useMemo(
    () => npcs.find((npc) => npc.slug === openedNpcSlug) ?? null,
    [npcs, openedNpcSlug]
  );
  const quickDuelNpc = useMemo(
    () => npcs.find((npc) => npc.slug === quickDuelNpcSlug) ?? null,
    [npcs, quickDuelNpcSlug]
  );

  const currentStage = useMemo(() => {
    if (!openedNpc) {
      return null;
    }

    return getStageForNpc(stageIndexes, openedNpc);
  }, [openedNpc, stageIndexes]);

  const quickDuelQuestion = useMemo(() => {
    if (!quickDuelNpc?.quickDuel) {
      return null;
    }

    return quickDuelNpc.quickDuel.questions[quickDuelQuestionIndex] ?? null;
  }, [quickDuelNpc, quickDuelQuestionIndex]);

  const previewPromptNpc = previewNpc ?? openedNpc ?? null;

  const dialogueContent = useMemo(() => {
    if (!openedNpc || !currentStage) {
      return null;
    }

    return generateDialogue(openedNpc, currentStage);
  }, [currentStage, openedNpc]);

  const promptContent = useMemo(() => {
    if (!previewPromptNpc) {
      return null;
    }

    const stage = getStageForNpc(stageIndexes, previewPromptNpc);

    return generateQuestText(
      previewPromptNpc,
      stage,
      completedNpcSlugs.includes(previewPromptNpc.slug)
    );
  }, [completedNpcSlugs, previewPromptNpc, stageIndexes]);

  const quickDuelTimeRemaining = useMemo(() => {
    if (!quickDuelDeadline) {
      return null;
    }

    return Math.max(0, Math.ceil((quickDuelDeadline - timerNow) / 1000));
  }, [quickDuelDeadline, timerNow]);

  const quickDuelState: QuickDuelState | null = useMemo(() => {
    if (!quickDuelNpc || !quickDuelQuestion || !quickDuelNpc.quickDuel) {
      return null;
    }

    return {
      npc: quickDuelNpc,
      question: quickDuelQuestion,
      questionIndex: quickDuelQuestionIndex,
      totalQuestions: quickDuelNpc.quickDuel.questions.length,
      timeRemaining: quickDuelTimeRemaining,
      outcome: quickDuelOutcome,
      totalBonusXp: quickDuelBonusXp,
    };
  }, [
    quickDuelBonusXp,
    quickDuelNpc,
    quickDuelOutcome,
    quickDuelQuestion,
    quickDuelQuestionIndex,
    quickDuelTimeRemaining,
  ]);

  const level = Math.floor(scores.xp / 60) + 1;

  const openDialogueForNpc = useCallback(
    (npc: GameNpc) => {
      setOpenedNpcSlug(npc.slug);
      setStageOutcome(null);
      timeoutTriggeredRef.current = false;
      const stage = getStageForNpc(stageIndexes, npc);
      setTimerDeadline(
        stage.pressureSeconds ? Date.now() + stage.pressureSeconds * 1000 : null
      );
    },
    [stageIndexes]
  );

  const openNpc = useCallback(
    (npc: GameNpc) => {
      openDialogueForNpc(npc);
    },
    [openDialogueForNpc]
  );

  const clearQuickDuel = useCallback(() => {
    setQuickDuelNpcSlug(null);
    setQuickDuelQuestionIndex(0);
    setQuickDuelOutcome(null);
    setQuickDuelStartedAt(null);
    setQuickDuelDeadline(null);
    setQuickDuelBonusXp(0);
    quickDuelTimeoutTriggeredRef.current = false;
  }, []);

  const startQuickDuel = useCallback(
    (npc: GameNpc) => {
      const firstQuestion = npc.quickDuel?.questions[0];

      if (!firstQuestion) {
        openDialogueForNpc(npc);
        return;
      }

      setOpenedNpcSlug(null);
      setStageOutcome(null);
      setTimerDeadline(null);
      setQuickDuelNpcSlug(npc.slug);
      setQuickDuelQuestionIndex(0);
      setQuickDuelOutcome(null);
      setQuickDuelBonusXp(0);
      setQuickDuelStartedAt(Date.now());
      setQuickDuelDeadline(Date.now() + firstQuestion.timeLimitSeconds * 1000);
      quickDuelTimeoutTriggeredRef.current = false;
    },
    [openDialogueForNpc]
  );

  const startInteraction = useCallback(
    (npc: GameNpc) => {
      if (npc.quickDuel && !quickDuelCompletedSlugs.includes(npc.slug)) {
        startQuickDuel(npc);
        return;
      }

      openDialogueForNpc(npc);
    },
    [openDialogueForNpc, quickDuelCompletedSlugs, startQuickDuel]
  );

  const closeDialogue = useCallback(() => {
    setOpenedNpcSlug(null);
    setStageOutcome(null);
    setTimerDeadline(null);
    timeoutTriggeredRef.current = false;
  }, []);

  const closeQuickDuel = useCallback(() => {
    clearQuickDuel();
  }, [clearQuickDuel]);

  const clearBonusXpNotice = useCallback(() => {
    setBonusXpNotice(null);
  }, []);

  const addBonusXp = useCallback((amount: number, label: string) => {
    setScores((current) => ({
      ...current,
      xp: current.xp + amount,
    }));
    setBonusXpNotice({
      amount,
      label,
    });
  }, []);

  const applyChoiceOutcome = useCallback(
    (
      npc: GameNpc,
      stage: NpcStage,
      choice: Pick<
        NpcChoice,
        "id" | "tone" | "advances" | "delta" | "responseSeed" | "hintSeed"
      >,
      overrideResponseSeed?: string
    ) => {
      setScores((current) => applyScoreDelta(current, choice.delta));

      const isLastStage = getStageIndex(stageIndexes, npc) >= npc.stages.length - 1;
      const willAdvance = choice.advances;
      const willCompleteNpc = willAdvance && isLastStage;

      setStageOutcome({
        response: generateOutcomeText(
          npc,
          stage,
          overrideResponseSeed ?? choice.responseSeed
        ),
        hint: generateHint(npc, stage, choice),
        choiceId: choice.id,
        canRetry: !choice.advances,
        willAdvance,
        willCompleteNpc,
      });
      setTimerDeadline(null);
      timeoutTriggeredRef.current = true;
    },
    [stageIndexes]
  );

  const resolveQuickDuelAnswer = useCallback(
    (selectedOptionId: string | null, isTimeout = false) => {
      if (!quickDuelNpc || !quickDuelQuestion || !quickDuelNpc.quickDuel || quickDuelOutcome) {
        return;
      }

      const selectedOption = quickDuelQuestion.options.find(
        (option) => option.id === selectedOptionId
      );
      const elapsedMs = quickDuelStartedAt ? Date.now() - quickDuelStartedAt : Infinity;
      const isCorrect = selectedOption?.isCorrect ?? false;
      const isFast =
        !isTimeout && isCorrect && elapsedMs <= quickDuelQuestion.fastBonusThresholdMs;
      const awardedXp =
        quickDuelQuestion.xpReward.attempt +
        (isCorrect ? quickDuelQuestion.xpReward.correct : 0) +
        (isFast ? quickDuelQuestion.xpReward.fastBonus : 0);

      if (awardedXp > 0) {
        addBonusXp(awardedXp, isFast ? "speed bonus" : "ping-pong");
        setQuickDuelBonusXp((current) => current + awardedXp);
      }

      setQuickDuelOutcome({
        selectedOptionId,
        isCorrect,
        isFast,
        awardedXp,
        isTimeout,
        message: buildQuickDuelMessage(quickDuelNpc, quickDuelQuestion, {
          isCorrect,
          isFast,
          awardedXp,
          isTimeout,
        }),
      });
      setQuickDuelDeadline(null);
      quickDuelTimeoutTriggeredRef.current = true;
    },
    [addBonusXp, quickDuelNpc, quickDuelOutcome, quickDuelQuestion, quickDuelStartedAt]
  );

  const answerQuickDuel = useCallback(
    (optionId: string) => {
      resolveQuickDuelAnswer(optionId);
    },
    [resolveQuickDuelAnswer]
  );

  const continueQuickDuel = useCallback(() => {
    if (!quickDuelNpc || !quickDuelNpc.quickDuel || !quickDuelOutcome) {
      return;
    }

    const nextIndex = quickDuelQuestionIndex + 1;

    if (nextIndex >= quickDuelNpc.quickDuel.questions.length) {
      setQuickDuelCompletedSlugs((current) =>
        current.includes(quickDuelNpc.slug) ? current : [...current, quickDuelNpc.slug]
      );
      clearQuickDuel();
      openDialogueForNpc(quickDuelNpc);
      return;
    }

    const nextQuestion = quickDuelNpc.quickDuel.questions[nextIndex];

    setQuickDuelQuestionIndex(nextIndex);
    setQuickDuelOutcome(null);
    setQuickDuelStartedAt(Date.now());
    setQuickDuelDeadline(Date.now() + nextQuestion.timeLimitSeconds * 1000);
    quickDuelTimeoutTriggeredRef.current = false;
  }, [
    clearQuickDuel,
    openDialogueForNpc,
    quickDuelNpc,
    quickDuelOutcome,
    quickDuelQuestionIndex,
  ]);

  const chooseDialogueOption = useCallback(
    (choiceId: string) => {
      if (!openedNpc || !currentStage) {
        return;
      }

      const choice = currentStage.choices.find((item) => item.id === choiceId);

      if (!choice) {
        return;
      }

      applyChoiceOutcome(openedNpc, currentStage, choice);
    },
    [applyChoiceOutcome, currentStage, openedNpc]
  );

  const continueDialogue = useCallback(() => {
    if (!openedNpc || !currentStage || !stageOutcome) {
      return;
    }

    if (stageOutcome.willCompleteNpc) {
      setCompletedNpcSlugs((current) =>
        current.includes(openedNpc.slug) ? current : [...current, openedNpc.slug]
      );
      setOpenedNpcSlug(null);
      setStageOutcome(null);
      setTimerDeadline(null);
      timeoutTriggeredRef.current = false;
      return;
    }

    if (stageOutcome.willAdvance) {
      const nextIndex = getStageIndex(stageIndexes, openedNpc) + 1;

      setStageIndexes((current) => ({
        ...current,
        [openedNpc.slug]: nextIndex,
      }));

      const nextStage = openedNpc.stages[nextIndex] ?? null;
      timeoutTriggeredRef.current = false;
      setTimerDeadline(
        nextStage?.pressureSeconds ? Date.now() + nextStage.pressureSeconds * 1000 : null
      );
    } else {
      timeoutTriggeredRef.current = false;
      setTimerDeadline(
        currentStage.pressureSeconds ? Date.now() + currentStage.pressureSeconds * 1000 : null
      );
    }

    setStageOutcome(null);
  }, [currentStage, openedNpc, stageIndexes, stageOutcome]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimerNow(Date.now());

      if (
        openedNpc &&
        currentStage?.pressureSeconds &&
        !stageOutcome &&
        timerDeadline &&
        !timeoutTriggeredRef.current &&
        Date.now() >= timerDeadline &&
        currentStage.timeout
      ) {
        timeoutTriggeredRef.current = true;
        applyChoiceOutcome(
          openedNpc,
          currentStage,
          {
            id: "timeout",
            tone: "bad",
            advances: false,
            delta: currentStage.timeout.delta,
            responseSeed: currentStage.timeout.responseSeed,
            hintSeed: currentStage.timeout.hintSeed,
          },
          currentStage.timeout.responseSeed
        );
      }

      if (
        quickDuelNpc &&
        quickDuelQuestion &&
        !quickDuelOutcome &&
        quickDuelDeadline &&
        !quickDuelTimeoutTriggeredRef.current &&
        Date.now() >= quickDuelDeadline
      ) {
        quickDuelTimeoutTriggeredRef.current = true;
        resolveQuickDuelAnswer(null, true);
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    applyChoiceOutcome,
    currentStage,
    openedNpc,
    quickDuelDeadline,
    quickDuelNpc,
    quickDuelOutcome,
    quickDuelQuestion,
    resolveQuickDuelAnswer,
    stageOutcome,
    timerDeadline,
  ]);

  useEffect(() => {
    if (!bonusXpNotice) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setBonusXpNotice(null);
    }, 2400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [bonusXpNotice]);

  const timerRemaining = useMemo(() => {
    if (!timerDeadline) {
      return null;
    }

    return Math.max(0, Math.ceil((timerDeadline - timerNow) / 1000));
  }, [timerDeadline, timerNow]);

  const effectiveFinalStep: FinalStep =
    finalStep ?? (completedNpcSlugs.length === npcs.length ? "summary" : null);

  return {
    openedNpc,
    currentStage,
    scores,
    level,
    completedNpcSlugs,
    dialogueContent,
    promptContent,
    stageOutcome,
    timerRemaining,
    finalStep: effectiveFinalStep,
    feedback,
    bonusXpNotice,
    quickDuelState,
    quickDuelCompletedSlugs,
    setFeedback,
    openNpc,
    startInteraction,
    closeDialogue,
    closeQuickDuel,
    clearBonusXpNotice,
    chooseDialogueOption,
    continueDialogue,
    answerQuickDuel,
    continueQuickDuel,
    moveToFeedback: () => setFinalStep("feedback"),
    finishFeedback: () => setFinalStep("done"),
  };
}
