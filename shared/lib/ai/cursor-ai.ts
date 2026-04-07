import type { GameNpc, NpcChoice, NpcStage } from "@/shared/config/game-npcs";

type DialogueResult = {
  header: string;
  message: string;
};

export function generateDialogue(npc: GameNpc, stage: NpcStage): DialogueResult {
  return {
    header: `${npc.name} анализирует ситуацию через призму ценности "${npc.valueLabel}".`,
    message: `${stage.situation} Цель этапа: ${stage.objective} ${stage.question}`,
  };
}

export function generateQuestText(
  npc: GameNpc,
  stage: NpcStage,
  isCompleted: boolean
) {
  return {
    title: isCompleted ? `${npc.valueLabel}: сектор закрыт` : npc.valueLabel,
    description: isCompleted
      ? `${npc.name} уже принял твои решения по этой ветке. Можно вернуться за разбором или перейти к следующему NPC.`
      : `${npc.description} Текущий этап: ${stage.objective}`,
  };
}

export function generateHint(
  npc: GameNpc,
  stage: NpcStage,
  choice: Pick<NpcChoice, "tone" | "hintSeed">
) {
  const tonePrefix =
    choice.tone === "good"
      ? "Cursor AI: решение усиливает сильную практику."
      : choice.tone === "neutral"
        ? "Cursor AI: решение рабочее, но в нём есть компромисс."
        : "Cursor AI: это безопасная ошибка, из неё можно вынести полезный урок.";

  return `${tonePrefix} Подсказка для "${npc.valueLabel}": ${choice.hintSeed}. В контексте этапа "${stage.objective}" ищи баланс между скоростью, качеством и открытым общением.`;
}

export function generateOutcomeText(
  npc: GameNpc,
  stage: NpcStage,
  responseSeed: string
): string {
  return `${npc.name}: ${responseSeed}. Этап "${stage.id}" завершён с учётом контекста "${stage.objective}".`;
}
