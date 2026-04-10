"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";
import { gameNpcs } from "@/shared/config/game-npcs";
import { isInteractionKey } from "@/shared/lib/controls";
import { usePlayerMovement } from "@/features/player-movement/model/usePlayerMovement";
import { useZoneInteraction } from "@/features/zone-interaction/model/useZoneInteraction";
import { DialogueModal } from "@/features/dialogue/ui/DialogueModal";
import { BottomQuestionPanel } from "@/widgets/bottom-question-panel/ui/BottomQuestionPanel";
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

const movementBounds = {
  minX: -6.6,
  maxX: 6.6,
  minZ: -4.2,
  maxZ: 4.2,
};

export function GameHub() {
  const {
    position,
    facing,
    isMoving,
    setDirectionPressed,
    clearDirections,
  } = usePlayerMovement({
    bounds: movementBounds,
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
    setFeedback,
    openNpc,
    closeDialogue,
    chooseDialogueOption,
    continueDialogue,
    moveToFeedback,
    finishFeedback,
  } = useGameSession(gameNpcs, activePromptNpc);

  const handleInteract = useCallback(() => {
    if (!canInteract || !activeNpc || openedNpc) {
      return;
    }

    openNpc(activeNpc);
  }, [activeNpc, canInteract, openNpc, openedNpc]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (canInteract && activeNpc && !openedNpc && isInteractionKey(event)) {
        handleInteract();
      }

      if (event.key === "Escape") {
        closeDialogue();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeNpc, canInteract, closeDialogue, handleInteract, openedNpc]);

  useEffect(
    () => () => {
      clearDirections();
    },
    [clearDirections]
  );

  useEffect(() => {
    if (openedNpc) {
      clearDirections();
    }
  }, [clearDirections, openedNpc]);

  return (
    <main className={styles.hub}>
      <PlayerScene
        playerPosition={position}
        playerFacing={facing}
        isMoving={isMoving}
        activeNpcSlug={activePromptNpc?.slug}
        npcs={gameNpcs}
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
          <span>Нажми E или У для диалога</span>
          <span>Ошибки не завершают игру, но меняют метрики</span>
        </div>

        <div className={styles.hub__bottom}>
          <BottomQuestionPanel
            npc={!openedNpc ? activePromptNpc : null}
            generatedDescription={promptContent?.description ?? null}
            isCompleted={activePromptNpc ? completedNpcSlugs.includes(activePromptNpc.slug) : false}
          />
          <InteractionButton
            visible={!openedNpc && canInteract}
            disabled={!canInteract}
            onInteract={handleInteract}
          />
        </div>

        {!openedNpc ? (
          <div className={styles.hub__mobileControls}>
            <div className={styles.hub__mobileControlsLeft}>
              <MobileControls
                onDirectionChange={setDirectionPressed}
                onReleaseAll={clearDirections}
              />
            </div>

            <div className={styles.hub__mobileControlsRight}>
              <BottomQuestionPanel
                npc={activePromptNpc}
                generatedDescription={promptContent?.description ?? null}
                isCompleted={
                  activePromptNpc ? completedNpcSlugs.includes(activePromptNpc.slug) : false
                }
                compact
              />
              <InteractionButton
                visible={canInteract}
                disabled={!canInteract}
                onInteract={handleInteract}
              />
            </div>
          </div>
        ) : null}
      </div>

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
