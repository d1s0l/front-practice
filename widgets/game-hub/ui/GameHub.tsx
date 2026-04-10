"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { gameNpcs } from "@/shared/config/game-npcs";
import { isInteractionKey } from "@/shared/lib/controls";
import { catCompanion, roomBounds } from "@/shared/config/world-objects";
import { usePlayerMovement } from "@/features/player-movement/model/usePlayerMovement";
import { useZoneInteraction } from "@/features/zone-interaction/model/useZoneInteraction";
import { DialogueModal } from "@/features/dialogue/ui/DialogueModal";
import { PingPongDialogue } from "@/features/dialogue/ui/PingPongDialogue";
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
    setFeedback,
    startInteraction,
    closeDialogue,
    closeQuickDuel,
    chooseDialogueOption,
    continueDialogue,
    answerQuickDuel,
    continueQuickDuel,
    moveToFeedback,
    finishFeedback,
  } = useGameSession(gameNpcs, activePromptNpc);

  const catDistance = useMemo(
    () =>
      Math.hypot(position.x - catCompanion.position.x, position.z - catCompanion.position.z),
    [position.x, position.z]
  );
  const canPetCat = catDistance <= catCompanion.activationRadius;
  const isAnyOverlayOpen = Boolean(openedNpc || quickDuelState || finalStep);
  const shouldShowCatPrompt = canPetCat && !activePromptNpc && !isAnyOverlayOpen;

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
  }, [activePromptNpc, openedNpc, quickDuelCompletedSlugs, shouldShowCatPrompt]);

  const interactionButtonCopy = useMemo(() => {
    if (shouldShowCatPrompt) {
      return {
        title: "Погладить",
        hint: catCompanion.interactionHint,
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
  }, [activePromptNpc, quickDuelCompletedSlugs, shouldShowCatPrompt]);

  const handleInteract = useCallback(() => {
    if (openedNpc || quickDuelState || finalStep) {
      return;
    }

    if (shouldShowCatPrompt) {
      setCatPetPulse((current) => current + 1);
      return;
    }

    if (!canInteract || !activeNpc) {
      return;
    }

    startInteraction(activeNpc);
  }, [
    activeNpc,
    canInteract,
    finalStep,
    openedNpc,
    quickDuelState,
    shouldShowCatPrompt,
    startInteraction,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !openedNpc &&
        !quickDuelState &&
        !finalStep &&
        (shouldShowCatPrompt || (canInteract && activeNpc)) &&
        isInteractionKey(event)
      ) {
        handleInteract();
      }

      if (event.key === "Escape") {
        if (quickDuelState) {
          closeQuickDuel();
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
    openedNpc,
    quickDuelState,
    shouldShowCatPrompt,
  ]);

  useEffect(
    () => () => {
      clearDirections();
    },
    [clearDirections]
  );

  useEffect(() => {
    if (openedNpc || quickDuelState) {
      clearDirections();
    }
  }, [clearDirections, openedNpc, quickDuelState]);

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
            visible={!openedNpc && !quickDuelState && (canInteract || shouldShowCatPrompt)}
            disabled={!canInteract && !shouldShowCatPrompt}
            onInteract={handleInteract}
            title={interactionButtonCopy.title}
            hint={interactionButtonCopy.hint}
          />
        </div>

        {!openedNpc && !quickDuelState ? (
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
                visible={canInteract || shouldShowCatPrompt}
                disabled={!canInteract && !shouldShowCatPrompt}
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
            summary={quickDuelState.npc.quickDuel?.summary ?? ""}
            questionIndex={quickDuelState.questionIndex}
            totalQuestions={quickDuelState.totalQuestions}
            prompt={quickDuelState.question.prompt}
            options={quickDuelState.question.options}
            timeRemaining={quickDuelState.timeRemaining}
            outcome={quickDuelState.outcome}
            totalBonusXp={quickDuelState.totalBonusXp}
            onChoose={answerQuickDuel}
            onContinue={continueQuickDuel}
            onClose={closeQuickDuel}
          />
        </div>
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
