export type ScoreDelta = {
  reputation: number;
  responsibility: number;
  transparency: number;
  speed: number;
  quality: number;
  xp: number;
};

export type NpcChoice = {
  id: string;
  text: string;
  responseSeed: string;
  hintSeed: string;
  tone: "good" | "neutral" | "bad";
  advances: boolean;
  delta: ScoreDelta;
};

export type NpcStage = {
  id: string;
  situation: string;
  objective: string;
  question: string;
  pressureSeconds?: number;
  choices: NpcChoice[];
  timeout?: {
    responseSeed: string;
    hintSeed: string;
    delta: ScoreDelta;
  };
};

export type QuickDuelOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuickDuelQuestion = {
  id: string;
  prompt: string;
  timeLimitSeconds: number;
  fastBonusThresholdMs: number;
  options: QuickDuelOption[];
  xpReward: {
    correct: number;
    fastBonus: number;
    attempt: number;
  };
};

export type QuickDuelConfig = {
  intro: string;
  summary: string;
  questions: QuickDuelQuestion[];
};

export type PingPongConfig = {
  intro: string;
  summary: string;
  winningScore: number;
  rewards: {
    participation: number;
    victory: number;
    flawless: number;
  };
};

export type GameNpc = {
  slug: "responsibility" | "transparency" | "speed";
  name: string;
  role: string;
  sectorCode: string;
  valueLabel: string;
  description: string;
  missionHref: string;
  accent: "gold" | "cyan" | "mint";
  position: {
    x: number;
    z: number;
  };
  aiProfile: {
    personality: string;
    domain: string;
  };
  stages: NpcStage[];
  quickDuel?: QuickDuelConfig;
  pingPong?: PingPongConfig;
};

export const gameNpcs: GameNpc[] = [
  {
    slug: "responsibility",
    name: "Ирина",
    role: "Delivery Lead",
    sectorCode: "sector_01",
    valueLabel: "Ответственность",
    description:
      "Ирина отвечает за ownership, зрелую эскалацию и способность доводить решение до результата.",
    missionHref: "/game/missions/responsibility",
    accent: "gold",
    position: { x: -4.4, z: 1.8 },
    aiProfile: {
      personality: "собранный лид",
      domain: "ownership и ответственность",
    },
    stages: [
      {
        id: "owner",
        situation:
          "Критическая задача застряла между командами, и никто не хочет официально брать её в работу.",
        objective: "Показать, как ты берёшь ownership без хаоса и перекладывания.",
        question:
          "Как ты начнёшь движение, чтобы задача действительно сдвинулась?",
        choices: [
          {
            id: "owner-sync",
            text: "Фиксирую владельца, собираю синхронизацию и беру ответственность за следующий шаг.",
            responseSeed: "ownership_visible",
            hintSeed: "reinforce_accountability",
            tone: "good",
            advances: true,
            delta: {
              reputation: 8,
              responsibility: 12,
              transparency: 4,
              speed: 1,
              quality: 3,
              xp: 26,
            },
          },
          {
            id: "owner-wait",
            text: "Подожду, пока кто-то сам возьмёт эту задачу, чтобы не лезть в чужую зону.",
            responseSeed: "ownership_missing",
            hintSeed: "mistake_safe_ownership",
            tone: "bad",
            advances: false,
            delta: {
              reputation: -5,
              responsibility: -8,
              transparency: -1,
              speed: -2,
              quality: 0,
              xp: 8,
            },
          },
          {
            id: "owner-client",
            text: "Сначала уточню критичность у клиента, а потом уже соберу внутренний план.",
            responseSeed: "ownership_balanced",
            hintSeed: "ownership_plus_context",
            tone: "neutral",
            advances: true,
            delta: {
              reputation: 4,
              responsibility: 6,
              transparency: 6,
              speed: 0,
              quality: 2,
              xp: 20,
            },
          },
        ],
      },
      {
        id: "recovery",
        situation:
          "После первой синхронизации команда всё ещё боится ошибиться и тянет с финальным решением.",
        objective: "Показать право на ошибку и зрелое восстановление без наказания команды.",
        question: "Что ты скажешь команде, чтобы вернуть движение и не задушить инициативу?",
        choices: [
          {
            id: "recovery-safe",
            text: "Ошибаться можно, главное быстро подсвечивать риск и исправлять вместе.",
            responseSeed: "safe_mistake",
            hintSeed: "growth_feedback",
            tone: "good",
            advances: true,
            delta: {
              reputation: 10,
              responsibility: 9,
              transparency: 8,
              speed: 2,
              quality: 4,
              xp: 28,
            },
          },
          {
            id: "recovery-pressure",
            text: "Скажу, что за любую ошибку будет жёсткий разбор, чтобы все были внимательнее.",
            responseSeed: "fear_control",
            hintSeed: "mistake_safe_reframe",
            tone: "bad",
            advances: false,
            delta: {
              reputation: -6,
              responsibility: -4,
              transparency: -6,
              speed: 0,
              quality: -2,
              xp: 8,
            },
          },
          {
            id: "recovery-business",
            text: "Попросим команду предложить по одному варианту решения и выберем самый устойчивый.",
            responseSeed: "entrepreneurial_team",
            hintSeed: "entrepreneurial_followup",
            tone: "good",
            advances: true,
            delta: {
              reputation: 7,
              responsibility: 7,
              transparency: 7,
              speed: 3,
              quality: 5,
              xp: 24,
            },
          },
        ],
      },
    ],
  },
  {
    slug: "transparency",
    name: "Макс",
    role: "Analytics Partner",
    sectorCode: "sector_02",
    valueLabel: "Прозрачность",
    description:
      "Макс проверяет открытое общение, честный статус и то, как игрок удерживает доверие в сложной коммуникации.",
    missionHref: "/game/missions/transparency",
    accent: "cyan",
    position: { x: 0.2, z: -1.1 },
    aiProfile: {
      personality: "аналитичный коммуникатор",
      domain: "прозрачность и доверие",
    },
    quickDuel: {
      intro:
        "Макс предлагает быстрый пинг-понг вопросов: отвечай чётко и быстро, чтобы заработать bonus XP до основного диалога.",
      summary:
        "Раунд завершён. Быстрые и точные ответы усиливают прозрачность и приносят дополнительный XP перед основной веткой.",
      questions: [
        {
          id: "sync-open",
          prompt: "Команда увидела риск в отчёте за 3 минуты до встречи. Что говорим первым сообщением?",
          timeLimitSeconds: 8,
          fastBonusThresholdMs: 3200,
          xpReward: {
            correct: 12,
            fastBonus: 8,
            attempt: 3,
          },
          options: [
            {
              id: "sync-open-plan",
              text: "Честно обозначаем риск и сразу даём план исправления.",
              isCorrect: true,
            },
            {
              id: "sync-open-hide",
              text: "Показываем только сильные стороны, проблему обсудим потом.",
              isCorrect: false,
            },
            {
              id: "sync-open-chaos",
              text: "Пусть каждый объяснит ситуацию по-своему, чтобы не терять время.",
              isCorrect: false,
            },
          ],
        },
        {
          id: "sync-status",
          prompt: "У двух людей разные статусы по одному риску. Как быстро выравниваешь коммуникацию?",
          timeLimitSeconds: 7,
          fastBonusThresholdMs: 2800,
          xpReward: {
            correct: 10,
            fastBonus: 6,
            attempt: 3,
          },
          options: [
            {
              id: "sync-status-shared",
              text: "Собираю единый апдейт и фиксирую одну версию статуса для всех.",
              isCorrect: true,
            },
            {
              id: "sync-status-silent",
              text: "Лучше ограничить круг людей, чтобы наружу вообще никто не говорил.",
              isCorrect: false,
            },
            {
              id: "sync-status-delay",
              text: "Подождём до конца дня, чтобы разобраться, кто прав.",
              isCorrect: false,
            },
          ],
        },
        {
          id: "sync-clarity",
          prompt: "Клиент задаёт лишние вопросы. Как не утонуть в деталях, но не потерять доверие?",
          timeLimitSeconds: 7,
          fastBonusThresholdMs: 2600,
          xpReward: {
            correct: 12,
            fastBonus: 8,
            attempt: 3,
          },
          options: [
            {
              id: "sync-clarity-frame",
              text: "Даём короткий критичный контекст, не скрывая риск и следующий шаг.",
              isCorrect: true,
            },
            {
              id: "sync-clarity-overshare",
              text: "Сразу выгружаем весь внутренний поток обсуждений без фильтра.",
              isCorrect: false,
            },
            {
              id: "sync-clarity-deflect",
              text: "Уходим от ответа и обещаем вернуться позже.",
              isCorrect: false,
            },
          ],
        },
      ],
    },
    stages: [
      {
        id: "client-risk",
        situation:
          "Перед клиентской встречей команда замечает проблему в отчёте. Скрыть её проще, чем проговорить.",
        objective: "Найти баланс между честностью, рамкой и доверием.",
        question: "Как ты поведёшь разговор с клиентом?",
        choices: [
          {
            id: "client-open",
            text: "Честно обозначу риск и сразу дам понятный план исправления.",
            responseSeed: "transparency_open",
            hintSeed: "open_comm_growth",
            tone: "good",
            advances: true,
            delta: {
              reputation: 9,
              responsibility: 3,
              transparency: 12,
              speed: -1,
              quality: 4,
              xp: 26,
            },
          },
          {
            id: "client-hide",
            text: "Покажу только хорошие данные, а проблему оставлю внутри команды.",
            responseSeed: "transparency_hidden",
            hintSeed: "mistake_safe_transparency",
            tone: "bad",
            advances: false,
            delta: {
              reputation: -7,
              responsibility: -2,
              transparency: -10,
              speed: 2,
              quality: -1,
              xp: 8,
            },
          },
          {
            id: "client-frame",
            text: "Ограничу обсуждение критичным контекстом, чтобы не утонуть в деталях, но риск не скрою.",
            responseSeed: "transparency_frame",
            hintSeed: "clarity_not_noise",
            tone: "neutral",
            advances: true,
            delta: {
              reputation: 5,
              responsibility: 2,
              transparency: 7,
              speed: 1,
              quality: 3,
              xp: 20,
            },
          },
        ],
      },
      {
        id: "team-status",
        situation:
          "Внутри команды статусы расходятся, и каждый пересказывает проблему по-своему.",
        objective: "Собрать единое открытое общение без бюрократии.",
        question: "Как ты выровняешь коммуникацию между людьми?",
        choices: [
          {
            id: "team-shared",
            text: "Соберу единый статус-апдейт и договорюсь, что команда говорит одной версией.",
            responseSeed: "alignment_open",
            hintSeed: "alignment_development",
            tone: "good",
            advances: true,
            delta: {
              reputation: 8,
              responsibility: 4,
              transparency: 9,
              speed: 2,
              quality: 4,
              xp: 24,
            },
          },
          {
            id: "team-silence",
            text: "Лучше ограничу круг людей, чтобы меньше кто вообще говорил наружу.",
            responseSeed: "silence_control",
            hintSeed: "open_comm_recovery",
            tone: "bad",
            advances: false,
            delta: {
              reputation: -5,
              responsibility: 0,
              transparency: -8,
              speed: 1,
              quality: -1,
              xp: 8,
            },
          },
          {
            id: "team-context",
            text: "Добавлю короткий контекст и зоны ответственности, чтобы каждый понимал границы своей части.",
            responseSeed: "context_roles",
            hintSeed: "context_scaling",
            tone: "good",
            advances: true,
            delta: {
              reputation: 7,
              responsibility: 5,
              transparency: 8,
              speed: 1,
              quality: 4,
              xp: 22,
            },
          },
        ],
      },
    ],
  },
  {
    slug: "speed",
    name: "Соня",
    role: "Product Strategist",
    sectorCode: "sector_03",
    valueLabel: "Скорость",
    description:
      "Соня отвечает за сценарии скорости, давления дедлайна и выбора между темпом, риском и качеством.",
    missionHref: "/game/missions/speed",
    accent: "mint",
    position: { x: 4.2, z: 1.4 },
    aiProfile: {
      personality: "быстрый прагматик",
      domain: "скорость, качество и pressure-сценарии",
    },
    pingPong: {
      intro:
        "Соня переключает тебя в arcade-режим: короткий матч в пинг-понг на скорость решений и контроль темпа.",
      summary:
        "Матч завершён. Темп, контроль и точность дали тебе дополнительный XP до основной ветки скорости.",
      winningScore: 3,
      rewards: {
        participation: 10,
        victory: 22,
        flawless: 12,
      },
    },
    stages: [
      {
        id: "timer-mvp",
        situation:
          "До релиза меньше минуты. Нужно решить, как довести продукт до результата и не сорвать всё сразу.",
        objective: "Почувствовать trade-off между темпом и качеством.",
        question: "Какой план даёт реальный шанс успеть без хаоса?",
        pressureSeconds: 18,
        timeout: {
          responseSeed: "speed_timeout",
          hintSeed: "speed_timeout_hint",
          delta: {
            reputation: -6,
            responsibility: -2,
            transparency: -1,
            speed: -6,
            quality: -5,
            xp: 6,
          },
        },
        choices: [
          {
            id: "timer-mvp-core",
            text: "Срежу весь лишний объём и выпущу устойчивый MVP прямо сейчас.",
            responseSeed: "speed_focus",
            hintSeed: "speed_quality_tradeoff",
            tone: "good",
            advances: true,
            delta: {
              reputation: 9,
              responsibility: 3,
              transparency: 1,
              speed: 11,
              quality: 5,
              xp: 28,
            },
          },
          {
            id: "timer-all",
            text: "Попробую тащить весь объём, чтобы никого не разочаровать.",
            responseSeed: "speed_overcommit",
            hintSeed: "speed_recover",
            tone: "bad",
            advances: false,
            delta: {
              reputation: -7,
              responsibility: -1,
              transparency: 0,
              speed: -4,
              quality: -7,
              xp: 8,
            },
          },
          {
            id: "timer-help",
            text: "Подключу помощь на проверку и оставлю команде только критичный контур доставки.",
            responseSeed: "speed_shared",
            hintSeed: "speed_shared_hint",
            tone: "good",
            advances: true,
            delta: {
              reputation: 7,
              responsibility: 4,
              transparency: 2,
              speed: 8,
              quality: 7,
              xp: 24,
            },
          },
        ],
      },
      {
        id: "quality-pressure",
        situation:
          "Релиз почти готов, но QA находит спорный дефект. Его можно обойти, а можно замедлиться и исправить.",
        objective: "Показать предпринимательский подход: выбирать не идеально, а осмысленно.",
        question: "Что ты сделаешь с найденным дефектом?",
        pressureSeconds: 15,
        timeout: {
          responseSeed: "quality_timeout",
          hintSeed: "quality_timeout_hint",
          delta: {
            reputation: -4,
            responsibility: -1,
            transparency: -1,
            speed: -4,
            quality: -6,
            xp: 6,
          },
        },
        choices: [
          {
            id: "quality-fix",
            text: "Замедлю выпуск на короткий слот и исправлю дефект до выхода.",
            responseSeed: "quality_protect",
            hintSeed: "quality_speed_balance",
            tone: "good",
            advances: true,
            delta: {
              reputation: 8,
              responsibility: 4,
              transparency: 3,
              speed: -2,
              quality: 10,
              xp: 26,
            },
          },
          {
            id: "quality-ignore",
            text: "Выпущу как есть, а исправление перенесу в следующий цикл.",
            responseSeed: "quality_debt",
            hintSeed: "quality_recovery",
            tone: "bad",
            advances: false,
            delta: {
              reputation: -8,
              responsibility: -3,
              transparency: -2,
              speed: 5,
              quality: -8,
              xp: 8,
            },
          },
          {
            id: "quality-risk",
            text: "Вынесу риск наружу, согласую компромисс и зафиксирую ограничение прямо в релиз-нотах.",
            responseSeed: "quality_transparent_tradeoff",
            hintSeed: "tradeoff_documented",
            tone: "neutral",
            advances: true,
            delta: {
              reputation: 6,
              responsibility: 3,
              transparency: 6,
              speed: 3,
              quality: 4,
              xp: 22,
            },
          },
        ],
      },
    ],
  },
];
