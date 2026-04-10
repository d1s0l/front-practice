"use client";

import {
  Clone,
  ContactShadows,
  Float,
  Html,
  PerspectiveCamera,
  Preload,
  RoundedBox,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group, MeshStandardMaterial, PerspectiveCamera as ThreePerspectiveCamera } from "three";
import type { PlayerFacing, PlayerPosition } from "@/entities/player/model/types";
import { PlayerActor } from "@/entities/player/ui/PlayerActor";
import type { GameNpc } from "@/shared/config/game-npcs";
import { clamp } from "@/shared/lib/clamp";
import { catCompanion, techPosters } from "@/shared/config/world-objects";
import styles from "./PlayerScene.module.scss";

type PlayerSceneProps = {
  playerPosition: PlayerPosition;
  playerFacing: PlayerFacing;
  isMoving: boolean;
  activeNpcSlug?: string;
  npcs: GameNpc[];
  catIsNearby: boolean;
  catPetPulse: number;
};

type Vec3Tuple = [number, number, number];
type HeartParticleModel = {
  id: string;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  driftX: number;
  scale: number;
  speed: number;
};

const cameraOffset = { x: 0, y: 9.4, z: 6.5 };
const lookAtHeight = 0.9;
const facingOffsetMap: Record<PlayerFacing, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-0.8, 0],
  right: [0.8, 0],
};

function FollowCamera({
  playerPosition,
  playerFacing,
}: Pick<PlayerSceneProps, "playerPosition" | "playerFacing">) {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const initialisedRef = useRef(false);
  const desiredCameraRef = useRef<Vec3Tuple>([0, 0, 0]);
  const desiredLookAtRef = useRef<Vec3Tuple>([0, lookAtHeight, 0]);
  const smoothedLookAtRef = useRef<Vec3Tuple>([0, lookAtHeight, 0]);

  useEffect(() => {
    if (initialisedRef.current) {
      return;
    }

    const camera = cameraRef.current;

    if (!camera) {
      return;
    }

    desiredCameraRef.current = [
      playerPosition.x + cameraOffset.x,
      cameraOffset.y,
      playerPosition.z + cameraOffset.z,
    ];
    desiredLookAtRef.current = [playerPosition.x, lookAtHeight, playerPosition.z];
    smoothedLookAtRef.current = [...desiredLookAtRef.current] as Vec3Tuple;
    camera.position.set(...desiredCameraRef.current);
    camera.lookAt(...smoothedLookAtRef.current);
    initialisedRef.current = true;
  }, [playerPosition.x, playerPosition.z]);

  useFrame((_, delta) => {
    const camera = cameraRef.current;

    if (!camera) {
      return;
    }

    const [facingOffsetX, facingOffsetZ] = facingOffsetMap[playerFacing];
    const desiredX = clamp(playerPosition.x, -4.6, 4.6);
    const desiredZ = clamp(playerPosition.z, -4.1, 4.1);

    desiredCameraRef.current = [
      desiredX + cameraOffset.x,
      cameraOffset.y,
      desiredZ + cameraOffset.z,
    ];
    desiredLookAtRef.current = [
      playerPosition.x + facingOffsetX,
      lookAtHeight,
      playerPosition.z + facingOffsetZ,
    ];

    if (!initialisedRef.current) {
      camera.position.set(...desiredCameraRef.current);
      smoothedLookAtRef.current = [...desiredLookAtRef.current] as Vec3Tuple;
      camera.lookAt(...smoothedLookAtRef.current);
      initialisedRef.current = true;
      return;
    }

    const positionSmoothing = 1 - Math.exp(-delta * 6.2);
    const lookAtSmoothing = 1 - Math.exp(-delta * 7.8);

    camera.position.x += (desiredCameraRef.current[0] - camera.position.x) * positionSmoothing;
    camera.position.y += (desiredCameraRef.current[1] - camera.position.y) * positionSmoothing;
    camera.position.z += (desiredCameraRef.current[2] - camera.position.z) * positionSmoothing;

    smoothedLookAtRef.current = smoothedLookAtRef.current.map((value, index) => {
      const nextValue = desiredLookAtRef.current[index] ?? value;

      return value + (nextValue - value) * lookAtSmoothing;
    }) as Vec3Tuple;

    camera.lookAt(...smoothedLookAtRef.current);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 9.4, 6.5]} fov={38} />;
}

function TechPoster({
  title,
  subtitle,
  position,
  rotation,
  accent,
}: (typeof techPosters)[number]) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[2.5, 1.55, 0.12]} radius={0.06} smoothness={4} castShadow>
        <meshStandardMaterial color="#112239" />
      </RoundedBox>
      <RoundedBox args={[2.34, 1.38, 0.04]} radius={0.04} smoothness={4} position={[0, 0, 0.07]}>
        <meshStandardMaterial color="#0d1728" emissive={accent} emissiveIntensity={0.05} />
      </RoundedBox>
      <Html transform position={[0, 0, 0.12]} distanceFactor={10}>
        <div
          style={{
            width: "170px",
            padding: "10px 12px",
            border: `1px solid ${accent}`,
            borderRadius: "10px",
            background: "rgba(8, 17, 31, 0.84)",
            boxShadow: `0 0 18px ${accent}33`,
            color: "#f4f7fb",
            fontFamily: "var(--font-display)",
          }}
        >
          <div
            style={{
              marginBottom: "8px",
              color: accent,
              fontSize: "9px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            poster
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.4 }}>{title}</div>
          <div
            style={{
              marginTop: "8px",
              color: "#9ce3ff",
              fontSize: "8px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
        </div>
      </Html>
    </group>
  );
}

function HeartParticle({
  particle,
  position,
}: {
  particle: HeartParticleModel;
  position: [number, number, number];
}) {
  const groupRef = useRef<Group>(null);
  const materialRefs = useRef<MeshStandardMaterial[]>([]);
  const startTimeRef = useRef<number | null>(null);

  useFrame((state) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const progress = Math.min(1, elapsed / 1.6);

    group.position.set(
      position[0] + particle.offsetX + particle.driftX * progress,
      position[1] + particle.offsetY + progress * particle.speed,
      position[2] + particle.offsetZ
    );
    group.scale.setScalar(particle.scale * (1 - progress * 0.22));
    materialRefs.current.forEach((material) => {
      material.opacity = Math.max(0, 0.95 - progress);
    });
  });

  return (
    <group ref={groupRef}>
      {[
        [0, 0.18, 0],
        [-0.18, 0, 0],
        [0.18, 0, 0],
        [0, -0.16, 0],
        [-0.12, -0.12, 0],
        [0.12, -0.12, 0],
      ].map((cubeOffset, index) => (
        <mesh
          key={`${particle.id}-${index}`}
          position={cubeOffset as [number, number, number]}
          scale={[0.12, 0.12, 0.12]}
        >
          <boxGeometry args={[1, 1, 0.4]} />
          <meshStandardMaterial
            ref={(material) => {
              if (material) {
                materialRefs.current[index] = material;
              }
            }}
            color="#ff7f96"
            emissive="#ff7f96"
            emissiveIntensity={0.55}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

function HeartParticles({
  pulse,
  position,
}: {
  pulse: number;
  position: [number, number, number];
}) {
  const particles = useMemo<HeartParticleModel[]>(
    () => [
      { id: "h1", offsetX: -0.26, offsetY: 1.42, offsetZ: 0.12, driftX: -0.18, scale: 1, speed: 1.15 },
      { id: "h2", offsetX: 0.08, offsetY: 1.3, offsetZ: -0.04, driftX: 0.08, scale: 0.82, speed: 0.98 },
      { id: "h3", offsetX: 0.3, offsetY: 1.56, offsetZ: 0.08, driftX: 0.2, scale: 0.92, speed: 1.22 },
    ],
    []
  );

  return (
    <group>
      {particles.map((particle) => (
        <HeartParticle
          key={`${particle.id}-${pulse}`}
          particle={particle}
          position={position}
        />
      ))}
    </group>
  );
}

function CatCompanion({
  isNearby,
  petPulse,
}: {
  isNearby: boolean;
  petPulse: number;
}) {
  const catGroupRef = useRef<Group>(null);
  const { scene } = useGLTF("/cat.glb");
  const catScene = useMemo(() => scene.clone(), [scene]);
  const lastPulseRef = useRef(petPulse);
  const petAnimationRef = useRef(0);

  useEffect(() => {
    if (petPulse > lastPulseRef.current) {
      petAnimationRef.current = 1.35;
      lastPulseRef.current = petPulse;
    }
  }, [petPulse]);

  useFrame((_, delta) => {
    const group = catGroupRef.current;

    if (!group) {
      return;
    }

    petAnimationRef.current = Math.max(0, petAnimationRef.current - delta);
    const petWave = petAnimationRef.current > 0 ? Math.sin((1.35 - petAnimationRef.current) * 9) * 0.18 : 0;
    group.rotation.y = catCompanion.rotationY + petWave * 0.22;
    group.position.y = 0.02 + Math.max(0, petWave) * 0.1;
  });

  return (
    <group
      ref={catGroupRef}
      position={[catCompanion.position.x, 0.02, catCompanion.position.z]}
      scale={catCompanion.scale}
    >
      <Float speed={isNearby ? 1.8 : 1.1} rotationIntensity={0.08} floatIntensity={0.14}>
        <Clone object={catScene} />
      </Float>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.7, 28]} />
        <meshBasicMaterial color="#f6c94d" transparent opacity={isNearby ? 0.26 : 0.12} />
      </mesh>
      {petPulse > 0 ? (
        <HeartParticles pulse={petPulse} position={[0, 0.1, 0]} />
      ) : null}
    </group>
  );
}

function NpcActor({ npc, isActive }: { npc: GameNpc; isActive: boolean }) {
  const colorMap = {
    gold: "#f6c94d",
    cyan: "#79d7ff",
    mint: "#73f2bd",
  } as const;

  const color = colorMap[npc.accent];

  return (
    <group position={[npc.position.x, 0, npc.position.z]}>
      <RoundedBox args={[0.68, 1.02, 0.58]} radius={0.08} smoothness={5} position={[0, 0.62, 0]} castShadow>
        <meshStandardMaterial color={isActive ? color : "#36567c"} />
      </RoundedBox>
      <RoundedBox args={[0.62, 0.58, 0.54]} radius={0.08} smoothness={5} position={[0, 1.24, 0]} castShadow>
        <meshStandardMaterial color={isActive ? "#f4f7fb" : "#9ce3ff"} />
      </RoundedBox>
      <Float speed={isActive ? 2.2 : 1.4} rotationIntensity={0} floatIntensity={isActive ? 0.32 : 0.16}>
        <RoundedBox args={[0.3, 0.16, 0.3]} radius={0.05} smoothness={4} position={[0, 1.52, 0]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isActive ? 1.1 : 0.35}
          />
        </RoundedBox>
      </Float>
      <mesh position={[0, -0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[isActive ? 0.58 : 0.48, 28]} />
        <meshBasicMaterial color={color} transparent opacity={isActive ? 0.8 : 0.3} />
      </mesh>
    </group>
  );
}

function SceneShell() {
  return (
    <>
      <color attach="background" args={["#08111f"]} />
      <fog attach="fog" args={["#08111f", 10, 24]} />
      <ambientLight intensity={1.2} />
      <hemisphereLight intensity={0.52} groundColor="#08111f" color="#9ce3ff" />
      <directionalLight
        position={[7, 12, 4]}
        intensity={2.2}
        color="#f6c94d"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-6, 10, -5]} intensity={1.6} color="#79d7ff" />
    </>
  );
}

function MapGround() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 16]} />
        <meshStandardMaterial color="#10233d" />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[21, 13]} />
        <meshStandardMaterial color="#14213d" />
      </mesh>

      <ContactShadows
        position={[0, 0.03, 0]}
        opacity={0.38}
        scale={20}
        blur={2.2}
        far={16}
        resolution={1024}
        color="#05090f"
      />
    </>
  );
}

function MapWalls() {
  return (
    <>
      <RoundedBox args={[22, 0.8, 0.8]} radius={0.08} smoothness={4} position={[0, 0.4, -7.6]} receiveShadow>
        <meshStandardMaterial color="#173459" />
      </RoundedBox>
      <RoundedBox args={[22, 0.8, 0.8]} radius={0.08} smoothness={4} position={[0, 0.4, 7.6]} receiveShadow>
        <meshStandardMaterial color="#173459" />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 15.8]} radius={0.08} smoothness={4} position={[-10.8, 0.4, 0]} receiveShadow>
        <meshStandardMaterial color="#173459" />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.8, 15.8]} radius={0.08} smoothness={4} position={[10.8, 0.4, 0]} receiveShadow>
        <meshStandardMaterial color="#173459" />
      </RoundedBox>
    </>
  );
}

function MapPlatforms() {
  return (
    <>
      <RoundedBox args={[2.4, 0.5, 1.6]} radius={0.12} smoothness={5} position={[-4.5, 0.26, 2.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#2b4365" />
      </RoundedBox>
      <RoundedBox args={[2.8, 0.5, 1.8]} radius={0.12} smoothness={5} position={[0.2, 0.26, -2.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#264663" />
      </RoundedBox>
      <RoundedBox args={[2.2, 0.5, 1.4]} radius={0.12} smoothness={5} position={[4.4, 0.26, 2.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#24455d" />
      </RoundedBox>
      <RoundedBox args={[3.1, 0.45, 1.9]} radius={0.12} smoothness={5} position={[-7, 0.24, -3.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#20384f" />
      </RoundedBox>
      <RoundedBox args={[2.6, 0.45, 1.6]} radius={0.12} smoothness={5} position={[7.1, 0.24, 4.25]} castShadow receiveShadow>
        <meshStandardMaterial color="#234a63" />
      </RoundedBox>
      <RoundedBox args={[2.2, 0.4, 2.2]} radius={0.12} smoothness={5} position={[0, 0.22, 4.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#1d3248" />
      </RoundedBox>
    </>
  );
}

function GameMapWorld({
  playerPosition,
  playerFacing,
  isMoving,
  activeNpcSlug,
  npcs,
  catIsNearby,
  catPetPulse,
}: PlayerSceneProps) {
  return (
    <>
      <FollowCamera playerPosition={playerPosition} playerFacing={playerFacing} />
      <SceneShell />
      <MapGround />
      <MapWalls />
      <MapPlatforms />
      {techPosters.map((poster) => (
        <TechPoster key={poster.id} {...poster} />
      ))}

      {npcs.map((npc) => (
        <NpcActor key={npc.slug} npc={npc} isActive={npc.slug === activeNpcSlug} />
      ))}

      <CatCompanion isNearby={catIsNearby} petPulse={catPetPulse} />
      <PlayerActor position={playerPosition} facing={playerFacing} isMoving={isMoving} />
      <Preload all />
    </>
  );
}

export function PlayerScene(props: PlayerSceneProps) {
  return (
    <div className={styles.scene}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
        className={styles.scene__canvas}
      >
        <GameMapWorld {...props} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/cat.glb");
