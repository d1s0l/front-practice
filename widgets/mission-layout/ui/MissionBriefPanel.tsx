import styles from "./MissionLayout.module.scss";

type MissionBriefPanelProps = {
  context: string;
  objective: string;
  checklist: string[];
  risks: string[];
  constraints: string[];
};

export function MissionBriefPanel({
  context,
  objective,
  checklist,
  risks,
  constraints,
}: MissionBriefPanelProps) {
  return (
    <aside className={styles.briefPanel}>
      <div className={styles.briefPanel__section}>
        <p className={styles.briefPanel__eyebrow}>brief</p>
        <h2 className={styles.briefPanel__title}>Контекст миссии</h2>
        <p className={styles.briefPanel__text}>{context}</p>
      </div>

      <div className={styles.briefPanel__section}>
        <h3 className={styles.briefPanel__subtitle}>Главная цель</h3>
        <p className={styles.briefPanel__text}>{objective}</p>
      </div>

      <div className={styles.briefPanel__matrix}>
        <div className={styles.briefPanel__listBlock}>
          <h3 className={styles.briefPanel__subtitle}>Checklist</h3>
          <ul className={styles.briefPanel__list}>
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.briefPanel__listBlock}>
          <h3 className={styles.briefPanel__subtitle}>Риски</h3>
          <ul className={styles.briefPanel__list}>
            {risks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.briefPanel__listBlock}>
          <h3 className={styles.briefPanel__subtitle}>Ограничения</h3>
          <ul className={styles.briefPanel__list}>
            {constraints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
