import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEnsData } from "@/hooks/use-ens-data";
import { shortenAddress } from "@/lib/address";

export function AgentCard(props: { ensName: string }) {
  const { data: ensData } = useEnsData(props.ensName);

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
          {/* ENS name */}
          <p className="font-bold">{props.ensName}</p>
          {/* ENS data description */}
          {ensData?.description && (
            <div className="flex flex-col mt-4">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{ensData.description}</p>
            </div>
          )}
          {/* ENS data creator */}
          {ensData?.creator && (
            <div className="flex flex-col gap-1 mt-4">
              <p className="text-sm text-muted-foreground">Creator</p>
              <div className="flex flex-row items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${ensData.creator}&backgroundColor=8c5cff`}
                  />
                  <AvatarFallback>
                    {ensData.creator.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm">{shortenAddress(ensData.creator)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
