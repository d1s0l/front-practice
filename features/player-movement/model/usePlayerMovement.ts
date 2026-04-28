"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "@/shared/lib/clamp";
import {
  getMovementDirectionFromKeyboard,
  type MovementDirection,
} from "@/shared/lib/controls";
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
  isInputLocked?: boolean;
};

type MovementState = {
  position: PlayerPosition;
  facing: PlayerFacing;
  isMoving: boolean;
};

type UsePlayerMovementResult = MovementState & {
  setDirectionPressed: (direction: MovementDirection, pressed: boolean) => void;
  clearDirections: () => void;
};

export function usePlayerMovement({
  bounds,
  initialPosition = { x: 0, z: 2.2 },
  speed = 4.2,
  isInputLocked = false,
}: UsePlayerMovementOptions): UsePlayerMovementResult {
  const [state, setState] = useState<MovementState>({
    position: initialPosition,
    facing: "down",
    isMoving: false,
  });
  const pressedDirections = useRef(new Set<MovementDirection>());
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const setDirectionPressed = useCallback(
    (direction: MovementDirection, pressed: boolean) => {
      if (pressed) {
        pressedDirections.current.add(direction);
        return;
      }

      pressedDirections.current.delete(direction);
    },
    []
  );
  const clearDirections = useCallback(() => {
    pressedDirections.current.clear();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isInputLocked) {
        return;
      }

      const mapped = getMovementDirectionFromKeyboard(event);

      if (!mapped) {
        return;
      }

      pressedDirections.current.add(mapped);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (isInputLocked) {
        return;
      }

      const mapped = getMovementDirectionFromKeyboard(event);

      if (!mapped) {
        return;
      }

      pressedDirections.current.delete(mapped);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [isInputLocked]);

  useEffect(() => {
    if (!isInputLocked) {
      return;
    }

    pressedDirections.current.clear();
    previousTimeRef.current = null;
    setState((current) => (current.isMoving ? { ...current, isMoving: false } : current));
  }, [isInputLocked]);

  useEffect(() => {
    const tick = (time: number) => {
      const previousTime = previousTimeRef.current ?? time;
      const delta = (time - previousTime) / 1000;
      previousTimeRef.current = time;

      const directionX =
        (pressedDirections.current.has("right") ? 1 : 0) -
        (pressedDirections.current.has("left") ? 1 : 0);
      const directionZ =
        (pressedDirections.current.has("down") ? 1 : 0) -
        (pressedDirections.current.has("up") ? 1 : 0);
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
            x: nextX,
            z: nextZ,
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

  return {
    ...state,
    setDirectionPressed,
    clearDirections,
  };
}
