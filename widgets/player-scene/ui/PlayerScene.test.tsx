import { render, screen } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";
import { gameNpcs } from "@/shared/config/game-npcs";
import { PlayerScene } from "./PlayerScene";

const playerActorSpy = vi.fn();

vi.mock("@react-three/fiber", () => ({
  Canvas: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="canvas" className={className}>
      {children}
    </div>
  ),
  useFrame: () => {},
}));

vi.mock("@react-three/drei", () => {
  const useGLTFMock = Object.assign(
    () => ({
      scene: {
        clone: () => ({})
      },
    }),
    {
      preload: vi.fn(),
    }
  );

  const PerspectiveCameraMock = forwardRef(function PerspectiveCameraMock(
    props: Record<string, unknown>,
    ref: React.ForwardedRef<unknown>
  ) {
    useImperativeHandle(ref, () => ({
      position: {
        x: 0,
        y: 0,
        z: 0,
        set: vi.fn(),
      },
      lookAt: vi.fn(),
    }));

    return <div data-testid="perspective-camera" data-fov={String(props.fov ?? "")} />;
  });

  return {
    PerspectiveCamera: PerspectiveCameraMock,
    Preload: () => <div data-testid="preload" />,
    ContactShadows: () => <div data-testid="contact-shadows" />,
    Float: ({ children }: { children: React.ReactNode }) => <div data-testid="float">{children}</div>,
    Clone: ({ children }: { children?: React.ReactNode }) => <div data-testid="clone">{children}</div>,
    Html: ({ children }: { children: React.ReactNode }) => <div data-testid="html">{children}</div>,
    RoundedBox: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="rounded-box">{children}</div>
    ),
    useGLTF: useGLTFMock,
  };
});

vi.mock("@/entities/player/ui/PlayerActor", () => ({
  PlayerActor: (props: unknown) => {
    playerActorSpy(props);

    return <div data-testid="player-actor" />;
  },
}));

describe("PlayerScene", () => {
  beforeEach(() => {
    playerActorSpy.mockClear();
  });

  it("renders the r3f canvas with drei camera and scene helpers", () => {
    render(
      <PlayerScene
        playerPosition={{ x: 1.2, z: -0.4 }}
        playerFacing="left"
        isMoving
        activeNpcSlug="responsibility"
        npcs={gameNpcs}
        catIsNearby={false}
        catPetPulse={0}
      />
    );

    expect(screen.getByTestId("canvas")).toBeInTheDocument();
    expect(screen.getByTestId("perspective-camera")).toHaveAttribute("data-fov", "38");
    expect(screen.getByTestId("preload")).toBeInTheDocument();
    expect(screen.getByTestId("contact-shadows")).toBeInTheDocument();
    expect(screen.getAllByTestId("float")).toHaveLength(gameNpcs.length + 1);
    expect(screen.getAllByTestId("html")).toHaveLength(4);
    expect(screen.getByTestId("player-actor")).toBeInTheDocument();
  });

  it("passes the gameplay movement props into the player actor", () => {
    render(
      <PlayerScene
        playerPosition={{ x: -2, z: 3 }}
        playerFacing="up"
        isMoving={false}
        activeNpcSlug="speed"
        npcs={gameNpcs}
        catIsNearby={false}
        catPetPulse={0}
      />
    );

    expect(playerActorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        position: { x: -2, z: 3 },
        facing: "up",
        isMoving: false,
      })
    );
  });
});
