import { notFound } from "next/navigation";
import { MissionPage } from "@/widgets/mission-layout/ui/MissionPage";
import {
  getMissionConfig,
  getMissionSlugs,
} from "@/entities/mission/model/mission-data";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getMissionSlugs().map((sector) => ({ sector }));
}

export default async function SectorMissionPage({
  params,
}: {
  params: Promise<{ sector: string }>;
}) {
  const { sector } = await params;
  const mission = getMissionConfig(sector);

  if (!mission) {
    notFound();
  }

  return <MissionPage mission={mission} />;
}
