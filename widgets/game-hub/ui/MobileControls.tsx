"use client";

import type { MovementDirection } from "@/shared/lib/controls";
import styles from "./MobileControls.module.scss";

type MobileControlsProps = {
  onDirectionChange: (direction: MovementDirection, pressed: boolean) => void;
  onReleaseAll: () => void;
};

function TriangleIcon({ direction }: { direction: MovementDirection }) {
  return (
    <svg
      className={`${styles.controls__icon} ${styles[`controls__icon--${direction}`]}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5 20 19H4Z" />
    </svg>
  );
}

const directions: Array<{
  direction: MovementDirection;
  className: string;
}> = [
  { direction: "up", className: styles.controls__buttonUp },
  { direction: "left", className: styles.controls__buttonLeft },
  { direction: "right", className: styles.controls__buttonRight },
  { direction: "down", className: styles.controls__buttonDown },
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
            <TriangleIcon direction={item.direction} />
          </button>
        ))}
      </div>
    </div>
  );
}
