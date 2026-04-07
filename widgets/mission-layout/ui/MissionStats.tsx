import type {
  MissionOutcome,
  MissionStat,
} from "@/entities/mission/model/mission-data";
import styles from "./MissionLayout.module.scss";

type MissionStatsProps = {
  stats: MissionStat[];
  outcome?: MissionOutcome;
};

function getDeltaForStat(label: string, outcome?: MissionOutcome) {
  return outcome?.shifts.find((shift) => shift.label === label)?.delta ?? 0;
}

export function MissionStats({ stats, outcome }: MissionStatsProps) {
  return (
    <section className={styles.statsPanel}>
      <div className={styles.statsPanel__header}>
        <p className={styles.statsPanel__eyebrow}>live values</p>
        <h2 className={styles.statsPanel__title}>Индикаторы состояния</h2>
      </div>

      <div className={styles.statsPanel__list}>
        {stats.map((stat) => {
          const delta = getDeltaForStat(stat.label, outcome);
          const currentValue = Math.max(0, Math.min(100, stat.value + delta));

          return (
            <div key={stat.label} className={styles.statsPanel__item}>
              <div className={styles.statsPanel__meta}>
                <span>{stat.label}</span>
                <strong>{currentValue}%</strong>
              </div>
              <div className={styles.statsPanel__track}>
                <span
                  className={styles.statsPanel__fill}
                  style={{ width: `${currentValue}%` }}
                />
              </div>
              <div className={styles.statsPanel__delta}>
                <span>{stat.trend}</span>
                <strong className={delta >= 0 ? styles.isPositive : styles.isNegative}>
                  {delta >= 0 ? `+${delta}` : delta}
                </strong>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
