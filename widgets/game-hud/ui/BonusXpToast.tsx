import styles from "./BonusXpToast.module.scss";

type BonusXpToastProps = {
  amount: number;
  label: string;
};

export function BonusXpToast({ amount, label }: BonusXpToastProps) {
  return (
    <aside className={styles.toast} aria-live="polite">
      <span className={styles.toast__eyebrow}>bonus xp</span>
      <strong className={styles.toast__value}>{`+${amount} XP`}</strong>
      <span className={styles.toast__label}>{label}</span>
    </aside>
  );
}
