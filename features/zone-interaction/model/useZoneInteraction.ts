"use client";

import { useMemo } from "react";
import type { PlayerPosition } from "@/entities/player/model/types";
import type { GameNpc } from "@/shared/config/game-npcs";

type ZoneInteractionState = {
  activeZone: GameNpc | null;
  canInteract: boolean;
};

export function useZoneInteraction(
  playerPosition: PlayerPosition,
  zones: GameNpc[],
  activationRadius = 1.9
): ZoneInteractionState {
  return useMemo(() => {
    const nearest = zones
      .map((zone) => ({
        zone,
        distance: Math.hypot(
          playerPosition.x - zone.position.x,
          playerPosition.z - zone.position.z
        ),
      }))
      .sort((left, right) => left.distance - right.distance)[0];

    if (!nearest || nearest.distance > activationRadius) {
      return {
        activeZone: null,
        canInteract: false,
      };
    }

    return {
      activeZone: nearest.zone,
      canInteract: true,
    };
  }, [activationRadius, playerPosition.x, playerPosition.z, zones]);
}
