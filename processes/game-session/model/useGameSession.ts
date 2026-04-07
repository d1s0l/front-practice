"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GameNpc, NpcChoice, NpcStage, ScoreDelta } from "@/shared/config/game-npcs";
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

  const openedNpc = useMemo(
    () => npcs.find((npc) => npc.slug === openedNpcSlug) ?? null,
    [npcs, openedNpcSlug]
  );

  const currentStage = useMemo(() => {
    if (!openedNpc) {
      return null;
    }

    return getStageForNpc(stageIndexes, openedNpc);
  }, [openedNpc, stageIndexes]);

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

  const level = Math.floor(scores.xp / 60) + 1;

  const openNpc = useCallback(
    (npc: GameNpc) => {
      setOpenedNpcSlug(npc.slug);
      setStageOutcome(null);
      const stage = getStageForNpc(stageIndexes, npc);
      setTimerDeadline(
        stage.pressureSeconds ? Date.now() + stage.pressureSeconds * 1000 : null
      );
    },
    [stageIndexes]
  );

  const closeDialogue = useCallback(() => {
    setOpenedNpcSlug(null);
    setStageOutcome(null);
    setTimerDeadline(null);
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
    },
    [stageIndexes]
  );

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
      return;
    }

    if (stageOutcome.willAdvance) {
      const nextIndex = getStageIndex(stageIndexes, openedNpc) + 1;

      setStageIndexes((current) => ({
        ...current,
        [openedNpc.slug]: nextIndex,
      }));

      const nextStage = openedNpc.stages[nextIndex] ?? null;
      setTimerDeadline(
        nextStage?.pressureSeconds ? Date.now() + nextStage.pressureSeconds * 1000 : null
      );
    } else {
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
        Date.now() >= timerDeadline &&
        currentStage.timeout
      ) {
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
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [applyChoiceOutcome, currentStage, openedNpc, stageOutcome, timerDeadline]);

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
    setFeedback,
    openNpc,
    closeDialogue,
    chooseDialogueOption,
    continueDialogue,
    moveToFeedback: () => setFinalStep("feedback"),
    finishFeedback: () => setFinalStep("done"),
  };
}
