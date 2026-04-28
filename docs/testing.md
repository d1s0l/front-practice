# Тестирование

## Стек

- Vitest
- React Testing Library
- `jsdom`
- `@testing-library/jest-dom`

## Запуск тестов

```bash
npm test
```

Для watch-режима:

```bash
npm run test:watch
```

## Что покрыто

- [GameHud.test.tsx](../widgets/game-hud/ui/GameHud.test.tsx)
  Проверяет, что HUD корректно рендерит состояние игрока, прогресс и таймер.

- [useZoneInteraction.test.tsx](../features/zone-interaction/model/useZoneInteraction.test.tsx)
  Проверяет выбор ближайшего NPC и поведение вне радиуса взаимодействия.

- [useGameSession.test.tsx](../processes/game-session/model/useGameSession.test.tsx)
  Проверяет переходы диалога, timeout-ветки, сброс состояния, quick duel, запуск pong challenge, bonus XP, изменение score, рост XP и появление финального summary после завершения всех NPC-веток.

- [GameHub.test.tsx](../widgets/game-hub/ui/GameHub.test.tsx)
  Проверяет, что CTA взаимодействия появляется рядом с активным NPC, что модалка диалога рендерится при открытом разговоре, что финальный summary overlay корректно показывается, что prompt кота появляется при подходе к нему и что pong challenge prompt показывается у выбранного NPC.

- [cursor-ai.test.ts](../shared/lib/ai/cursor-ai.test.ts)
  Проверяет генерацию текста диалога, квестового превью, подсказок и outcome-сообщений.

- [PlayerScene.test.tsx](../widgets/player-scene/ui/PlayerScene.test.tsx)
  Проверяет интеграционную обвязку 3D-сцены после миграции на `@react-three/fiber` и `@react-three/drei`: наличие canvas, камеры, scene helpers, постеров, кота и передачу movement props в игрока.

## Что именно проверяется сейчас

- корректный рендер HUD
- nearest NPC logic
- появление prompt для кота
- появление prompt для pong challenge
- открытие и закрытие диалога
- переход к следующему этапу после правильного ответа
- обновление рейтинга и XP
- timeout-поведение timed stages
- запуск и награда quick duel
- запуск и награда arcade pong challenge
- корректное завершение pong challenge с пометкой NPC как пройденного arcade-события
- сброс dialogue state при закрытии модалки
- финальный сценарий после завершения всех веток
- генерация текста AI-helper функциями
- интеграция новой r3f+drei сцены на уровне React-компонента

## Подход к тестам

- Основной упор сделан на поведение, а не на snapshot-only тесты.
- Stateful-логика проверяется на уровне хуков там, где это удобнее и надёжнее.
- Тяжёлые scene-зависимости в UI-тестах мокируются, чтобы тесты были быстрыми и детерминированными.
- 3D-слой проверяется не через пиксельные snapshot’ы, а через интеграцию компонентов и передачу props после миграции на `r3f + drei`.
- Layout дополнительно проверяется через сборку и ручной просмотр, а автоматические тесты фокусируются на UI-состояниях и логике.
