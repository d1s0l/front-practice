# Архитектура

## Обзор

Проект использует Next.js App Router и практичный вариант Feature-Sliced Design. Цель такой структуры — развивать игровой цикл без лишней архитектурной бюрократии.

## Слои

- `app`
  Точки входа маршрутов Next.js и корневой layout.

- `processes`
  Оркестрация сценариев между несколькими частями приложения. Главный пример — [useGameSession.ts](../processes/game-session/model/useGameSession.ts), который управляет состоянием диалога, очками, таймерами, завершением веток и финальными overlay.

- `widgets`
  Крупные композиционные блоки UI:
  [GameHub.tsx](../widgets/game-hub/ui/GameHub.tsx),
  [GameHud.tsx](../widgets/game-hud/ui/GameHud.tsx),
  [FinalOverlay.tsx](../widgets/final-overlay/ui/FinalOverlay.tsx),
  а также mission layout widgets и игровая сцена.

- `features`
  Более локальные игровые возможности:
  UI модалки диалога,
  логика proximity-взаимодействия,
  движение игрока,
  mission decision UI,
  выбор квестов.

- `entities`
  Доменные данные и переиспользуемые доменные UI-части. Именно здесь лежат основные типы и конфигурации NPC и миссий.

- `shared`
  Общая конфигурация, утилиты, управление, AI-хелперы и токены стилей.

## Ответственность во время выполнения

- Рендер сцены:
  [PlayerScene.tsx](../widgets/player-scene/ui/PlayerScene.tsx) рисует 3D-сцену через `@react-three/fiber`, а для камеры, декларативных примитивов и вспомогательных scene-утилит использует `@react-three/drei`.

- Ввод:
  движение обрабатывается в [usePlayerMovement.ts](../features/player-movement/model/usePlayerMovement.ts), а поиск NPC в радиусе взаимодействия — в [useZoneInteraction.ts](../features/zone-interaction/model/useZoneInteraction.ts).

- Игровое состояние:
  [useGameSession.ts](../processes/game-session/model/useGameSession.ts) — это основная state-machine для диалогов, таймеров этапов, изменения score и endgame-flow.

- Контент:
  ветки NPC описаны в [game-npcs.ts](../shared/config/game-npcs.ts), а mission pages — в [mission-data.ts](../entities/mission/model/mission-data.ts).

- Мир и декоративные объекты:
  [world-objects.ts](../shared/config/world-objects.ts) хранит параметры расширенной комнаты, кота-компаньона и IT-постеров.

- AI-подача:
  [cursor-ai.ts](../shared/lib/ai/cursor-ai.ts) генерирует детерминированный текст для заголовков диалогов, квестовых превью, подсказок и outcome-сообщений.

## Решения по layout

- Игровая страница полноэкранная и держит сцену под слоем overlay-элементов.
- Диалоговая модалка построена как стабильная внешняя оболочка с внутренней scroll-зоной. Это убирает viewport-level overflow и при этом сохраняет удобство чтения длинного контента.
- HUD, prompt cards и overlay-панели используют размеры на базе `clamp()`, чтобы интерфейс корректно масштабировался на 1366px, Full HD, 2K и широких мониторах, а не выглядел как растянутый mobile UI.
- Мини-игра и обычный диалог разделены в session-layer логике, поэтому можно расширять интерактив без смешивания 3D-кода, UI и состояния.

## Устройство 3D-сцены

- `Canvas` остаётся границей 3D-мира.
- Камера переведена на `PerspectiveCamera` из `drei` и продолжает работать как follow-camera с плавным наведением на игрока.
- Игрок, NPC, платформы и стены собираются декларативно через `RoundedBox`, а не через набор низкоуровневых `boxGeometry` в каждом месте.
- Для активных NPC используется `Float`, чтобы акцентный маркер был проще и чище в поддержке.
- Общая тень сцены вынесена в `ContactShadows`, чтобы не раздувать количество ручной теневой логики.
- Кот загружается через `useGLTF` и `Clone`, а heart particles живут отдельным лёгким компонентом поверх сцены.
- IT-постеры встроены через `Html` из `drei`, чтобы не смешивать декоративную типографику с основным UI.

## Что осталось без изменений

- Логика движения игрока.
- Логика proximity-взаимодействия с NPC.
- Диалоговый flow и state management.
- Разделение между Canvas и обычным React UI.

## Почему эта структура удобна

- Игровое состояние централизовано в process-layer hook, а не размазано по множеству UI-компонентов.
- Контент остаётся data-driven, поэтому добавлять новых NPC или миссии можно без переписывания основной логики.
- Стили модульные и локальные, поэтому layout-правки можно вносить точечно.
