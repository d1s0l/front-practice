import type { AnchorHTMLAttributes } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { gameNpcs } from "@/shared/config/game-npcs";
import { catCompanion } from "@/shared/config/world-objects";
import { GameHub } from "./GameHub";

const openNpcMock = vi.fn();
const startInteractionMock = vi.fn();
const closeDialogueMock = vi.fn();
const clearDirectionsMock = vi.fn();
const setDirectionPressedMock = vi.fn();
const chooseDialogueOptionMock = vi.fn();
const continueDialogueMock = vi.fn();
const setFeedbackMock = vi.fn();
const moveToFeedbackMock = vi.fn();
const finishFeedbackMock = vi.fn();

const baseSessionState = {
  openedNpc: null,
  currentStage: null,
  scores: {
    reputation: 64,
    responsibility: 50,
    transparency: 50,
    speed: 50,
    quality: 50,
    xp: 0,
  },
  level: 1,
  completedNpcSlugs: [] as string[],
  dialogueContent: null,
  promptContent: { title: gameNpcs[0].valueLabel, description: gameNpcs[0].description },
  stageOutcome: null,
  timerRemaining: null,
  finalStep: null as "summary" | "feedback" | "done" | null,
  feedback: "",
  setFeedback: setFeedbackMock,
  openNpc: openNpcMock,
  startInteraction: startInteractionMock,
  closeDialogue: closeDialogueMock,
  closeQuickDuel: vi.fn(),
  clearBonusXpNotice: vi.fn(),
  chooseDialogueOption: chooseDialogueOptionMock,
  continueDialogue: continueDialogueMock,
  answerQuickDuel: vi.fn(),
  continueQuickDuel: vi.fn(),
  moveToFeedback: moveToFeedbackMock,
  finishFeedback: finishFeedbackMock,
  bonusXpNotice: null,
  quickDuelState: null,
  quickDuelCompletedSlugs: [] as string[],
};

let sessionState = { ...baseSessionState };
let movementState = {
  position: { x: 0, z: 0 },
  facing: "down",
  isMoving: false,
  setDirectionPressed: setDirectionPressedMock,
  clearDirections: clearDirectionsMock,
} as const;
let zoneState = {
  activeZone: gameNpcs[0],
  canInteract: true,
} as { activeZone: (typeof gameNpcs)[number] | null; canInteract: boolean };

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/widgets/player-scene/ui/PlayerScene", () => ({
  PlayerScene: () => <div data-testid="player-scene" />,
}));

vi.mock("@/widgets/game-hub/ui/MobileControls", () => ({
  MobileControls: () => <div data-testid="mobile-controls" />,
}));

vi.mock("@/features/player-movement/model/usePlayerMovement", () => ({
  usePlayerMovement: () => movementState,
}));

vi.mock("@/features/zone-interaction/model/useZoneInteraction", () => ({
  useZoneInteraction: () => zoneState,
}));

vi.mock("@/processes/game-session/model/useGameSession", () => ({
  useGameSession: () => sessionState,
}));

describe("GameHub", () => {
  beforeEach(() => {
    sessionState = { ...baseSessionState };
    movementState = {
      position: { x: 0, z: 0 },
      facing: "down",
      isMoving: false,
      setDirectionPressed: setDirectionPressedMock,
      clearDirections: clearDirectionsMock,
    };
    zoneState = {
      activeZone: gameNpcs[0],
      canInteract: true,
    };
    vi.clearAllMocks();
  });

  it("shows the interaction CTA near an active NPC and opens the dialogue on click", () => {
    render(<GameHub />);

    expect(screen.getByTestId("player-scene")).toBeInTheDocument();
    expect(screen.getAllByText(gameNpcs[0].name)).toHaveLength(2);

    const button = screen.getByRole("button", { name: /диалог/i });
    expect(button).toBeEnabled();

    fireEvent.click(button);

    expect(startInteractionMock).toHaveBeenCalledWith(gameNpcs[0]);
  });

  it("renders the dialogue modal when an NPC conversation is open", () => {
    sessionState = {
      ...baseSessionState,
      openedNpc: gameNpcs[0],
      currentStage: gameNpcs[0].stages[0],
      dialogueContent: {
        header: "Header",
        message: "Message",
      },
    };

    render(<GameHub />);

    expect(screen.getByLabelText("Диалог с NPC")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(closeDialogueMock).toHaveBeenCalled();
  });

  it("renders the final summary overlay and moves to feedback on action", () => {
    sessionState = {
      ...baseSessionState,
      finalStep: "summary",
      scores: {
        ...baseSessionState.scores,
        reputation: 96,
      },
      level: 4,
    };

    render(<GameHub />);

    expect(screen.getByText(/прошёл все миссии/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /дальше/i }));

    expect(moveToFeedbackMock).toHaveBeenCalled();
  });

  it("shows the cat interaction prompt when the player is near the cat and no npc is active", () => {
    zoneState = {
      activeZone: null,
      canInteract: false,
    };
    movementState = {
      ...movementState,
      position: {
        x: catCompanion.position.x,
        z: catCompanion.position.z,
      },
    };

    render(<GameHub />);

    expect(screen.getAllByText(catCompanion.name)).toHaveLength(2);
    expect(screen.getAllByText(/погладить кота/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /погладить/i })).toBeInTheDocument();
  });
});
