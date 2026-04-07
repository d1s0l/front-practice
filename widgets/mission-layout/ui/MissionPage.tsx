"use client";

import { useMemo, useState } from "react";
import { DialoguePanel } from "@/features/dialogue/ui/DialoguePanel";
import { DecisionPanel } from "@/features/mission-decision/ui/DecisionPanel";
import type { MissionConfig } from "@/entities/mission/model/mission-data";
import { MissionBriefPanel } from "./MissionBriefPanel";
import { MissionHUD } from "./MissionHud";
import { MissionResultPanel } from "./MissionResultPanel";
import { MissionScene } from "./MissionScene";
import { MissionStats } from "./MissionStats";
import styles from "./MissionLayout.module.scss";

type MissionPageProps = {
  mission: MissionConfig;
};

export function MissionPage({ mission }: MissionPageProps) {
  const [selectedDialogue, setSelectedDialogue] = useState(0);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);

  const activeOutcome = useMemo(
    () =>
      mission.decisionOptions.find((option) => option.id === selectedDecision),
    [mission.decisionOptions, selectedDecision]
  );

  return (
    <main className={styles.missionPage}>
      <div className={styles.missionPage__backdrop} aria-hidden="true">
        <div className={styles.missionPage__grid} />
        <div className={styles.missionPage__sun} />
        <div className={styles.missionPage__spark} />
        <div className={styles.missionPage__sparkAlt} />
      </div>

      <div className={styles.missionPage__layout}>
        <MissionHUD
          title={mission.missionTitle}
          sector={mission.sector}
          sectorCode={mission.sectorCode}
          status={mission.status}
          stage={mission.stage}
        />

        <section className={styles.missionPage__main}>
          <MissionScene location={mission.location} actors={mission.sceneActors} />
          <MissionBriefPanel
            context={mission.context}
            objective={mission.objective}
            checklist={mission.checklist}
            risks={mission.risks}
            constraints={mission.constraints}
          />
        </section>

        <section className={styles.missionPage__interactive}>
          <div className={styles.missionPage__stack}>
            <DialoguePanel
              npc={mission.npc}
              options={mission.dialogueOptions}
              selectedIndex={selectedDialogue}
              onSelect={setSelectedDialogue}
            />
            <DecisionPanel
              prompt={mission.decisionPrompt}
              options={mission.decisionOptions}
              selectedId={selectedDecision}
              onSelect={setSelectedDecision}
            />
          </div>

          <div className={styles.missionPage__stack}>
            <MissionStats stats={mission.stats} outcome={activeOutcome} />
            <MissionResultPanel
              outcome={activeOutcome}
              resultSummary={mission.resultSummary}
              nextMissionHref={mission.nextMissionHref}
              retryHref={`/game/missions/${mission.slug}`}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
