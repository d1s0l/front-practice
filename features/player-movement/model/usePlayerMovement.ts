"use client";

import { useEffect, useRef, useState } from "react";
import { clamp } from "@/shared/lib/clamp";
import { getMovementDirectionFromKeyboard } from "@/shared/lib/controls";
import type { PlayerFacing, PlayerPosition } from "@/entities/player/model/types";

type MovementBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

type UsePlayerMovementOptions = {
  initialPosition?: PlayerPosition;
  speed?: number;
  bounds: MovementBounds;
};

type MovementState = {
  position: PlayerPosition;
  facing: PlayerFacing;
  isMoving: boolean;
};

export function usePlayerMovement({
  bounds,
  initialPosition = { x: 0, z: 2.2 },
  speed = 4.2,
}: UsePlayerMovementOptions): MovementState {
  const [state, setState] = useState<MovementState>({
    position: initialPosition,
    facing: "down",
    isMoving: false,
  });
  const pressedKeys = useRef(new Set<string>());
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mapped = getMovementDirectionFromKeyboard(event);

      if (!mapped) {
        return;
      }

      pressedKeys.current.add(mapped);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const mapped = getMovementDirectionFromKeyboard(event);

      if (!mapped) {
        return;
      }

      pressedKeys.current.delete(mapped);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const tick = (time: number) => {
      const previousTime = previousTimeRef.current ?? time;
      const delta = (time - previousTime) / 1000;
      previousTimeRef.current = time;

      const directionX =
        (pressedKeys.current.has("right") ? 1 : 0) -
        (pressedKeys.current.has("left") ? 1 : 0);
      const directionZ =
        (pressedKeys.current.has("down") ? 1 : 0) -
        (pressedKeys.current.has("up") ? 1 : 0);
      const isMoving = directionX !== 0 || directionZ !== 0;

      setState((current) => {
        if (!isMoving) {
          if (!current.isMoving) {
            return current;
          }

          return { ...current, isMoving: false };
        }

        const normalizedLength = Math.hypot(directionX, directionZ) || 1;
        const nextX = clamp(
          current.position.x + (directionX / normalizedLength) * speed * delta,
          bounds.minX,
          bounds.maxX
        );
        const nextZ = clamp(
          current.position.z + (directionZ / normalizedLength) * speed * delta,
          bounds.minZ,
          bounds.maxZ
        );

        let facing = current.facing;

        if (Math.abs(directionX) > Math.abs(directionZ)) {
          facing = directionX > 0 ? "right" : "left";
        } else if (directionZ !== 0) {
          facing = directionZ > 0 ? "down" : "up";
        }

        if (
          current.position.x === nextX &&
          current.position.z === nextZ &&
          current.facing === facing &&
          current.isMoving
        ) {
          return current;
        }

        return {
          position: {
            x: Number(nextX.toFixed(3)),
            z: Number(nextZ.toFixed(3)),
          },
          facing,
          isMoving: true,
        };
      });

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [bounds.maxX, bounds.maxZ, bounds.minX, bounds.minZ, speed]);

  return state;
}
