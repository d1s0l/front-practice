import { gameNpcs } from "@/shared/config/game-npcs";
import {
  generateDialogue,
  generateHint,
  generateOutcomeText,
  generateQuestText,
} from "./cursor-ai";

describe("cursor-ai helpers", () => {
  it("builds dialogue header and message from npc and stage data", () => {
    const npc = gameNpcs[0];
    const stage = npc.stages[0];

    const result = generateDialogue(npc, stage);

    expect(result.header).toContain(npc.name);
    expect(result.header).toContain(npc.valueLabel);
    expect(result.message).toContain(stage.situation);
    expect(result.message).toContain(stage.objective);
    expect(result.message).toContain(stage.question);
  });

  it("returns different quest copy for active and completed npc branches", () => {
    const npc = gameNpcs[1];
    const stage = npc.stages[0];

    const active = generateQuestText(npc, stage, false);
    const completed = generateQuestText(npc, stage, true);

    expect(active.title).toBe(npc.valueLabel);
    expect(active.description).toContain(stage.objective);
    expect(completed.title).toContain("сектор закрыт");
    expect(completed.description).toContain("уже принял твои решения");
  });

  it("adds a tone-aware hint and outcome summary", () => {
    const npc = gameNpcs[2];
    const stage = npc.stages[0];
    const choice = stage.choices[0];

    const hint = generateHint(npc, stage, choice);
    const outcome = generateOutcomeText(npc, stage, choice.responseSeed);

    expect(hint).toContain("Cursor AI");
    expect(hint).toContain(choice.hintSeed);
    expect(hint).toContain(stage.objective);
    expect(outcome).toContain(npc.name);
    expect(outcome).toContain(stage.id);
    expect(outcome).toContain(choice.responseSeed);
  });
});
