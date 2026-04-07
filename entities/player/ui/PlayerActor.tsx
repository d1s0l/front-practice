"use client";

import { useMemo, useRef } from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import type { PlayerFacing, PlayerPosition } from "@/entities/player/model/types";

type PlayerActorProps = {
  position: PlayerPosition;
  facing: PlayerFacing;
  isMoving: boolean;
};

function getRotationByFacing(facing: PlayerFacing) {
  switch (facing) {
    case "up":
      return Math.PI;
    case "left":
      return Math.PI / 2;
    case "right":
      return -Math.PI / 2;
    default:
      return 0;
  }
}

export function PlayerActor({ position, facing, isMoving }: PlayerActorProps) {
  const groupRef = useRef<Group>(null);
  const targetRotation = useMemo(() => getRotationByFacing(facing), [facing]);

  useFrame((state) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    const bob = isMoving ? Math.sin(state.clock.elapsedTime * 10) * 0.04 : 0;
    group.position.set(position.x, 0.44 + bob, position.z);
    group.rotation.y += (targetRotation - group.rotation.y) * 0.16;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.72, 1.05, 0.58]} />
        <meshStandardMaterial color="#173459" />
      </mesh>
      <mesh position={[0, 1.26, 0]} castShadow>
        <boxGeometry args={[0.68, 0.62, 0.58]} />
        <meshStandardMaterial color="#f6c94d" />
      </mesh>
      <mesh position={[0, 1.22, 0.3]}>
        <boxGeometry args={[0.42, 0.18, 0.08]} />
        <meshStandardMaterial color="#79d7ff" emissive="#79d7ff" emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0.34]}>
        <boxGeometry args={[0.18, 0.18, 0.08]} />
        <meshStandardMaterial color="#f6c94d" emissive="#f6c94d" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, -0.02, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
