import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shortenAddress } from "@/lib/address";

export function AgentCard(props: {
  ensName: string;
  description: string;
  created: Date;
  creatorAddress: `0x${string}`;
  creatorEnsName: string;
}) {
  return (
    <div className="bg-card border rounded-2xl p-4">
      <div className="flex flex-row gap-4">
        {/* Left part */}
        <Avatar className="size-10">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${props.ensName}&backgroundColor=79c0ff`}
          />
          <AvatarFallback>{props.ensName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        {/* Right part */}
        <div className="w-full">
          {/* ENS name, description */}
          <div>
            <p className="font-bold">{props.ensName}</p>
            <p className="text-sm text-muted-foreground">{props.description}</p>
          </div>
          {/* Created */}
          <div className="flex flex-col gap-1 mt-4">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-sm">
              {new Date(props.created).toLocaleString()}
            </p>
          </div>
          {/* Creator */}
          <div className="flex flex-col gap-1 mt-4">
            <p className="text-sm text-muted-foreground">Creator</p>
            <div className="flex flex-row items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${props.creatorEnsName}&backgroundColor=8c5cff`}
                />
                <AvatarFallback>
                  {props.creatorEnsName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm">{props.creatorEnsName}</p>
              <p className="text-sm text-muted-foreground">
                {shortenAddress(props.creatorAddress)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
