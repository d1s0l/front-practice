export const roomBounds = {
  minX: -9.4,
  maxX: 9.4,
  minZ: -6.4,
  maxZ: 6.4,
} as const;

export const catCompanion = {
  slug: "cat",
  name: "Пиксель",
  role: "Chief Morale Officer",
  sectorCode: "pet_01",
  valueLabel: "Настроение команды",
  description:
    "Местный офисный кот. Любит внимание, снимает стресс и добавляет немного ретро-хаоса в рабочую комнату.",
  promptText: "Нажмите E, чтобы погладить кота",
  interactionHint: "Погладить кота",
  position: {
    x: 8.15,
    z: -4.85,
  },
  rotationY: -2.3,
  scale: 1.18,
  activationRadius: 1.7,
} as const;

export const techPosters = [
  {
    id: "hello-world",
    title: "Hello, World",
    subtitle: "ship small, learn fast",
    position: [-5.2, 2.6, -7.56] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    accent: "#79d7ff",
  },
  {
    id: "deploy-sleep",
    title: "Deploy > Sleep",
    subtitle: "green build club",
    position: [0, 2.7, -7.56] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    accent: "#f6c94d",
  },
  {
    id: "ai-loop",
    title: "Think / Build / AI",
    subtitle: "feedback is a feature",
    position: [5.2, 2.6, -7.56] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    accent: "#73f2bd",
  },
  {
    id: "terminal",
    title: "sudo npm run focus",
    subtitle: "terminal mode",
    position: [-10.32, 2.65, 1.4] as [number, number, number],
    rotation: [0, Math.PI / 2, 0] as [number, number, number],
    accent: "#9ce3ff",
  },
] as const;
