import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { BotIcon, UsersRoundIcon } from "lucide-react";
import Image from "next/image";

export function IndexHeroSection(props: { className?: ClassValue }) {
  return (
    <div className={cn(props.className)}>
      {/* Image */}
      <Image
        src="/images/hero.png"
        alt="Hero"
        priority={false}
        width="100"
        height="100"
        sizes="100vw"
        className="w-full rounded-md"
      />
      {/* Title, subtitle */}
      <h2 className="text-3xl font-bold tracking-tight text-center mt-6">
        Vibe together, trade together, and let AI do the heavy lifting
      </h2>
      <h4 className="text-xl text-muted-foreground tracking-tight text-center mt-2">
        AI-powered social platform that executes crypto trades based on your
        group&apos;s collective sentiment and real-time market analysis
      </h4>
      {/* Buttons */}
      <div className="flex flex-row items-center justify-center gap-2 mt-4">
        <Button variant="default">
          <UsersRoundIcon />
          Create group
        </Button>
        <Button variant="outline" disabled>
          <BotIcon /> Add agent
        </Button>
      </div>
    </div>
  );
}
