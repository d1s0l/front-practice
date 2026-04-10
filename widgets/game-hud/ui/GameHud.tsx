import styles from "./GameHud.module.scss";

type GameHudProps = {
  reputation: number;
  responsibility: number;
  transparency: number;
  speed: number;
  quality: number;
  xp: number;
  level: number;
  completedQuests: number;
  totalQuests: number;
  timerRemaining: number | null;
};

export function GameHud({
  reputation,
  responsibility,
  transparency,
  speed,
  quality,
  xp,
  level,
  completedQuests,
  totalQuests,
  timerRemaining,
}: GameHudProps) {
  const progress = Math.round((completedQuests / totalQuests) * 100);

  return (
    <aside className={styles.hud}>
      <div className={styles.hud__player}>
        <div className={styles.hud__avatar} aria-hidden="true" />
        <div className={styles.hud__playerCopy}>
          <span className={styles.hud__label}>player status</span>
          <strong className={styles.hud__title}>Value Runner</strong>
          <span className={styles.hud__level}>{`Lv.${level} / XP ${xp}`}</span>
        </div>
      </div>

      <div className={styles.hud__stats}>
        <div className={styles.hud__item}>
          <span>
            <span className={styles.hud__desktopLabel}>Квесты</span>
            <span className={styles.hud__mobileLabel}>Кв</span>
          </span>
          <strong>{`${completedQuests}/${totalQuests}`}</strong>
        </div>
        <div className={styles.hud__item}>
          <span>
            <span className={styles.hud__desktopLabel}>Репутация</span>
            <span className={styles.hud__mobileLabel}>Рейт</span>
          </span>
          <strong>{reputation}</strong>
        </div>
      </div>

      <div className={styles.hud__metrics}>
        <span>
          <span className={styles.hud__desktopLabel}>Ответственность</span>
          <span className={styles.hud__mobileLabel}>Отв</span>
          {` ${responsibility}`}
        </span>
        <span>
          <span className={styles.hud__desktopLabel}>Прозрачность</span>
          <span className={styles.hud__mobileLabel}>Прозр</span>
          {` ${transparency}`}
        </span>
        <span>
          <span className={styles.hud__desktopLabel}>Скорость</span>
          <span className={styles.hud__mobileLabel}>Скор</span>
          {` ${speed}`}
        </span>
        <span>
          <span className={styles.hud__desktopLabel}>Качество</span>
          <span className={styles.hud__mobileLabel}>Кач</span>
          {` ${quality}`}
        </span>
      </div>

      <div className={styles.hud__progress}>
        <div className={styles.hud__progressMeta}>
          <span>Прогресс</span>
          <strong>{`${progress}%`}</strong>
        </div>
        <div className={styles.hud__track}>
          <span className={styles.hud__fill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {timerRemaining !== null ? (
        <div className={styles.hud__timer}>
          <span>
            <span className={styles.hud__desktopLabel}>Таймер</span>
            <span className={styles.hud__mobileLabel}>Тмр</span>
          </span>
          <strong>{`${timerRemaining}s`}</strong>
        </div>
      ) : null}

      <div className={styles.hud__controls}>
        <span>WASD / стрелки / ЦФЫВ - движение</span>
        <span>E / У - диалог</span>
      </div>
    </aside>
  );
}
