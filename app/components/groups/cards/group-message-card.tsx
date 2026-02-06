import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Group } from "@/mongodb/models/group";
import { GroupMessage } from "@/types/group";
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
          {/* Creator ENS name, created */}
          <div>
            <p className="font-bold">{props.groupMessage.creatorEnsName}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(props.groupMessage.created).toLocaleString()}
            </p>
          </div>
          {/* Content */}
          <div className="text-sm mt-2">
            <p className="whitespace-pre-wrap">{props.groupMessage.content}</p>
          </div>
          {/* Separator for Yellow buttons */}
          {props.groupMessage.extra?.yellow && <Separator className="mt-4" />}
          {/* Yellow buttons */}
          {props.groupMessage.extra?.yellow && (
            <GroupMessageYellowMessageSignDrawer
              group={props.group}
              groupMessage={props.groupMessage}
              className="mt-4"
            />
          )}
        </div>
      </div>
    </div>
  );
}
