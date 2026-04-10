import { render, screen } from "@testing-library/react";
import { GameHud } from "./GameHud";

describe("GameHud", () => {
  it("renders player metrics, progress and timer", () => {
    render(
      <GameHud
        reputation={92}
        responsibility={61}
        transparency={58}
        speed={73}
        quality={69}
        xp={120}
        level={3}
        completedQuests={2}
        totalQuests={3}
        timerRemaining={14}
      />
    );

    expect(screen.getByText("Value Runner")).toBeInTheDocument();
    expect(screen.getByText("Lv.3 / XP 120")).toBeInTheDocument();
    expect(screen.getByText("2/3")).toBeInTheDocument();
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("14s")).toBeInTheDocument();
    expect(screen.getByText(/WASD/i)).toBeInTheDocument();
  });
});
