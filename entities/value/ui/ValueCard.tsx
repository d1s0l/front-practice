import styles from "./ValueCard.module.scss";

type ValueCardProps = {
  title: string;
  label: string;
  description: string;
  accent: "gold" | "cyan" | "mint";
};

export function ValueCard({
  title,
  label,
  description,
  accent,
}: ValueCardProps) {
  return (
    <article className={`${styles.valueCard} ${styles[`valueCard--${accent}`]}`}>
      <div className={styles.valueCard__head}>
        <span className={styles.valueCard__label}>{label}</span>
        <span className={styles.valueCard__icon} aria-hidden="true" />
      </div>
      <h3 className={styles.valueCard__title}>{title}</h3>
      <p className={styles.valueCard__description}>{description}</p>
    </article>
  );
}
