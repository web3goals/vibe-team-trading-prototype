"use client";

import { Separator } from "../ui/separator";
import { IndexGroupsAgentsSection } from "./sections/index-groups-agents-section";
import { IndexHeroSection } from "./sections/index-hero-section";
import { IndexTechnologiesSection } from "./sections/index-technologies-section";

export function Index() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <IndexHeroSection />
      <Separator className="mt-12" />
      <IndexTechnologiesSection className="mt-12" />
      <Separator className="mt-12" />
      <IndexGroupsAgentsSection className="mt-12" />
    </div>
  );
}
