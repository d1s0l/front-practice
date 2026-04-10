"use client";

import type { MovementDirection } from "@/shared/lib/controls";
import styles from "./MobileControls.module.scss";

type MobileControlsProps = {
  onDirectionChange: (direction: MovementDirection, pressed: boolean) => void;
  onReleaseAll: () => void;
};

const directions: Array<{
  direction: MovementDirection;
  label: string;
  className: string;
}> = [
  { direction: "up", label: "▲", className: styles.controls__buttonUp },
  { direction: "left", label: "◀", className: styles.controls__buttonLeft },
  { direction: "right", label: "▶", className: styles.controls__buttonRight },
  { direction: "down", label: "▼", className: styles.controls__buttonDown },
];

export function MobileControls({
  onDirectionChange,
  onReleaseAll,
}: MobileControlsProps) {
  const bindDirection = (direction: MovementDirection) => ({
    onPointerDown: () => onDirectionChange(direction, true),
    onPointerUp: () => onDirectionChange(direction, false),
    onPointerCancel: () => onDirectionChange(direction, false),
    onPointerLeave: () => onDirectionChange(direction, false),
  });

  return (
    <div className={styles.controls} onPointerUp={onReleaseAll} onPointerCancel={onReleaseAll}>
      <span className={styles.controls__label}>Движение</span>
      <div className={styles.controls__pad} aria-label="Мобильное управление движением">
        {directions.map((item) => (
          <button
            key={item.direction}
            type="button"
            className={`${styles.controls__button} ${item.className}`}
            aria-label={`Движение ${item.direction}`}
            {...bindDirection(item.direction)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
