import { ClassValue } from "clsx";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";

export function IndexTechnologiesSection(props: { className?: ClassValue }) {
  return (
    <div className={cn(props.className)}>
      <p className="font-bold text-center">Technologies</p>
      <p className="text-muted-foreground text-center">
        The engine behind the experience
      </p>
      <div className="flex flex-col gap-2 mt-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-10">
              <AvatarImage src="/images/yellow.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Yellow</ItemTitle>
            <ItemDescription className="text-wrap">
              The core settlement engine, enabling seamless, gas-free group
              consensus and asset transfers
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-10">
              <AvatarImage src="/images/lifi.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>LI.FI</ItemTitle>
            <ItemDescription className="text-wrap">
              A cross-chain execution layer used to execute trades and monetize
              transactions to reward agent developers
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-10">
              <AvatarImage src="/images/ens.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>ENS</ItemTitle>
            <ItemDescription className="text-wrap">
              An identity layer that enables anyone to create agents with unique
              onchain personalities and features
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-10">
              <AvatarImage src="/images/langchain.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>LangChain</ItemTitle>
            <ItemDescription className="text-wrap">
              A framework used to build and orchestrate agent logic and
              workflows
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Avatar className="size-10">
              <AvatarImage src="/images/openrouter.png" />
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>OpenRouter</ItemTitle>
            <ItemDescription className="text-wrap">
              A unified provider for the large language models
            </ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </div>
  );
}
