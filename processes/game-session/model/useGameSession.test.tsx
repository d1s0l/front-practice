import { act, renderHook } from "@testing-library/react";
import { gameNpcs } from "@/shared/config/game-npcs";
import { useGameSession } from "./useGameSession";

describe("useGameSession", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies a selected answer, updates score and advances the dialogue stage", () => {
    const { result } = renderHook(() => useGameSession(gameNpcs, null));

    act(() => {
      result.current.openNpc(gameNpcs[0]);
    });

    expect(result.current.openedNpc?.slug).toBe("responsibility");
    expect(result.current.currentStage?.id).toBe("owner");

    act(() => {
      result.current.chooseDialogueOption("owner-sync");
    });

    expect(result.current.stageOutcome?.choiceId).toBe("owner-sync");
    expect(result.current.stageOutcome?.willAdvance).toBe(true);
    expect(result.current.scores.reputation).toBe(72);
    expect(result.current.scores.responsibility).toBe(62);
    expect(result.current.scores.xp).toBe(26);

    act(() => {
      result.current.continueDialogue();
    });

    expect(result.current.stageOutcome).toBeNull();
    expect(result.current.currentStage?.id).toBe("recovery");
  });

  it("reaches the final summary after all NPC branches are completed", () => {
    const { result } = renderHook(() => useGameSession(gameNpcs, null));

    for (const npc of gameNpcs) {
      act(() => {
        result.current.openNpc(npc);
      });

      for (let index = 0; index < npc.stages.length; index += 1) {
        const advancingChoice = result.current.currentStage?.choices.find((choice) => choice.advances);

        expect(advancingChoice).toBeDefined();

        act(() => {
          result.current.chooseDialogueOption(advancingChoice!.id);
        });

        expect(result.current.stageOutcome?.willAdvance).toBe(true);

        act(() => {
          result.current.continueDialogue();
        });
      }
    }

    expect(result.current.completedNpcSlugs).toHaveLength(gameNpcs.length);
    expect(result.current.finalStep).toBe("summary");
    expect(result.current.level).toBeGreaterThan(1);
    expect(result.current.scores.reputation).toBeGreaterThan(64);
  });

  it("applies the timeout outcome for timed stages", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T12:00:00Z"));

    const { result } = renderHook(() => useGameSession(gameNpcs, null));

    act(() => {
      result.current.openNpc(gameNpcs[2]);
    });

    expect(result.current.currentStage?.id).toBe("timer-mvp");
    expect(result.current.timerRemaining).toBe(18);

    act(() => {
      vi.advanceTimersByTime(18_250);
    });

    expect(result.current.stageOutcome?.choiceId).toBe("timeout");
    expect(result.current.stageOutcome?.canRetry).toBe(true);
    expect(result.current.stageOutcome?.willAdvance).toBe(false);
    expect(result.current.scores.speed).toBe(44);
  });

  it("clears the active dialogue state when closing the modal", () => {
    const { result } = renderHook(() => useGameSession(gameNpcs, null));

    act(() => {
      result.current.openNpc(gameNpcs[1]);
    });

    act(() => {
      result.current.chooseDialogueOption("client-open");
    });

    expect(result.current.openedNpc?.slug).toBe("transparency");
    expect(result.current.stageOutcome?.choiceId).toBe("client-open");

    act(() => {
      result.current.closeDialogue();
    });

    expect(result.current.openedNpc).toBeNull();
    expect(result.current.stageOutcome).toBeNull();
    expect(result.current.timerRemaining).toBeNull();
  });

  it("starts the quick duel for configured npc and grants bonus xp for a fast correct answer", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T12:00:00Z"));

    const { result } = renderHook(() => useGameSession(gameNpcs, null));

    act(() => {
      result.current.startInteraction(gameNpcs[1]);
    });

    expect(result.current.quickDuelState?.npc.slug).toBe("transparency");
    expect(result.current.quickDuelState?.questionIndex).toBe(0);

    act(() => {
      result.current.answerQuickDuel("sync-open-plan");
    });

    expect(result.current.quickDuelState?.outcome?.isCorrect).toBe(true);
    expect(result.current.quickDuelState?.outcome?.isFast).toBe(true);
    expect(result.current.quickDuelState?.outcome?.awardedXp).toBe(23);
    expect(result.current.bonusXpNotice?.amount).toBe(23);
    expect(result.current.scores.xp).toBe(23);
  });
});
