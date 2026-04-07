import styles from "./FinalOverlay.module.scss";

type SummaryOverlayProps = {
  reputation: number;
  level: number;
  onContinue: () => void;
};

type FeedbackOverlayProps = {
  feedback: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function FinalSummaryOverlay({
  reputation,
  level,
  onContinue,
}: SummaryOverlayProps) {
  return (
    <section className={styles.overlay}>
      <div className={styles.overlay__panel}>
        <span className={styles.overlay__eyebrow}>mission complete</span>
        <h2 className={styles.overlay__title}>Круто, молодец! Ты прошёл все миссии.</h2>
        <p className={styles.overlay__text}>
          Итоговый рейтинг: <strong>{reputation}</strong>. Уровень развития:{" "}
          <strong>{level}</strong>.
        </p>
        <button className={styles.overlay__primary} type="button" onClick={onContinue}>
          Дальше
        </button>
      </div>
    </section>
  );
}

export function FinalFeedbackOverlay({
  feedback,
  onChange,
  onSubmit,
}: FeedbackOverlayProps) {
  return (
    <section className={styles.overlay}>
      <div className={styles.overlay__panel}>
        <span className={styles.overlay__eyebrow}>feedback</span>
        <h2 className={styles.overlay__title}>Оставь обратную связь</h2>
        <p className={styles.overlay__text}>
          Что в игре сработало хорошо, а что ты бы усилил дальше?
        </p>
        <textarea
          className={styles.overlay__input}
          value={feedback}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Напиши пару слов о впечатлениях"
        />
        <button className={styles.overlay__primary} type="button" onClick={onSubmit}>
          Отправить
        </button>
      </div>
    </section>
  );
}
