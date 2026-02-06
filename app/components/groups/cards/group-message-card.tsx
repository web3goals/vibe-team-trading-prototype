import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { shortenAddress } from "@/lib/address";
import { Group } from "@/mongodb/models/group";
import { GroupMessage } from "@/types/group";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import Link from "next/link";
import { GroupMessageYellowMessageSignDrawer } from "../drawers/group-message-yellow-message-sign-drawer";

export function GroupMessageCard(props: {
  group: Group;
  groupMessage: GroupMessage;
}) {
  return (
    <div className="bg-card border rounded-2xl p-4">
      <div className="flex flex-row gap-4">
        {/* Left part */}
        <Avatar className="size-10">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${props.groupMessage.creatorEnsName}&backgroundColor=${props.groupMessage.creatorRole === "agent" ? "79c0ff" : "8c5cff"}`}
          />
          <AvatarFallback>
            {props.groupMessage.creatorEnsName[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {/* Right part */}
        <div className="w-full">
          {/* Creator ENS name, address, created */}
          <div>
            <div className="flex flex-row gap-2">
              <p className="font-bold">{props.groupMessage.creatorEnsName} </p>
              <p className="text-muted-foreground">
                {shortenAddress(props.groupMessage.creatorAddress)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(props.groupMessage.created).toLocaleString()}
            </p>
          </div>
          {/* Content */}
          <div className="text-sm mt-4">
            <p className="whitespace-pre-wrap">{props.groupMessage.content}</p>
          </div>
          {/* Separator for Yellow and LI.FI buttons */}
          {(props.groupMessage.extra?.yellow ||
            props.groupMessage.extra?.lifi) && (
            <>
              <Separator className="mt-4" />
              <div className="flex flex-row gap-2 mt-4">
                {/* Yellow button */}
                {props.groupMessage.extra?.yellow && (
                  <GroupMessageYellowMessageSignDrawer
                    group={props.group}
                    groupMessage={props.groupMessage}
                  />
                )}
                {/* LI.FI button */}
                {props.groupMessage.extra?.lifi && (
                  <Link
                    href={props.groupMessage.extra.lifi.transactionLink}
                    target="_blank"
                  >
                    <Button variant="outline">
                      <SquareArrowOutUpRightIcon /> Transaction
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
