"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { gameNpcs } from "@/shared/config/game-npcs";
import { isInteractionKey } from "@/shared/lib/controls";
import { catCompanion, pingPongArcadeCorner, roomBounds } from "@/shared/config/world-objects";
import { usePlayerMovement } from "@/features/player-movement/model/usePlayerMovement";
import { useZoneInteraction } from "@/features/zone-interaction/model/useZoneInteraction";
import { DialogueModal } from "@/features/dialogue/ui/DialogueModal";
import { PingPongDialogue } from "@/features/dialogue/ui/PingPongDialogue";
import { PingPongOverlay } from "@/features/ping-pong/ui/PingPongOverlay";
import { BottomQuestionPanel } from "@/widgets/bottom-question-panel/ui/BottomQuestionPanel";
import { BonusXpToast } from "@/widgets/game-hud/ui/BonusXpToast";
import { GameHud } from "@/widgets/game-hud/ui/GameHud";
import { InteractionButton } from "@/widgets/game-hub/ui/InteractionButton";
import { MobileControls } from "@/widgets/game-hub/ui/MobileControls";
import {
  FinalFeedbackOverlay,
  FinalSummaryOverlay,
} from "@/widgets/final-overlay/ui/FinalOverlay";
import { PlayerScene } from "@/widgets/player-scene/ui/PlayerScene";
import { useGameSession } from "@/processes/game-session/model/useGameSession";
import styles from "./GameHub.module.scss";

export function GameHub() {
  const [catPetPulse, setCatPetPulse] = useState(0);
  const [isPingPongActive, setIsPingPongActive] = useState(false);
  const {
    position,
    facing,
    isMoving,
    setDirectionPressed,
    clearDirections,
  } = usePlayerMovement({
    bounds: roomBounds,
    initialPosition: { x: 0, z: 3.2 },
    speed: 4.5,
    isInputLocked: isPingPongActive,
  });
  const { activeZone: activeNpc, canInteract } = useZoneInteraction(
    position,
    gameNpcs,
    1.65
  );
  const activePromptNpc = canInteract ? activeNpc : null;
  const {
    openedNpc,
    currentStage,
    scores,
    level,
    completedNpcSlugs,
    dialogueContent,
    promptContent,
    stageOutcome,
    timerRemaining,
    finalStep,
    feedback,
    bonusXpNotice,
    quickDuelState,
    quickDuelCompletedSlugs,
    pingPongState,
    pingPongCompletedSlugs,
    setFeedback,
    startInteraction,
    startFreePingPong,
    closeDialogue,
    closeQuickDuel,
    closePingPong,
    chooseDialogueOption,
    continueDialogue,
    answerQuickDuel,
    finishPingPong,
    moveToFeedback,
    finishFeedback,
  } = useGameSession(gameNpcs, activePromptNpc);

  useEffect(() => {
    setIsPingPongActive(Boolean(pingPongState));
  }, [pingPongState]);

  const catDistance = useMemo(
    () =>
      Math.hypot(position.x - catCompanion.position.x, position.z - catCompanion.position.z),
    [position.x, position.z]
  );
  const canPetCat = catDistance <= catCompanion.activationRadius;
  const speedNpc = useMemo(
    () => gameNpcs.find((npc) => npc.slug === "speed") ?? null,
    []
  );
  const pingPongTableDistance = useMemo(
    () =>
      Math.hypot(
        position.x - pingPongArcadeCorner.position.x,
        position.z - pingPongArcadeCorner.position.z
      ),
    [position.x, position.z]
  );
  const canInteractWithPingPongTable =
    pingPongTableDistance <= pingPongArcadeCorner.activationRadius;
  const isAnyOverlayOpen = Boolean(openedNpc || quickDuelState || pingPongState || finalStep);
  const shouldShowTablePrompt =
    canInteractWithPingPongTable && !activePromptNpc && !isAnyOverlayOpen && Boolean(speedNpc);
  const shouldShowCatPrompt =
    canPetCat && !activePromptNpc && !shouldShowTablePrompt && !isAnyOverlayOpen;

  const promptOverride = useMemo(() => {
    if (shouldShowCatPrompt) {
      return {
        eyebrow: catCompanion.sectorCode,
        title: catCompanion.name,
        role: `${catCompanion.role} · ${catCompanion.valueLabel}`,
        text: catCompanion.description,
        status: catCompanion.promptText,
      };
    }

    if (
      !openedNpc &&
      activePromptNpc?.pingPong &&
      !pingPongCompletedSlugs.includes(activePromptNpc.slug)
    ) {
      return {
        eyebrow: activePromptNpc.sectorCode,
        title: `${activePromptNpc.name} · pong arena`,
        role: `${activePromptNpc.role} · arcade challenge`,
        text: activePromptNpc.pingPong.intro,
        status: "Нажмите E / У, чтобы сыграть в пинг-понг",
      };
    }

    if (shouldShowTablePrompt) {
      return {
        eyebrow: "arcade_01",
        title: "Pong table",
        role: "arcade zone · free play",
        text: "Здесь можно сыграть быстрый матч в пинг-понг просто так, без влияния на квест Сони.",
        status: "Нажмите E / У, чтобы начать свободную игру",
      };
    }

    if (
      !openedNpc &&
      activePromptNpc?.quickDuel &&
      !quickDuelCompletedSlugs.includes(activePromptNpc.slug)
    ) {
      return {
        eyebrow: activePromptNpc.sectorCode,
        title: `${activePromptNpc.name} · rapid sync`,
        role: `${activePromptNpc.role} · пинг-понг вопросов`,
        text: activePromptNpc.quickDuel.intro,
        status: "Нажмите E / У, чтобы начать быстрый раунд",
      };
    }

    return null;
  }, [
    activePromptNpc,
    openedNpc,
    pingPongCompletedSlugs,
    quickDuelCompletedSlugs,
    shouldShowTablePrompt,
    shouldShowCatPrompt,
  ]);

  const interactionButtonCopy = useMemo(() => {
    if (shouldShowCatPrompt) {
      return {
        title: "Погладить",
        hint: catCompanion.interactionHint,
      };
    }

    if (shouldShowTablePrompt) {
      return {
        title: "Играть",
        hint: "Запустить свободный матч в пинг-понг",
      };
    }

    if (
      activePromptNpc?.pingPong &&
      !pingPongCompletedSlugs.includes(activePromptNpc.slug)
    ) {
      return {
        title: "Пинг-понг",
        hint: "Запустить arcade матч до 3 очков",
      };
    }

    if (
      activePromptNpc?.quickDuel &&
      !quickDuelCompletedSlugs.includes(activePromptNpc.slug)
    ) {
      return {
        title: "Рапид-раунд",
        hint: "Запустить пинг-понг с bonus XP",
      };
    }

    return {
      title: "Диалог",
      hint: "Открыть разговор с NPC",
    };
  }, [
    activePromptNpc,
    pingPongCompletedSlugs,
    quickDuelCompletedSlugs,
    shouldShowCatPrompt,
    shouldShowTablePrompt,
  ]);

  const handleClosePingPong = useCallback(() => {
    setIsPingPongActive(false);
    closePingPong();
  }, [closePingPong]);

  const handleFinishPingPong = useCallback(
    (result: {
      playerScore: number;
      opponentScore: number;
      didWin: boolean;
      isFlawless: boolean;
      durationMs: number;
    }) => {
      setIsPingPongActive(false);

      if (!pingPongState) {
        return;
      }

      finishPingPong(pingPongState.npc, result);
    },
    [finishPingPong, pingPongState]
  );

  const handleInteract = useCallback(() => {
    if (openedNpc || quickDuelState || pingPongState || finalStep) {
      return;
    }

    if (shouldShowCatPrompt) {
      setCatPetPulse((current) => current + 1);
      return;
    }

    if (shouldShowTablePrompt && speedNpc) {
      setIsPingPongActive(true);
      clearDirections();
      startFreePingPong(speedNpc);
      return;
    }

    if (!canInteract || !activeNpc) {
      return;
    }

    if (activeNpc.pingPong && !pingPongCompletedSlugs.includes(activeNpc.slug)) {
      setIsPingPongActive(true);
      clearDirections();
    }

    startInteraction(activeNpc);
  }, [
    activeNpc,
    canInteract,
    clearDirections,
    finalStep,
    openedNpc,
    pingPongCompletedSlugs,
    pingPongState,
    quickDuelState,
    shouldShowTablePrompt,
    shouldShowCatPrompt,
    speedNpc,
    startFreePingPong,
    startInteraction,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !openedNpc &&
        !quickDuelState &&
        !pingPongState &&
        !finalStep &&
        (shouldShowCatPrompt || shouldShowTablePrompt || (canInteract && activeNpc)) &&
        isInteractionKey(event)
      ) {
        handleInteract();
      }

      if (event.key === "Escape") {
        if (quickDuelState) {
          closeQuickDuel();
          return;
        }

        if (pingPongState) {
          handleClosePingPong();
          return;
        }

        closeDialogue();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [
    activeNpc,
    canInteract,
    closeDialogue,
    closeQuickDuel,
    finalStep,
    handleInteract,
    handleClosePingPong,
    openedNpc,
    pingPongState,
    quickDuelState,
    shouldShowTablePrompt,
    shouldShowCatPrompt,
  ]);

  useEffect(
    () => () => {
      clearDirections();
    },
    [clearDirections]
  );

  useEffect(() => {
    if (openedNpc || quickDuelState || pingPongState) {
      clearDirections();
    }
  }, [clearDirections, openedNpc, pingPongState, quickDuelState]);

  return (
    <main className={styles.hub}>
      <PlayerScene
        playerPosition={position}
        playerFacing={facing}
        isMoving={isMoving}
        activeNpcSlug={activePromptNpc?.slug}
        npcs={gameNpcs}
        catIsNearby={shouldShowCatPrompt}
        catPetPulse={catPetPulse}
        hidePosters={Boolean(pingPongState)}
      />

      <div className={styles.hub__overlay}>
        <div className={styles.hub__top}>
          <GameHud
            reputation={scores.reputation}
            responsibility={scores.responsibility}
            transparency={scores.transparency}
            speed={scores.speed}
            quality={scores.quality}
            xp={scores.xp}
            level={level}
            completedQuests={completedNpcSlugs.length}
            totalQuests={gameNpcs.length}
            timerRemaining={timerRemaining}
          />

          <Link className={styles.hub__back} href="/">
            В меню
          </Link>
        </div>

        <div className={styles.hub__legend}>
          <span>Подойди к NPC</span>
          <span>Нажми E или У для действия</span>
          <span>Ошибки не завершают игру, но меняют метрики</span>
        </div>

        <div className={styles.hub__bottom}>
          <BottomQuestionPanel
            npc={!openedNpc && !shouldShowCatPrompt ? activePromptNpc : null}
            generatedDescription={promptContent?.description ?? null}
            isCompleted={activePromptNpc ? completedNpcSlugs.includes(activePromptNpc.slug) : false}
            promptOverride={!openedNpc ? promptOverride : null}
          />
          <InteractionButton
            visible={
              !openedNpc &&
              !quickDuelState &&
              !pingPongState &&
              (canInteract || shouldShowCatPrompt || shouldShowTablePrompt)
            }
            disabled={!canInteract && !shouldShowCatPrompt && !shouldShowTablePrompt}
            onInteract={handleInteract}
            title={interactionButtonCopy.title}
            hint={interactionButtonCopy.hint}
          />
        </div>

        {!openedNpc && !quickDuelState && !pingPongState ? (
          <div className={styles.hub__mobileControls}>
            <div className={styles.hub__mobileControlsLeft}>
              <MobileControls
                onDirectionChange={setDirectionPressed}
                onReleaseAll={clearDirections}
              />
            </div>

            <div className={styles.hub__mobileControlsRight}>
              <BottomQuestionPanel
                npc={!shouldShowCatPrompt ? activePromptNpc : null}
                generatedDescription={promptContent?.description ?? null}
                isCompleted={
                  activePromptNpc ? completedNpcSlugs.includes(activePromptNpc.slug) : false
                }
                compact
                promptOverride={promptOverride}
              />
              <InteractionButton
                visible={canInteract || shouldShowCatPrompt || shouldShowTablePrompt}
                disabled={!canInteract && !shouldShowCatPrompt && !shouldShowTablePrompt}
                onInteract={handleInteract}
                title={interactionButtonCopy.title}
                hint={interactionButtonCopy.hint}
              />
            </div>
          </div>
        ) : null}
      </div>

      {bonusXpNotice ? (
        <BonusXpToast amount={bonusXpNotice.amount} label={bonusXpNotice.label} />
      ) : null}

      {openedNpc && currentStage ? (
        <div className={styles.hub__dialogLayer}>
          <DialogueModal
            npc={openedNpc}
            stageIndex={openedNpc ? (openedNpc.stages.indexOf(currentStage)) : 0}
            totalStages={openedNpc.stages.length}
            generatedHeader={dialogueContent?.header ?? null}
            generatedMessage={dialogueContent?.message ?? null}
            selectedChoiceId={stageOutcome?.choiceId ?? null}
            responseText={stageOutcome?.response ?? null}
            hintText={stageOutcome?.hint ?? null}
            canRetry={stageOutcome?.canRetry ?? false}
            canAdvance={stageOutcome?.willAdvance ?? false}
            isCompleted={stageOutcome?.willCompleteNpc ?? false}
            onChoose={chooseDialogueOption}
            onContinue={continueDialogue}
            onClose={closeDialogue}
          />
        </div>
      ) : null}

      {quickDuelState ? (
        <div className={styles.hub__dialogLayer}>
          <PingPongDialogue
            npc={quickDuelState.npc}
            intro={quickDuelState.npc.quickDuel?.intro ?? ""}
            questionIndex={quickDuelState.questionIndex}
            totalQuestions={quickDuelState.totalQuestions}
            prompt={quickDuelState.question.prompt}
            options={quickDuelState.question.options}
            timeRemaining={quickDuelState.timeRemaining}
            outcome={quickDuelState.outcome}
            totalBonusXp={quickDuelState.totalBonusXp}
            onChoose={answerQuickDuel}
            onClose={closeQuickDuel}
          />
        </div>
      ) : null}

      {pingPongState ? (
        <PingPongOverlay
          npc={pingPongState.npc}
          onClose={handleClosePingPong}
          onFinish={handleFinishPingPong}
        />
      ) : null}

      {finalStep === "summary" ? (
        <FinalSummaryOverlay
          reputation={scores.reputation}
          level={level}
          onContinue={moveToFeedback}
        />
      ) : null}

      {finalStep === "feedback" ? (
        <FinalFeedbackOverlay
          feedback={feedback}
          onChange={setFeedback}
          onSubmit={finishFeedback}
        />
      ) : null}
    </main>
  );
}
