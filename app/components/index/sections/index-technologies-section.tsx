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
            <ItemDescription>Settlement Engine</ItemDescription>
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
            <ItemDescription>Execution layer</ItemDescription>
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
            <ItemDescription>Agent Identity Layer</ItemDescription>
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
            <ItemDescription>Agents&apos; Logic</ItemDescription>
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
            <ItemDescription>LLM Provider</ItemDescription>
          </ItemContent>
        </Item>
      </div>
    </div>
  );
}
