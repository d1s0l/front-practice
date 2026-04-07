"use client";

import { Canvas } from "@react-three/fiber";
import type { PlayerFacing, PlayerPosition } from "@/entities/player/model/types";
import { PlayerActor } from "@/entities/player/ui/PlayerActor";
import type { GameNpc } from "@/shared/config/game-npcs";
import styles from "./PlayerScene.module.scss";

type PlayerSceneProps = {
  playerPosition: PlayerPosition;
  playerFacing: PlayerFacing;
  isMoving: boolean;
  activeNpcSlug?: string;
  npcs: GameNpc[];
};

function NpcActor({ npc, isActive }: { npc: GameNpc; isActive: boolean }) {
  const colorMap = {
    gold: "#f6c94d",
    cyan: "#79d7ff",
    mint: "#73f2bd",
  } as const;

  const color = colorMap[npc.accent];

  return (
    <group position={[npc.position.x, 0, npc.position.z]}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <boxGeometry args={[0.68, 1.02, 0.58]} />
        <meshStandardMaterial color={isActive ? color : "#36567c"} />
      </mesh>
      <mesh position={[0, 1.24, 0]} castShadow>
        <boxGeometry args={[0.62, 0.58, 0.54]} />
        <meshStandardMaterial color={isActive ? "#f4f7fb" : "#9ce3ff"} />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <boxGeometry args={[0.3, 0.16, 0.3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 1.1 : 0.35}
        />
      </mesh>
      <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[isActive ? 0.58 : 0.48, 28]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 0.8 : 0.3} />
      </mesh>
    </group>
  );
}

function GameMapWorld({
  playerPosition,
  playerFacing,
  isMoving,
  activeNpcSlug,
  npcs,
}: PlayerSceneProps) {
  return (
    <>
      <color attach="background" args={["#08111f"]} />
      <fog attach="fog" args={["#08111f", 10, 24]} />
      <ambientLight intensity={1.25} />
      <directionalLight
        position={[7, 12, 4]}
        intensity={2.2}
        color="#f6c94d"
        castShadow
      />
      <directionalLight position={[-6, 10, -5]} intensity={1.8} color="#79d7ff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#10233d" />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#14213d" />
      </mesh>

      <mesh position={[0, 0.4, -5.1]} receiveShadow>
        <boxGeometry args={[16, 0.8, 0.8]} />
        <meshStandardMaterial color="#173459" />
      </mesh>
      <mesh position={[0, 0.4, 5.1]} receiveShadow>
        <boxGeometry args={[16, 0.8, 0.8]} />
        <meshStandardMaterial color="#173459" />
      </mesh>
      <mesh position={[-7.8, 0.4, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.8, 10.6]} />
        <meshStandardMaterial color="#173459" />
      </mesh>
      <mesh position={[7.8, 0.4, 0]} receiveShadow>
        <boxGeometry args={[0.8, 0.8, 10.6]} />
        <meshStandardMaterial color="#173459" />
      </mesh>

      <mesh position={[-4.5, 0.26, 2.5]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.5, 1.6]} />
        <meshStandardMaterial color="#2b4365" />
      </mesh>
      <mesh position={[0.2, 0.26, -2.1]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.5, 1.8]} />
        <meshStandardMaterial color="#264663" />
      </mesh>
      <mesh position={[4.4, 0.26, 2.2]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.5, 1.4]} />
        <meshStandardMaterial color="#24455d" />
      </mesh>

      {npcs.map((npc) => (
        <NpcActor key={npc.slug} npc={npc} isActive={npc.slug === activeNpcSlug} />
      ))}

      <PlayerActor
        position={playerPosition}
        facing={playerFacing}
        isMoving={isMoving}
      />
    </>
  );
}

export function PlayerScene(props: PlayerSceneProps) {
  return (
    <div className={styles.scene}>
      <Canvas
        shadows
        camera={{ position: [0, 10.8, 7.2], fov: 34 }}
        className={styles.scene__canvas}
      >
        <GameMapWorld {...props} />
      </Canvas>
    </div>
  );
}
