import Link from "next/link";
import styles from "./MissionLayout.module.scss";

type MissionHudProps = {
  title: string;
  sector: string;
  sectorCode: string;
  status: string;
  stage: string;
};

export function MissionHUD({
  title,
  sector,
  sectorCode,
  status,
  stage,
}: MissionHudProps) {
  return (
    <header className={styles.missionHud}>
      <div className={styles.missionHud__identity}>
        <p className={styles.missionHud__eyebrow}>mission protocol</p>
        <h1 className={styles.missionHud__title}>{title}</h1>
      </div>

      <div className={styles.missionHud__meta}>
        <div className={styles.missionHud__chip}>
          <span>Сектор</span>
          <strong>{sector}</strong>
        </div>
        <div className={styles.missionHud__chip}>
          <span>Код</span>
          <strong>{sectorCode}</strong>
        </div>
        <div className={styles.missionHud__chip}>
          <span>Статус</span>
          <strong>{status}</strong>
        </div>
        <div className={styles.missionHud__chip}>
          <span>Этап</span>
          <strong>{stage}</strong>
        </div>
      </div>

      <Link className={styles.missionHud__back} href="/game">
        Назад в хаб
      </Link>
    </header>
  );
}
