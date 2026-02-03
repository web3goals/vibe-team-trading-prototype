"use client";

import { UsersIcon } from "lucide-react";
import { Button } from "../ui/button";

// TODO: Implement
export function Index() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Title, subtitle */}
      <h2 className="text-3xl font-bold tracking-tight text-center mt-6">
        Vibe together. Trade together. Let AI do the heavy lifting.
      </h2>
      <h4 className="text-xl text-muted-foreground tracking-tight text-center mt-2">
        Collaborative platform where groups trade alongside AI Agents. By
        combining human sentiment with quorum-based governance, we turn trading
        into a high-frequency team sport.
      </h4>
      {/* Button */}
      <div className="flex flex-col items-center gap-4 mt-4">
        {/* TODO: Implement */}
        <Button variant="default" size="lg">
          <UsersIcon />
          Create group
        </Button>
      </div>
    </div>
  );
}
