import Link from "next/link";
import type { MissionOutcome } from "@/entities/mission/model/mission-data";
import styles from "./MissionLayout.module.scss";

type MissionResultPanelProps = {
  outcome?: MissionOutcome;
  resultSummary: string;
  nextMissionHref: string;
  retryHref: string;
};

export function MissionResultPanel({
  outcome,
  resultSummary,
  nextMissionHref,
  retryHref,
}: MissionResultPanelProps) {
  const resolvedOutcome = outcome ?? null;
  const isResolved = resolvedOutcome !== null;

  return (
    <section className={styles.resultPanel}>
      <div className={styles.resultPanel__header}>
        <p className={styles.resultPanel__eyebrow}>consequences</p>
        <h2 className={styles.resultPanel__title}>Разбор и итог</h2>
      </div>

      <div className={styles.resultPanel__grid}>
        <div className={styles.resultPanel__consequence}>
          <h3>Результат выбора</h3>
          {isResolved ? (
            <>
              <p>{resolvedOutcome.summary}</p>
              <blockquote>{resolvedOutcome.npcReaction}</blockquote>
              <p>{resolvedOutcome.analysis}</p>
            </>
          ) : (
            <p>
              Выбери ключевое решение, чтобы увидеть последствия, реакцию NPC и
              изменение миссионных шкал.
            </p>
          )}
        </div>

        <div className={styles.resultPanel__summary}>
          <div className={styles.resultPanel__status}>
            <span>Статус</span>
            <strong>{resolvedOutcome?.status ?? "Ожидает решения"}</strong>
          </div>
          <div className={styles.resultPanel__status}>
            <span>XP</span>
            <strong>{resolvedOutcome ? `+${resolvedOutcome.xp}` : "+0"}</strong>
          </div>
          <div className={styles.resultPanel__status}>
            <span>Прокачка</span>
            <strong>{resolvedOutcome?.upgrades.join(" / ") ?? "Не определена"}</strong>
          </div>
        </div>
      </div>

      <p className={styles.resultPanel__text}>{resultSummary}</p>

      <div className={styles.resultPanel__actions}>
        <Link className={styles.resultPanel__primary} href={nextMissionHref}>
          Следующая миссия
        </Link>
        <Link className={styles.resultPanel__secondary} href="/game">
          Вернуться в хаб
        </Link>
        <Link className={styles.resultPanel__secondary} href={retryHref}>
          Повторить
        </Link>
      </div>
    </section>
  );
}
