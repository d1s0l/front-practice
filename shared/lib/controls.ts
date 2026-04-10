export type MovementDirection = "up" | "down" | "left" | "right";

const DIRECTION_KEY_BY_CODE: Record<string, MovementDirection | undefined> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

const DIRECTION_KEY_BY_KEY: Record<string, MovementDirection | undefined> = {
  w: "up",
  ц: "up",
  s: "down",
  ы: "down",
  a: "left",
  ф: "left",
  d: "right",
  в: "right",
};

export function getMovementDirectionFromKeyboard(event: KeyboardEvent) {
  const byCode = DIRECTION_KEY_BY_CODE[event.code];

  if (byCode) {
    return byCode;
  }

  return DIRECTION_KEY_BY_KEY[event.key.toLowerCase()];
}

export function isInteractionKey(event: KeyboardEvent) {
  return event.code === "KeyE" || event.key.toLowerCase() === "e" || event.key.toLowerCase() === "у";
}
