import { renderHook } from "@testing-library/react";
import { gameNpcs } from "@/shared/config/game-npcs";
import { useZoneInteraction } from "./useZoneInteraction";

describe("useZoneInteraction", () => {
  it("returns the nearest NPC inside the activation radius", () => {
    const { result } = renderHook(() =>
      useZoneInteraction({ x: -4.2, z: 1.9 }, gameNpcs, 1.65)
    );

    expect(result.current.canInteract).toBe(true);
    expect(result.current.activeZone?.slug).toBe("responsibility");
  });

  it("returns no active NPC when the player is too far away", () => {
    const { result } = renderHook(() =>
      useZoneInteraction({ x: 8, z: 8 }, gameNpcs, 1.65)
    );

    expect(result.current.canInteract).toBe(false);
    expect(result.current.activeZone).toBeNull();
  });
});
