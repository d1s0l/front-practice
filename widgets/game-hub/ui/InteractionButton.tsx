"use client";

import styles from "./InteractionButton.module.scss";

type InteractionButtonProps = {
  visible: boolean;
  disabled: boolean;
  onInteract: () => void;
  title?: string;
  hint?: string;
};

export function InteractionButton({
  visible,
  disabled,
  onInteract,
  title = "Диалог",
  hint = "Открыть разговор с NPC",
}: InteractionButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${visible ? styles["button--visible"] : ""}`}
      onClick={onInteract}
      disabled={disabled}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <span className={styles.button__eyebrow}>Действие</span>
      <strong className={styles.button__title}>
        <span className={styles.button__desktopKey}>E / </span>
        {title}
      </strong>
      <span className={styles.button__hint}>{hint}</span>
    </button>
  );
}
