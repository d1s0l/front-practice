import Link from "next/link";
import { ValueCard } from "@/entities/value/ui/ValueCard";
import styles from "./LandingScreen.module.scss";

const values = [
  {
    title: "Ответственность",
    label: "value_01",
    description:
      "Каждое решение влияет на команду. Здесь игрок удерживает баланс между личной инициативой и общим результатом.",
    accent: "gold" as const,
  },
  {
    title: "Прозрачность",
    label: "value_02",
    description:
      "Честные статусы, понятные действия и открытые правила помогают проходить сложные уровни без скрытых ловушек.",
    accent: "cyan" as const,
  },
  {
    title: "Скорость",
    label: "value_03",
    description:
      "Темп важен, когда он не рушит качество. Игра поощряет быстрые, но осмысленные шаги и ясные приоритеты.",
    accent: "mint" as const,
  },
];

const stats = [
  { label: "Команда", value: "online" },
  { label: "Фокус", value: "values" },
  { label: "Режим", value: "story" },
];

export function LandingScreen() {
  return (
    <main className={styles.landing}>
      <div className={styles.landing__backdrop} aria-hidden="true">
        <div className={styles.landing__grid} />
        <div className={styles.landing__sun} />
        <div className={styles.landing__spark} />
        <div className={styles.landing__sparkAlt} />
      </div>

      <section className={styles.hero}>
        <div className={styles.hero__content}>
          <div className={styles.hero__badges}>
            <span className={styles.hero__badge}>Act 01</span>
            <span className={styles.hero__badge}>Browser Quest</span>
          </div>

          <p className={styles.hero__eyebrow}>mission briefing</p>
          <h1 className={styles.hero__title}>
            Value <span>Quest</span>
          </h1>
          <p className={styles.hero__subtitle}>
            Стартовая сцена о корпоративных ценностях, где пиксельная эстетика
            встречается с аккуратным современным интерфейсом и ясной игровой
            подачей.
          </p>

          <div className={styles.hero__actions}>
            <Link className={styles.hero__buttonPrimary} href="/game">
              Начать
            </Link>
            <a className={styles.hero__buttonSecondary} href="#about">
              О проекте
            </a>
          </div>

          <div className={styles.hero__ticker}>
            <span>daily build: ready</span>
            <span>mission: align team values</span>
            <span>status: all systems green</span>
          </div>
        </div>

        <div className={styles.hero__panel}>
          <div className={styles.hud}>
            <div className={styles.hud__top}>
              <span className={styles.hud__title}>HQ Dashboard</span>
              <span className={styles.hud__signal}>stable link</span>
            </div>

            <div className={styles.hud__screen}>
              <div className={styles.hud__cityline} aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <div className={styles.hud__avatar}>
                <span className={styles.hud__avatarCore} />
              </div>

              <div className={styles.hud__message}>
                <p className={styles.hud__messageTitle}>Новая миссия</p>
                <p className={styles.hud__messageText}>
                  Собрать сильную команду и пройти уровни через ответственность,
                  прозрачность и скорость.
                </p>
              </div>
            </div>

            <div className={styles.hud__stats}>
              {stats.map((item) => (
                <div key={item.label} className={styles.hud__stat}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.values} id="values">
        <div className={styles.values__header} id="about">
          <p className={styles.values__eyebrow}>core mechanics</p>
          <h2 className={styles.values__title}>Три ценности как игровые правила</h2>
          <p className={styles.values__description}>
            Базовые принципы оформлены как понятные игровые модули: каждая
            карточка даёт ритм, смысл и направление для следующих экранов.
          </p>
        </div>

        <div className={styles.values__grid}>
          {values.map((value) => (
            <ValueCard key={value.title} {...value} />
          ))}
        </div>
      </section>
    </main>
  );
}
